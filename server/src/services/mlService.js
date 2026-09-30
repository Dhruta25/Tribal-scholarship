import { calculateAge } from './rulesEngine.js';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import Application from '../models/Application.js';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');
const scriptPath = path.join(projectRoot, 'ml/scripts/predict_api.py');

/**
 * Executes Python ML Inference on an application payload
 */
export const runMLPrediction = async (payload) => {
  return new Promise((resolve, reject) => {
    const jsonStr = JSON.stringify(payload);
    
    execFile(process.env.PYTHON_BIN || 'python3', [scriptPath, jsonStr], { cwd: projectRoot, timeout: 20000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        // Fallback to internal heuristic if Python fails
        console.warn('[ML Service] Python execution warning:', stderr || error.message);
        return resolve(fallbackMLInference(payload));
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (parseErr) {
        console.warn('[ML Service] Parse error on ML output, using fallback');
        resolve(fallbackMLInference(payload));
      }
    });
  });
};

/**
 * Predicts ML metrics for a specific DB Application ID
 */
export const predictApplicationById = async (applicationId) => {
  const app = await Application.findById(applicationId)
    .populate('applicantId')
    .populate('schemeId');

  if (!app) {
    throw Object.assign(new Error('Application not found'), { status: 404 });
  }

  const docs = await Document.find({ applicationId });
  const casteDoc = docs.find(d => d.docKey === 'caste_certificate');
  const incomeDoc = docs.find(d => d.docKey === 'income_certificate');
  const marksDoc = docs.find(d => d.docKey === 'marksheet');

  const payload = {
    scheme_code: app.schemeId?.code || 'ARG45',
    age: calculateAge(app.applicantId?.profile?.dob),
    gender: app.applicantId?.profile?.gender || 'female',
    state: app.applicantId?.profile?.state || 'Jharkhand',
    education_level: app.applicantId?.profile?.education?.level || 'masters',
    marks_percent: Number(app.formData?.marksPercent || app.applicantId?.profile?.education?.marksPercent || 75.0),
    family_income: Number(app.formData?.familyIncome || app.applicantId?.profile?.familyIncome || 250000),
    nirf_rank: 50,
    qs_rank: app.schemeId?.code === 'AZKMI' ? 120 : 999,
    has_admission_offer: true,
    is_pwd: Boolean(app.applicantId?.profile?.disability),
    pwd_percent: Number(app.applicantId?.profile?.disabilityPercent || 0),
    ocr_caste_ok: casteDoc?.ocrStatus === 'done',
    ocr_income_ok: incomeDoc?.ocrStatus === 'done',
    ocr_academic_ok: marksDoc?.ocrStatus === 'done',
    ocr_text_similarity: 0.96,
    income_discrepancy_ratio: 1.0,
    marks_discrepancy: 0.0,
    duplicate_cert_count: 1,
    duplicate_bank_count: 1,
    fuzzy_name_match_score: 0.98
  };

  const mlResult = await runMLPrediction(payload);
  return {
    applicationNo: app.applicationNo,
    scheme: app.schemeId?.name,
    applicantName: app.applicantId?.name,
    mlResult
  };
};

/**
 * Fallback ML inference engine if Python is unavailable
 */
function fallbackMLInference(data) {
  const marks = Number(data.marks_percent ?? 0);
  const income = Number(data.family_income ?? 0);
  const isEligible = marks >= 50.0 && income <= 600000;

  return {
    source: 'heuristic',
    warning: 'The trained ML model is unavailable. These are advisory heuristic estimates.',
    eligibility: {
      decision: isEligible ? 'Eligible' : 'Ineligible',
      confidence: null,
      status_tag: isEligible ? 'Auto-Approve Candidate' : 'Flagged Ineligible'
    },
    merit_assessment: {
      predicted_merit_score: Math.min(100, Math.round(marks * 0.7 + (income <= 250000 ? 25 : 15))),
      estimated_national_percentile: null,
      seat_allocation_prospect: marks >= 70 ? 'High' : 'Moderate'
    },
    fraud_risk_assessment: {
      fraud_risk_score: null,
      risk_level: 'Not evaluated',
      is_statistical_anomaly: false,
      confidence_passed: false
    },
    recommendation: {
      top_scheme_match: data.scheme_code || 'ARG45',
      reason: 'Rule heuristic match'
    }
  };
}
