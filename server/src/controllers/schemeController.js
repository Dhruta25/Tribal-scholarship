import Scheme from '../models/Scheme.js';
import Application from '../models/Application.js';
import AuditLog from '../models/AuditLog.js';
import { testRulesAgainstApplications } from '../services/rulesEngine.js';
import mongoose from 'mongoose';

const FALLBACK_SCHEMES_LIST = [
  {
    _id: 'scheme_bpvgk',
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
    category: 'Central Scheme',
    level: '10th',
    openDate: '2026-04-01',
    closeDate: '2026-11-30',
    totalSeats: 50000,
    stipendAmountPerYear: 3500,
    isActive: true,
    description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools to minimize transition dropouts.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 250000, message: 'Annual family income must not exceed ₹250,000' },
      { field: 'education_level', operator: 'in', value: ['Class 9th', 'Class 10th', '10th'], message: 'Must be currently enrolled in Class IX or X' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number', 'issuing_authority'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'financial_year'] },
      { label: 'School Marksheet / Enrollment Proof', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['school_name', 'class_enrolled'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.60, income: 0.40 }
  },
  {
    _id: 'scheme_bvobc',
    code: 'BVOBC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    category: 'Central Scheme',
    level: '12th',
    openDate: '2026-04-01',
    closeDate: '2026-12-31',
    totalSeats: 75000,
    stipendAmountPerYear: 14000,
    isActive: true,
    description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) to provide financial assistance to Scheduled Tribe students pursuing post-secondary courses.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 250000, message: 'Annual family income must not exceed ₹250,000' },
      { field: 'education_level', operator: 'in', value: ['11th', '12th', 'Diploma', 'higher_secondary'], message: 'Must be pursuing post-matric / diploma study' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income', 'applicant_name'] },
      { label: '10th / 12th Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['total_percentage', 'roll_number'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.70, income: 0.30 }
  },
  {
    _id: 'scheme_a023b',
    code: 'A023B',
    name: 'Top Class Education for ST Students',
    category: 'Central Scheme',
    level: 'bachelors',
    openDate: '2026-05-01',
    closeDate: '2026-11-15',
    totalSeats: 1000,
    stipendAmountPerYear: 240000,
    isActive: true,
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement, living allowance (Rs. 3,000/month), and a one-time computer grant for ST scholars in premier institutes.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 600000, message: 'Annual family income must not exceed ₹600,000' },
      { field: 'institute_type', operator: '==', value: 'Premier Institute', message: 'Must be admitted to a notified Top Class institute (IIT/IIM/NIT/AIIMS)' }
    ],
    requiredDocuments: [
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category', 'certificate_number'] },
      { label: 'Income Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 12, ocrFields: ['annual_income'] },
      { label: 'Admission Fee Receipt & Allotment Letter', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 6, ocrFields: ['institute_name', 'course_fee'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.80, income: 0.20 }
  },
  {
    _id: 'scheme_azkmi',
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    category: 'Central Scheme',
    level: 'masters',
    openDate: '2026-03-01',
    closeDate: '2026-10-31',
    totalSeats: 40,
    stipendAmountPerYear: 1800000,
    isActive: true,
    description: 'Central Sector Scheme providing financial assistance to selected Scheduled Tribe students for pursuing Master\'s, Ph.D., and Post-Doctoral research abroad.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 600000, message: 'Annual family income must not exceed ₹600,000' },
      { field: 'marks_percentage', operator: '>=', value: 60.0, message: 'Must have achieved at least 60% in qualifying degree' }
    ],
    requiredDocuments: [
      { label: 'Foreign University Offer Letter (QS Top 500)', acceptedTypes: ['pdf'], maxAgeMonths: 6, ocrFields: ['university_name', 'course_title'] },
      { label: 'Passport First & Last Page', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['passport_number', 'expiry_date'] },
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.50, research_proposal: 0.30, income: 0.20 }
  },
  {
    _id: 'scheme_arg45',
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    category: 'Central Scheme',
    level: 'phd',
    openDate: '2026-04-01',
    closeDate: '2026-11-30',
    totalSeats: 750,
    stipendAmountPerYear: 420000,
    isActive: true,
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes in Indian Universities.',
    eligibilityRules: [
      { field: 'category', operator: '==', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'family_income', operator: '<=', value: 800000, message: 'Annual family income must not exceed ₹800,000' },
      { field: 'degree_level', operator: 'in', value: ['Master\'s', 'M.Phil', 'Ph.D.'], message: 'Must be admitted to M.Phil or Ph.D. research programme' }
    ],
    requiredDocuments: [
      { label: 'Ph.D. Registration / Admission Certificate', acceptedTypes: ['pdf'], maxAgeMonths: 12, ocrFields: ['university_name', 'registration_number'] },
      { label: 'Post-Graduation Degree Marksheet', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['aggregate_percentage'] },
      { label: 'ST Caste Certificate', acceptedTypes: ['pdf', 'jpg', 'png'], maxAgeMonths: 0, ocrFields: ['caste_category'] }
    ],
    reservationQuota: { female: 0.30, disability: 0.04, pvtg: 0.05 },
    meritWeights: { marks: 0.60, research_synopsis: 0.40 }
  }
];

export const getSchemes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.level && req.query.level !== 'all') {
      const lvl = req.query.level;
      let levelMatches = [lvl];
      if (lvl === 'bachelors' || lvl === 'undergraduate') {
        levelMatches = ['bachelors', 'undergraduate'];
      } else if (lvl === '12th' || lvl === 'higher_secondary') {
        levelMatches = ['12th', 'higher_secondary'];
      } else if (lvl === '10th' || lvl === 'secondary') {
        levelMatches = ['10th', 'secondary'];
      } else if (lvl === 'phd' || lvl === 'research') {
        levelMatches = ['phd', 'research'];
      }
      filter.level = { $in: levelMatches };
    }
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    let schemes = await Scheme.find(filter).sort({ createdAt: -1 });

    if (!schemes || schemes.length === 0) {
      schemes = FALLBACK_SCHEMES_LIST.filter(s => {
        if (req.query.level && req.query.level !== 'all') {
          const lvl = req.query.level;
          if (lvl === 'bachelors' || lvl === 'undergraduate') return ['bachelors', 'undergraduate'].includes(s.level);
          if (lvl === '12th' || lvl === 'higher_secondary') return ['12th', 'higher_secondary'].includes(s.level);
          if (lvl === '10th' || lvl === 'secondary') return ['10th', 'secondary'].includes(s.level);
          if (lvl === 'phd' || lvl === 'research') return ['phd', 'research'].includes(s.level);
          return s.level === lvl;
        }
        return true;
      });
    }

    res.json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    next(error);
  }
};

