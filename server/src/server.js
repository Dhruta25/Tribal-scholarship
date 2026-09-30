import './config/env.js';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { initReminderService } from './services/reminderService.js';

try {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('your_super_secret'))) {
    throw new Error('Set a unique JWT_SECRET of at least 32 characters in production.');
  }
  await connectDB();
  const port = Number(process.env.PORT || 5001);
  const server = app.listen(port, () => console.log(`Scholarship API ready at http://localhost:${port}/api`));
  const stopReminders = initReminderService();
  server.on('error', async error => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : error.message);
    stopReminders();
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  const shutdown = () => {
    stopReminders();
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error(`Backend startup failed: ${error.message}`);
  process.exitCode = 1;
}
