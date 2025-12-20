import express from 'express';
import dotenv from 'dotenv';
import whatsappRoutes from './routes/whatsapp.js';
import calendarRoutes from './routes/calendar.js';
import paymentRoutes from './routes/payment.js';
import matchingRoutes from './routes/matching.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/api/whatsapp/webhook`);
});