export const getSchemeById = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let scheme = null;

    if (mongoose.Types.ObjectId.isValid(paramId)) {
      scheme = await Scheme.findById(paramId);
    }

    if (!scheme) {
      scheme = await Scheme.findOne({ code: paramId.toUpperCase() });
    }

    if (!scheme) {
      scheme = FALLBACK_SCHEMES_LIST.find(
        s => s._id === paramId || s.code.toLowerCase() === paramId.toLowerCase()
      );
    }

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    res.json({ success: true, scheme });
  } catch (error) {
    // If mongo error, fallback gracefully
    const fallback = FALLBACK_SCHEMES_LIST.find(
      s => s._id === req.params.id || s.code.toLowerCase() === req.params.id.toLowerCase()
    );
    if (fallback) {
      return res.json({ success: true, scheme: fallback });
    }
    next(error);
  }
};

export const createScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create(req.body);

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_SCHEME',
      entityType: 'Scheme',
      entityId: scheme._id.toString(),
      after: scheme.toObject(),
      reason: `Created new scheme ${scheme.name} (${scheme.code})`,
      ip: req.ip || '127.0.0.1'
    });

    res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme });
  } catch (error) {
    next(error);
  }
};

export const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    const beforeState = scheme.toObject();
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await AuditLog.create({
      actorId: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UPDATE_SCHEME_RULES',
      entityType: 'Scheme',
      entityId: scheme._id.toString(),
      before: beforeState,
      after: updated.toObject(),
      reason: req.body.updateReason || `Updated configuration and rules for scheme ${scheme.code}`,
      ip: req.ip || '127.0.0.1'
    });

    res.json({ success: true, message: 'Scheme rules updated successfully.', scheme: updated });
  } catch (error) {
    next(error);
  }
};

export const testRules = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eligibilityRules } = req.body;

    let rulesToTest = eligibilityRules;
    if (!rulesToTest) {
      const scheme = await Scheme.findById(id);
      if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
      rulesToTest = scheme.eligibilityRules;
    }

    const applications = await Application.find({ schemeId: id }).populate('applicantId');
    const simulationResult = testRulesAgainstApplications(rulesToTest, applications);

    res.json({
      success: true,
      simulation: simulationResult
    });
  } catch (error) {
    next(error);
  }
};

