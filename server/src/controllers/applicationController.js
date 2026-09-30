import fs from 'fs';
import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';
import Document from '../models/Document.js';
import Deficiency from '../models/Deficiency.js';
import VerificationLog from '../models/VerificationLog.js';
import AuditLog from '../models/AuditLog.js';
import Disbursement from '../models/Disbursement.js';
import { evaluate, buildApplicantContext } from '../services/rulesEngine.js';
import { sendNotification } from '../services/notificationService.js';

export const createApplication = async (req, res, next) => {
  try {
    const { schemeId, formData = {} } = req.body;
    const applicantId = req.user._id;
    if (!schemeId) return res.status(400).json({ success: false, message: 'Select a scheme.' });
    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) return res.status(400).json({ success: false, message: 'Application form data must be an object.' });

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found.' });
    }

    if (!scheme.isActive || new Date() < scheme.openDate || new Date() > scheme.closeDate) {
      return res.status(400).json({ success: false, message: 'This scheme is currently not accepting new applications.' });
    }

    // Check if an open/draft application already exists for this applicant and scheme
    const existing = await Application.findOne({
      applicantId,
      schemeId,
      status: { $nin: ['REJECTED', 'COMPLETED'] }
    });

    if (existing) {
      if (existing.status === 'DRAFT') {
        // Automatically resume and update the existing draft
        existing.formData = {
          ...existing.formData,
          ...formData
        };
        await existing.save();
        return res.json({
          success: true,
          message: 'Existing draft resumed.',
          application: existing,
          resumed: true
        });
      }

      return res.status(400).json({
        success: false,
        message: `You already have an active submitted application (${existing.applicationNo} - Status: ${existing.status.replace(/_/g, ' ')}) for this scheme.`,
        applicationId: existing._id,
        applicationNo: existing.applicationNo,
        status: existing.status
      });
    }

    const applicationNo = await Application.generateApplicationNo(scheme.code);

    const application = await Application.create({
      applicantId,
      schemeId,
      applicationNo,
      formData,
      status: 'DRAFT',
      stageHistory: [{
        stage: 'DRAFT',
        by: req.user.name,
        remark: 'Application draft created by applicant.'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Draft application created successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

export const updateDraftApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { formData } = req.body;
    if (!formData || typeof formData !== 'object' || Array.isArray(formData)) return res.status(400).json({ success: false, message: 'Application form data must be an object.' });

    const application = await Application.findOne({ _id: id, applicantId: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Submitted applications cannot be modified in draft mode.' });
    }

    application.formData = {
      ...application.formData,
      ...formData
    };

    await application.save();

    res.json({
      success: true,
      message: 'Draft application updated.',
      application
    });
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, applicantId: req.user._id })
      .populate('schemeId')
      .populate('applicantId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Application has already been submitted.' });
    }

    const scheme = application.schemeId;
    const applicant = application.applicantId;
    if (!scheme || !scheme.isActive || new Date() < scheme.openDate || new Date() > scheme.closeDate) return res.status(400).json({ success: false, message: 'The application window for this scheme is closed.' });
    const fieldErrors = [];
    for (const field of scheme.formFields || []) {
      const value = application.formData?.[field.key];
      const empty = value === undefined || value === null || (typeof value === 'string' && !value.trim());
      if (field.required && (empty || (field.type === 'checkbox' && value !== true))) fieldErrors.push(`${field.label} is required`);
      if (!empty && field.type === 'number' && (!['string', 'number'].includes(typeof value) || !Number.isFinite(Number(value)))) fieldErrors.push(`${field.label} must be a number`);
      if (!empty && field.type === 'select' && !field.options.includes(value)) fieldErrors.push(`Select a valid ${field.label}`);
      if (!empty && field.type === 'date' && Number.isNaN(Date.parse(value))) fieldErrors.push(`${field.label} must be a date`);
      if (!empty && field.key === 'marksPercent' && (Number(value) < 0 || Number(value) > 100)) fieldErrors.push('Marks must be between 0 and 100');
      if (!empty && field.key === 'familyIncome' && Number(value) < 0) fieldErrors.push('Income cannot be negative');
    }
    if (fieldErrors.length) return res.status(400).json({ success: false, message: fieldErrors.join('. '), errors: fieldErrors });

    // Check if required documents are uploaded
    const docs = await Document.find({ applicationId: application._id });
    const uploadedDocKeys = docs.map(d => d.docKey);

    const missingDocs = (scheme.requiredDocuments || [])
      .filter(d => d.required)
      .filter(d => !uploadedDocKeys.includes(d.key));

    if (missingDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingDocs.map(d => d.label).join(', ')}. Please upload all mandatory documents before submitting.`,
        missingDocuments: missingDocs
      });
    }

    // Merge context for Rules Engine
    const context = buildApplicantContext(applicant.profile || {}, application.formData || {});

    // Run Rules Engine
    const evalResult = evaluate(scheme, context);
    application.eligibilityResult = evalResult;
    application.submittedAt = new Date();

    // Determine initial submission state
    const hasUnprocessedDocs = docs.some(d => d.ocrStatus === 'pending');
    const hasNeedsReviewDocs = docs.some(d => !['auto_ok', 'approved'].includes(d.verificationStatus) || d.ocrStatus === 'failed');

    const openDeficiencies = await Deficiency.countDocuments({ applicationId: application._id, status: 'open' });
    if (openDeficiencies > 0) {
      application.status = 'DEFICIENT';
    } else if (hasUnprocessedDocs) {
      application.status = 'OCR_PROCESSING';
    } else if (hasNeedsReviewDocs) {
      application.status = 'UNDER_VERIFICATION';
    } else {
      application.status = 'AUTO_VERIFIED';
    }

    application.stageHistory.push({
      stage: 'SUBMITTED',
      by: applicant.name,
      remark: 'Application officially submitted by candidate.'
    });

    application.stageHistory.push({
      stage: application.status,
      by: 'System',
      remark: 'Automated eligibility and OCR verification checks initiated.'
    });

    await application.save();

    // Audit Log
    await AuditLog.create({
      actorId: applicant._id,
      actorName: applicant.name,
      actorRole: 'applicant',
      action: 'SUBMIT_APPLICATION',
      entityType: 'Application',
      entityId: application._id.toString(),
      after: {
        applicationNo: application.applicationNo,
        status: application.status,
        eligibilityPassed: evalResult.passed
      },
      reason: `Application #${application.applicationNo} submitted for ${scheme.code}`,
      ip: req.ip || '127.0.0.1'
    });

    // Notification
    await sendNotification({
      userId: applicant._id,
      type: 'APPLICATION_SUBMITTED',
      templateKey: 'APPLICATION_SUBMITTED',
      templateParams: {
        appNo: application.applicationNo,
        schemeName: scheme.name
      },
      subject: `Application Submitted: ${application.applicationNo}`,
      body: `Your application for ${scheme.name} has been received. Tracking number: ${application.applicationNo}.`,
      link: `/applicant/applications/${application._id}`
    });

    res.json({
      success: true,
      message: 'Application submitted successfully.',
      application
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicantId: req.user._id })
      .populate('schemeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('schemeId')
      .populate('applicantId', '-passwordHash');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Role security check: applicants can only view their own
    if (req.user.role === 'applicant' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const documents = await Document.find({ applicationId: id }).sort({ createdAt: 1 });
    const deficiencies = await Deficiency.find({ applicationId: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      application,
      documents,
      deficiencies
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).select('applicationNo applicantId status stageHistory createdAt');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user.role === 'applicant' && String(application.applicantId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Access denied.' });

    res.json({
      success: true,
      applicationNo: application.applicationNo,
      currentStatus: application.status,
      timeline: application.stageHistory
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Only the applicant who owns the application or an admin can delete it
    if (req.user.role === 'applicant' && application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!['applicant', 'admin'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Only the applicant or an administrator can delete applications.' });
    if (req.user.role === 'applicant' && application.status !== 'DRAFT') return res.status(409).json({ success: false, message: 'Only draft applications can be deleted.' });

    // 1. Delete all documents & disk files for this application
    const documents = await Document.find({ applicationId: id });
    for (const doc of documents) {
      if (doc.storedPath && fs.existsSync(doc.storedPath)) {
        try { fs.unlinkSync(doc.storedPath); } catch {}
      }
    }
    await Document.deleteMany({ applicationId: id });

    // 2. Delete all Deficiencies for this application
    await Deficiency.deleteMany({ applicationId: id });

    // 3. Delete all VerificationLogs and Disbursements for this application
    await VerificationLog.deleteMany({ applicationId: id });
    await Disbursement.deleteMany({ applicationId: id });

    // 4. Log Audit
    try {
      await AuditLog.create({
        actorId: req.user._id,
        actorName: req.user.name,
        actorRole: req.user.role,
        action: 'APPLICATION_DELETED',
        entityType: 'Application',
        entityId: id,
        before: { applicationNo: application.applicationNo, status: application.status },
        reason: 'Application deleted by applicant/admin.',
        ip: req.ip || '127.0.0.1'
      });
    } catch {}

    // 5. Delete Application
    await Application.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Application #${application.applicationNo} and all associated documents were successfully deleted.`
    });
  } catch (error) {
    next(error);
  }
};
