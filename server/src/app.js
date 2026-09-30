import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import './config/env.js';
import mongoose from 'mongoose';

import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import verifierRoutes from './routes/verifierRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import disbursementRoutes from './routes/disbursementRoutes.js';
import mlRoutes from './routes/mlRoutes.js';


const app = express();


// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if ((process.env.CLIENT_URL || '').split(',').map(value => value.trim()).includes(origin)) {
      return callback(null, true);
    }
    return callback(Object.assign(new Error('This origin is not allowed.'), { status: 403 }));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Uploaded applicant files are served through authenticated document routes.

// Health Check
app.get('/api/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'online' : 'unavailable',
    database: ready ? 'connected' : 'disconnected',
    service: 'MoTA Scholarship & Fellowship Management System API',
    ps: 'SIH PS 26239',
    timestamp: new Date().toISOString()
  });
});

// Do not buffer requests indefinitely while MongoDB is unavailable.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again shortly.' });
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disbursements', disbursementRoutes);
app.use('/api/ml', mlRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'API route not found.' }));

// Central Error Handler
app.use(errorHandler);


export default app;
