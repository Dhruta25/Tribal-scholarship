import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Application from '../models/Application.js';
import { evaluate } from '../services/rulesEngine.js';
import { recommendSchemesForUser } from '../services/recommendService.js';

const FALLBACK_SCHEMES = [
  {
    _id: 'scheme_arg45',
    code: 'ARG45',
    name: 'National Fellowship for ST Students (NFST)',
    level: 'phd',
    description: 'Central Sector Scheme providing financial fellowship to Scheduled Tribe students pursuing M.Phil and Ph.D. research programmes.',
    totalSeats: 750,
    eligibilityRules: [
      { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'familyIncome', operator: 'lte', value: 800000, message: 'Total annual family income must not exceed Rs 8,00,000' },
      { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% aggregate marks required in Master degree' }
    ]
  },
  {
    _id: 'scheme_azkmi',
    code: 'AZKMI',
    name: 'National Overseas Scholarship for ST Students (NOS)',
    level: 'masters',
    description: 'Central Sector Scheme providing financial assistance for Master\'s and Ph.D. in Top 500 QS World Ranking foreign Universities.',
    totalSeats: 20,
    eligibilityRules: [
      { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'familyIncome', operator: 'lte', value: 600000, message: 'Family income must not exceed Rs 6,00,000 per annum' },
      { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% marks required in qualifying degree' }
    ]
  },
  {
    _id: 'scheme_a023b',
    code: 'A023B',
    name: 'Top Class Education for ST Students',
    level: 'undergraduate',
    description: 'Central Sector Scheme providing full institute tuition fee reimbursement in 265+ premier institutions (IITs, IIMs, AIIMS, NITs).',
    totalSeats: 1000,
    eligibilityRules: [
      { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'familyIncome', operator: 'lte', value: 600000, message: 'Family income must not exceed Rs 6,00,000 per annum' },
      { field: 'marksPercent', operator: 'gte', value: 55, message: 'Minimum 55% aggregate marks required' }
    ]
  },
  {
    _id: 'scheme_bvobc',
    code: 'BVOBC',
    name: 'Post-Matric Scholarship Scheme for ST Students',
    level: 'higher_secondary',
    description: 'Centrally Sponsored Scheme delivered via Direct Benefit Transfer (DBT) for ST students in Classes 11th, 12th, ITI, Diploma, Undergraduate.',
    totalSeats: 50000,
    eligibilityRules: [
      { field: 'category', operator: 'equals', value: 'ST', message: 'Applicant must belong to Scheduled Tribe (ST)' },
      { field: 'familyIncome', operator: 'lte', value: 250000, message: 'Family income must not exceed Rs 2,50,000 per annum' },
      { field: 'marksPercent', operator: 'gte', value: 45, message: 'Must have passed previous annual examination' }
    ]
  },
  {
    _id: 'scheme_bpvgk',
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship Scheme for ST Students (Class IX & X)',
    level: '10th',
    description: 'Centrally Sponsored Scheme to support ST students studying in Classes IX and X in Government or recognized schools.',
    totalSeats: 100000,
    eligibilityRules: [
      { field: 'category', operator: 'equals', value: 'ST', message: 'Student must belong to Scheduled Tribe (ST)' },
      { field: 'familyIncome', operator: 'lte', value: 250000, message: 'Annual family income must not exceed Rs 2,50,000' },
      { field: 'marksPercent', operator: 'gte', value: 40, message: 'Must have passed previous annual school exam' }
    ]
  }
];

/**
 * Public eligibility check endpoint (no login required)
 * Never outputs a bare verdict; shows exact criteria breakdown.
 */
export const checkEligibility = async (req, res, next) => {
  try {
    const { schemeId, schemeCode, category = 'ST', educationLevel, course, marksPercent = 0, familyIncome = 0, age = 22, country } = req.body;

    let scheme = null;
    try {
      if (schemeId) {
        scheme = await Scheme.findById(schemeId);
      } else if (schemeCode) {
        scheme = await Scheme.findOne({ code: schemeCode.toUpperCase(), isActive: true });
      } else {
        scheme = await Scheme.findOne({ isActive: true });
      }
    } catch (e) {
      scheme = null;
    }

    if (!scheme) {
      const searchCode = (schemeCode || '').toUpperCase();
      scheme = FALLBACK_SCHEMES.find(s => s.code === searchCode || s._id === schemeId) || FALLBACK_SCHEMES[0];
    }

    const context = {
      category,
      educationLevel,
      course,
      marksPercent: Number(marksPercent),
      familyIncome: Number(familyIncome),
      age: Number(age),
      country
    };

    const evalResult = evaluate(scheme, context);

    // If ineligible, check and suggest other schemes that this profile DOES satisfy
    let alternativeSchemes = [];
    if (!evalResult.passed) {
      let allSchemes = [];
      try {
        allSchemes = await Scheme.find({ _id: { $ne: scheme._id }, isActive: true });
      } catch (e) {
        allSchemes = [];
      }
      if (!allSchemes || allSchemes.length === 0) {
        allSchemes = FALLBACK_SCHEMES.filter(s => s.code !== scheme.code);
      }

      for (const other of allSchemes) {
        const otherEval = evaluate(other, context);
        if (otherEval.passed) {
          alternativeSchemes.push({
            id: other._id,
            code: other.code,
            name: other.name,
            level: other.level,
            description: other.description
          });
        }
      }
    }

    const failedCount = evalResult.results.filter(r => !r.passed).length;
    const passedCount = evalResult.results.filter(r => r.passed).length;

    res.json({
      success: true,
      scheme: {
        id: scheme._id,
        code: scheme.code,
        name: scheme.name,
        level: scheme.level,
        description: scheme.description,
        totalSeats: scheme.totalSeats
      },
      isEligible: evalResult.passed,
      summary: evalResult.passed
        ? `Eligible for ${scheme.code}. All ${passedCount} criteria satisfied.`
        : `Not eligible for ${scheme.code}. ${failedCount} criterion/criteria not met.`,
      criteriaResults: evalResult.results,
      alternativeSchemes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logged-in applicant recommendation endpoint
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Fetch any previously uploaded documents across user's applications
    const userApps = await Application.find({ applicantId: user._id });
    const appIds = userApps.map(a => a._id);
    const uploadedDocs = await Document.find({ applicationId: { $in: appIds } });
    const uploadedDocKeys = uploadedDocs.map(d => d.docKey);

    const recommendations = await recommendSchemesForUser(user.profile || {}, uploadedDocKeys);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
