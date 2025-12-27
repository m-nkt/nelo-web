import express from 'express';
import { autoMatchAllUsers } from '../services/autoMatching.js';
import { sendReminders, autoCancelNoResponse } from '../services/reminder.js';
import { getAllUsers } from '../db/users.js';
import { getUserAppointments } from '../db/appointments.js';

const router = express.Router();

// Simple admin authentication (in production, use proper authentication)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'change-this-in-production';

function authenticateAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

/**
 * Trigger manual matching
 */
router.post('/matching/trigger', authenticateAdmin, async (req, res) => {
  try {
    await autoMatchAllUsers();
    res.json({ message: 'Automatic matching triggered successfully' });
  } catch (error) {
    console.error('Error triggering matching:', error);
    res.status(500).json({ error: 'Error triggering matching' });
  }
});

/**
 * Trigger reminders
 */
router.post('/reminders/trigger', authenticateAdmin, async (req, res) => {
  try {
    await sendReminders();
    res.json({ message: 'Reminders sent successfully' });
  } catch (error) {
    console.error('Error triggering reminders:', error);
    res.status(500).json({ error: 'Error triggering reminders' });
  }
});

/**
 * Trigger auto-cancel
 */
router.post('/cancel/trigger', authenticateAdmin, async (req, res) => {
  try {
    await autoCancelNoResponse();
    res.json({ message: 'Auto-cancel check completed' });
  } catch (error) {
    console.error('Error triggering auto-cancel:', error);
    res.status(500).json({ error: 'Error triggering auto-cancel' });
  }
});

/**
 * Get all users
 */
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Error getting users' });
  }
});

/**
 * Get all appointments
 */
router.get('/appointments', authenticateAdmin, async (req, res) => {
  try {
    const appointments = await getUserAppointments(null);
    res.json({ appointments, count: appointments.length });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ error: 'Error getting appointments' });
  }
});

/**
 * Get statistics
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Check if database is configured
    const { isServiceConfigured } = await import('../utils/env-check.js');
    if (!isServiceConfigured('database')) {
      return res.status(503).json({ 
        error: 'Database is not configured',
        message: 'Please set SUPABASE_URL and SUPABASE_KEY in .env file',
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalAppointments: 0,
          confirmedAppointments: 0,
          pendingAppointments: 0,
          cancelledAppointments: 0,
          totalPoints: 0,
          note: 'Database not configured - showing zero values'
        }
      });
    }
    
    const users = await getAllUsers();
    const appointments = await getUserAppointments(null);
    
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.calendar_access_token).length,
      totalAppointments: appointments.length,
      confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      totalPoints: users.reduce((sum, u) => sum + (u.points_balance || 0), 0)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Error getting stats',
      message: error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
});

export default router;

