import '../src/config/env.js';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import { ensureSchemes } from '../src/seed/ensureSchemes.js';
try { await connectDB(); await ensureSchemes(); console.log('Missing schemes initialized; existing records preserved.'); }
catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
