import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Document from '../models/Document.js';
import Application from '../models/Application.js';
import Deficiency from '../models/Deficiency.js';
import { processDocumentAsync } from '../services/ocrService.js';

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const checkAccess = (req, app, editing = false) => {
  if (!app) fail(404, 'Application not found.');
  const owner = String(app.applicantId?._id || app.applicantId) === String(req.user._id);
  if ((editing && (!owner || req.user.role !== 'applicant')) || (req.user.role === 'applicant' && !owner)) fail(403, 'Access denied.');
  if (editing && !['DRAFT', 'DEFICIENT', 'UNDER_VERIFICATION'].includes(app.status)) fail(409, 'Documents cannot be changed at this application stage.');
};
const requirementFor = (app, key, file) => {
  const requirement = app.schemeId?.requiredDocuments?.find(item => item.key === key);
  if (!requirement) fail(400, 'This document type is not part of the selected scheme.');
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  if (requirement.acceptedTypes.length && !requirement.acceptedTypes.map(type => type === 'jpeg' ? 'jpg' : type).includes(ext === 'jpeg' ? 'jpg' : ext)) fail(400, 'This file type is not accepted for this document.');
};
const replaceFile = async (doc, file) => {
  const oldPath = doc.storedPath;
  Object.assign(doc, {
    originalName: file.originalname, storedPath: file.path, mimeType: file.mimetype,
    fileData: (await fs.promises.readFile(file.path)).toString('base64'),
    ocrStatus: 'pending', ocrRawText: '', ocrExtracted: {}, sha256: '', detectedDocType: 'unknown',
    confidence: 0, mismatches: [], verificationStatus: 'needs_review',
    verifiedBy: null, verifiedAt: null, officerRemark: '', uploadedAt: new Date()
  });
  await doc.save();
  if (oldPath && oldPath !== file.path) await fs.promises.unlink(oldPath).catch(() => {});
};
const enqueue = id => setImmediate(() => processDocumentAsync(id).catch(error => console.error('[OCR job]:', error.message)));

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) fail(400, 'Select a file to upload.');
    const { appId } = req.params;
    const { docKey } = req.body;
    if (typeof docKey !== 'string' || !docKey) fail(400, 'docKey is required.');
    const app = await Application.findById(appId).populate('schemeId');
    checkAccess(req, app, true);
    requirementFor(app, docKey, req.file);
    let doc = await Document.findOne({ applicationId: appId, docKey });
    if (doc?.ocrStatus === 'pending') fail(409, 'This document is still processing. Please wait before replacing it.');
    if (!doc) doc = new Document({ applicationId: appId, docKey });
    await replaceFile(doc, req.file);
    enqueue(doc._id);
    res.status(201).json({ success: true, message: 'Document uploaded. OCR processing has started.', document: doc });
  } catch (error) { next(error); }
};

export const getDocumentStatus = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) fail(404, 'Document not found.');
    checkAccess(req, await Application.findById(doc.applicationId));
    res.json({ success: true, document: doc });
  } catch (error) { next(error); }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) fail(404, 'Document not found.');
    const app = await Application.findById(doc.applicationId);
    checkAccess(req, app, true);
    if (app.status !== 'DRAFT') fail(409, 'Submitted documents must be replaced through the deficiency workflow.');
    if (doc.ocrStatus === 'pending') fail(409, 'Wait for OCR processing to finish before deleting this document.');
    await doc.deleteOne();
    await Deficiency.deleteMany({ applicationId: app._id, docKey: doc.docKey });
    if (doc.storedPath) await fs.promises.unlink(doc.storedPath).catch(() => {});
    res.json({ success: true, message: 'Document deleted.' });
  } catch (error) { next(error); }
};

export const reuploadDocument = async (req, res, next) => {
  try {
    if (!req.file) fail(400, 'Select a replacement file.');
    let doc = await Document.findById(req.params.id);
    let deficiency = req.body.deficiencyId ? await Deficiency.findById(req.body.deficiencyId) : null;
    if (!doc && !deficiency) deficiency = await Deficiency.findById(req.params.id);
    if (!doc && deficiency) doc = await Document.findOne({ applicationId: deficiency.applicationId, docKey: deficiency.docKey });
    if (!doc && deficiency) doc = new Document({ applicationId: deficiency.applicationId, docKey: deficiency.docKey });
    if (!doc) fail(404, 'Document record not found.');
    const app = await Application.findById(doc.applicationId).populate('schemeId');
    checkAccess(req, app, true);
    if (req.body.deficiencyId && !deficiency) fail(404, 'Deficiency not found.');
    if (deficiency && (String(deficiency.applicationId) !== String(app._id) || deficiency.docKey !== doc.docKey || deficiency.status !== 'open')) fail(400, 'This deficiency does not match the document or is already resolved.');
    if (!doc.isNew && doc.ocrStatus === 'pending') fail(409, 'Wait for the current OCR scan to finish.');
    requirementFor(app, doc.docKey, req.file);
    await replaceFile(doc, req.file);
    enqueue(doc._id);
    res.json({ success: true, message: 'Replacement uploaded and queued for verification.', document: doc });
  } catch (error) { next(error); }
};

export const serveDocumentFile = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).select('+fileData');
    if (!doc) fail(404, 'Document not found.');
    checkAccess(req, await Application.findById(doc.applicationId));
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.type(doc.mimeType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName || 'document')}"`);
    if (doc.fileData) return res.send(Buffer.from(doc.fileData.includes(',') ? doc.fileData.split(',')[1] : doc.fileData, 'base64'));
    const serverRoot = fileURLToPath(new URL('../../', import.meta.url));
    const base = path.basename(doc.storedPath || doc.originalName);
    const candidates = [doc.storedPath, path.join(serverRoot, 'uploads/samples', base), path.join(serverRoot, 'src/assets/sample_docs', base)].filter(Boolean);
    for (const file of candidates) {
      const resolved = path.resolve(file);
      if (!resolved.startsWith(serverRoot)) continue;
      const stat = await fs.promises.stat(resolved).catch(() => null);
      if (stat?.isFile()) return res.sendFile(resolved);
    }
    fail(404, 'The original file is unavailable. Please upload it again.');
  } catch (error) { next(error); }
};
