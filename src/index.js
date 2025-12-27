// IMPORTANT: Load environment variables FIRST before any other imports
import './config/env.js';

import express from 'express';
import whatsappRoutes from './routes/whatsapp.js';
import calendarRoutes from './routes/calendar.js';
import paymentRoutes from './routes/payment.js';
import matchingRoutes from './routes/matching.js';
import adminRoutes from './routes/admin.js';
import testRoutes from './routes/test.js';
import { initializeScheduler } from './jobs/scheduler.js';
import { checkEnvironmentVariables, isServiceConfigured } from './utils/env-check.js';
import { isPortInUse, findAvailablePort } from './utils/port-check.js';

const app = express();
let PORT = parseInt(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', testRoutes); // Test routes (no auth required)

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with port conflict handling
async function startServer() {
  // Check if port is in use
  const portInUse = await isPortInUse(PORT);
  
  if (portInUse) {
    console.warn(`⚠️  Port ${PORT} is already in use.`);
    console.log('🔍 Looking for an available port...');
    
    const availablePort = await findAvailablePort(PORT + 1, 10);
    
    if (availablePort) {
      PORT = availablePort;
      console.log(`✅ Found available port: ${PORT}`);
    } else {
      console.error('❌ Could not find an available port. Please stop the process using port 3000.');
      process.exit(1);
    }
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
    console.log('');
    
    // Check all environment variables
    const envStatus = checkEnvironmentVariables();
    
    // Show service status
    console.log('📊 Service Status:');
    console.log(`   Database: ${isServiceConfigured('database') ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Twilio: ${isServiceConfigured('twilio') ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Gemini: ${isServiceConfigured('gemini') ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Google: ${isServiceConfigured('google') ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Stripe: ${isServiceConfigured('stripe') ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log('');
    
    // Initialize scheduled jobs
    if (process.env.NODE_ENV !== 'test') {
      initializeScheduler();
    }
  });
}

// Start the server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

