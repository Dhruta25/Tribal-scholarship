import Scheme from '../models/Scheme.js';
import { defaultSchemes } from './schemes.js';

// Insert missing catalog entries without replacing rules or deleting existing records.
export async function ensureSchemes() {
  for (const scheme of defaultSchemes()) {
    await Scheme.updateOne({ code: scheme.code }, { $setOnInsert: scheme }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
  }
}
