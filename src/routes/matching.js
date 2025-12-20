import express from 'express';
import { findMatches, createAppointment } from '../services/matching.js';

const router = express.Router();

/**
 * Find matches for a user
 */
router.post('/find', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const matches = await findMatches(phoneNumber);
    
    res.json({ matches });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Error finding matches' });
  }
});

/**
 * Create appointment
 */
router.post('/appointment', async (req, res) => {
  try {
    const { user1Phone, user2Phone, scheduledAt, duration } = req.body;
    
    if (!user1Phone || !user2Phone || !scheduledAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const appointment = await createAppointment(
      user1Phone,
      user2Phone,
      scheduledAt,
      duration || 15
    );
    
    res.json({ appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Error creating appointment' });
  }
});

export default router;

