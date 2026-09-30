import '../src/config/env.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { ensureSchemes } from '../src/seed/ensureSchemes.js';

if (process.env.NODE_ENV === 'production') throw new Error('dev:local is for local development only.');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih_scholarship';
const parsed = new URL(uri);
if (parsed.protocol !== 'mongodb:' || !['127.0.0.1', 'localhost'].includes(parsed.hostname)) throw new Error('dev:local requires a local MONGODB_URI. Use npm run dev for Atlas.');
const port = Number(parsed.port || 27017);
let mongo;
let child;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (child && child.exitCode === null) {
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill('SIGTERM');
    await exited;
  }
  await mongoose.disconnect();
  if (mongo) await mongo.stop({ doCleanup: false, force: false });
  process.exit(code);
}
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
try {
  try { await mongoose.connect(uri, { serverSelectionTimeoutMS: 1000 }); }
  catch {
    await mongoose.disconnect();
    const dbPath = fileURLToPath(new URL('../.local-data/mongodb', import.meta.url));
    await mkdir(dbPath, { recursive: true });
    mongo = new MongoMemoryServer({
      binary: { downloadDir: fileURLToPath(new URL('../.cache/mongodb', import.meta.url)) },
      instance: { port, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger' }
    });
    await mongo.start(true);
    await mongoose.connect(uri);
  }
  await ensureSchemes();
  await mongoose.disconnect();
  console.log('Local database ready. Records persist in server/.local-data/mongodb when managed here.');
  child = spawn(process.execPath, ['src/server.js'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit',
    env: { ...process.env, OTP_DELIVERY: process.env.OTP_DELIVERY || (process.env.EMAIL_USER && process.env.EMAIL_PASS ? 'email' : 'development') }
  });
  child.once('exit', code => stop(code || 0));
} catch (error) { console.error(error.message); await stop(1); }
