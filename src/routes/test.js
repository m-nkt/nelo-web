import express from 'express';

const router = express.Router();

/**
 * Simple test endpoint (no authentication required)
 */
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

/**
 * Test endpoint with server info
 */
router.get('/info', (req, res) => {
  res.json({
    server: 'Language Matching Service',
    version: '1.0.0',
    status: 'running',
    port: process.env.PORT || 3000,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

