import mongoose from 'mongoose';
import Scheme from '../models/Scheme.js';

const INITIAL_SCHEMES = [
  {
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities, IITs, NITs, and National Institutes.',
    level: 'phd',
    schemeType: 'Central Sector Scheme',
    benefitType: 'In Cash (DBT Monthly Stipend)',
    category: 'National Research Fellowship',
    isActive: true,
    totalSeats: 750,
    stipendAmountPerYear: 384000
  },
  {
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research programmes in Top 500 QS World Ranking foreign Universities.',
    level: 'masters',
    schemeType: 'Central Sector Scheme',
    benefitType: 'In Cash (Tuition Fee + Living Allowance Abroad)',
    category: 'International Overseas Scholarship',
    isActive: true,
    totalSeats: 20,
    stipendAmountPerYear: 1800000
  },
  {
    code: 'A023B',
    name: 'Top Class Education for ST Students',
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance, and laptop grant to ST students admitted into 265+ premier institutions (IITs, IIMs, AIIMS, NITs).',
    level: 'undergraduate',
    schemeType: 'Central Sector Scheme',
    benefitType: 'In Cash (Full Institute Fees + Living Allowance + Hardware Grant)',
    category: 'Premier Institution Scholarship',
    isActive: true,
    totalSeats: 1000,
    stipendAmountPerYear: 320000
  },
  {
    code: 'BVOBC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) for ST students in Classes 11th, 12th, ITI, Diploma, Undergraduate and Postgraduate courses.',
    level: 'higher_secondary',
    schemeType: 'Centrally Sponsored Scheme',
    benefitType: 'In Cash (DBT Maintenance Allowance & Compulsory Fees)',
    category: 'Centrally Sponsored Post-Matric',
    isActive: true,
    totalSeats: 50000,
    stipendAmountPerYear: 35000
  },
  {
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
    description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools to minimize transition drop-out rates.',
    level: '10th',
    schemeType: 'Centrally Sponsored Scheme',
    benefitType: 'In Cash (DBT School Allowance & Book Grant)',
    category: 'Centrally Sponsored Pre-Matric',
    isActive: true,
    totalSeats: 100000,
    stipendAmountPerYear: 7000
  }
];

const autoSeedIfEmpty = async () => {
  try {
    const count = await Scheme.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed]: Production database is empty. Seeding initial MoTA schemes...');
      await Scheme.insertMany(INITIAL_SCHEMES);
      console.log('[Auto-Seed]: Successfully seeded 5 initial MoTA schemes!');
    }
  } catch (err) {
    console.warn('[Auto-Seed Warning]: Could not auto-seed database:', err.message);
  }
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/sih_scholarship';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`[MongoDB Warning]: Database not connected (${error.message}). Running in fallback mode.`);
  }
};

export default connectDB;
