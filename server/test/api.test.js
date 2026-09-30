import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.OTP_DELIVERY = 'development';
process.env.JWT_SECRET = 'isolated-integration-test-secret-min-32-characters';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
const uploadDir = await mkdtemp(join(tmpdir(), 'tribal-scholar-test-'));
process.env.UPLOAD_DIR = uploadDir;
const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Scheme } = await import('../src/models/Scheme.js');
const { default: Application } = await import('../src/models/Application.js');
const { default: Document } = await import('../src/models/Document.js');
const { default: Deficiency } = await import('../src/models/Deficiency.js');
const { ensureSchemes } = await import('../src/seed/ensureSchemes.js');
let mongo, server, base;
const auth = {};
let applicantId, schemes, applicationId, documentId, deficiencyId, disbursementId;
const profile = { dob: '2000-01-01', gender: 'female', category: 'ST', state: 'Odisha', familyIncome: 0,
  education: { level: 'masters', marksPercent: 80, course: 'MSc', university: 'Test University' } };

async function request(method, route, body, token, expected = 200) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${base}${route}`, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, expected, `${method} ${route}: ${JSON.stringify(result)}`);
  return result;
}
const upload = (bytes, key, deficiency) => {
  const data = new FormData();
  data.append('file', new Blob([bytes], { type: 'application/pdf' }), 'certificate.pdf');
  if (key) data.append('docKey', key);
  if (deficiency) data.append('deficiencyId', deficiency);
  return data;
};
async function waitOcr(id) {
  for (let i = 0; i < 80; i++) {
    const { document } = await request('GET', `/documents/${id}/status`, null, auth.applicant);
    if (document.ocrStatus !== 'pending') return document;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail('OCR did not finish');
}
// A real text PDF, with a valid xref table, exercises pdf-parse through the HTTP upload route.
function textPdf(text) {
  const content = `BT /F1 12 Tf 50 750 Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`;
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

before(async () => {
  mongo = await MongoMemoryServer.create({ binary: { downloadDir: fileURLToPath(new URL('../.cache/mongodb', import.meta.url)) } });
  await mongoose.connect(mongo.getUri('tribal_scholar_integration'));
  await ensureSchemes();
  await Promise.all([User.init(), Scheme.init(), Application.init(), Document.init()]);
  server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}/api`;
  for (const role of ['admin', 'verifier', 'officer', 'officer2', 'other']) {
    await User.create({ name: `Test ${role}`, email: `${role}@example.test`, phone: '9876543210', passwordHash: 'Testing@123', isVerified: true, role: role === 'other' ? 'applicant' : role === 'officer2' ? 'officer' : role, profile });
    auth[role] = (await request('POST', '/auth/login', { email: `${role}@example.test`, password: 'Testing@123' })).token;
  }
}, { timeout: 300000 });

after(async () => {
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  await rm(uploadDir, { recursive: true, force: true });
});

test('signup, OTP, login, profile and staff access are connected and protected', async () => {
  await request('POST', '/auth/register', {}, null, 400);
  const registered = await request('POST', '/auth/register', { name: 'Test Scholar', email: ' Scholar@Example.test ', phone: '9876543210', password: 'Scholar@123', role: 'admin', profile }, null, 201);
  assert.match(registered.otpDebug, /^\d{6}$/);
  await request('POST', '/auth/login', { email: registered.email, password: 'Scholar@123' }, null, 403);
  await request('POST', '/auth/verify-otp', { email: registered.email, otp: '000000' }, null, 400);
  const resend = await request('POST', '/auth/resend-otp', { email: registered.email });
  const verified = await request('POST', '/auth/verify-otp', { email: registered.email, otp: resend.otpDebug });
  auth.applicant = verified.token; applicantId = verified.user._id;
  assert.equal(verified.user.role, 'applicant');
  for (const key of ['passwordHash', 'otp', 'otpExpiry']) assert.equal(key in verified.user, false);
  await request('POST', '/auth/verify-otp', { email: registered.email, otp: resend.otpDebug }, null, 400);
  await request('POST', '/auth/login', { email: registered.email, password: 'wrong' }, null, 401);
  const login = await request('POST', '/auth/login', { email: registered.email, password: 'Scholar@123' });
  assert.ok(login.token);
  const me = await request('GET', '/auth/me', null, auth.applicant);
  assert.equal(me.user.id, applicantId);
  const updated = await request('PUT', '/auth/profile', { profile: { education: { course: 'Physics' } } }, auth.applicant);
  assert.equal(updated.user.profile.education.marksPercent, 80);
  assert.equal(updated.user.profile.familyIncome, 0);
  assert.equal(updated.user.passwordHash, undefined);
  await request('GET', '/admin/users', null, auth.applicant, 403);
});

test('all five persisted schemes support public eligibility, aliases, filters and recommendations', async () => {
  const listing = await request('GET', '/schemes?active=true'); schemes = listing.schemes;
  assert.equal(schemes.length, 5);
  for (const scheme of schemes) {
    assert.match(scheme._id, /^[a-f\d]{24}$/);
    await request('GET', `/schemes/${scheme._id}`);
    await request('GET', `/schemes/${scheme.code}`);
    const input = { schemeId: scheme._id, category: 'ST', educationLevel: 'masters', marksPercent: 80, familyIncome: 0, age: 26 };
    const result = await request('POST', '/eligibility/check', input);
    assert.equal(typeof result.isEligible, 'boolean');
    assert.equal(result.criteriaResults.length, scheme.eligibilityRules.length);
    assert.equal(result.criteriaResults.find(item => item.field === 'familyIncome').actual, 0);
  }
  const good = await request('POST', '/eligibility/check', { schemeCode: 'NFST', applicantData: { category: 'ST', educationLevel: 'masters', marksPercent: 80, familyIncome: 0, age: 26 } });
  assert.equal(good.isEligible, true);
  const missing = await request('POST', '/eligibility/check', { schemeCode: 'ARG45', familyIncome: '', marksPercent: '', age: '' });
  assert.equal(missing.isEligible, false);
  await request('POST', '/eligibility/check', { schemeCode: 'ARG45', marksPercent: -1 }, null, 400);
  await request('POST', '/eligibility/check', {}, null, 400);
  await request('GET', '/schemes/not-found', null, null, 404);
  assert.equal((await request('GET', '/schemes?level=not-a-level')).count, 0);
  assert.equal((await request('GET', '/eligibility/recommend', null, auth.applicant)).recommendations.length, 5);
  await ensureSchemes(); assert.equal(await Scheme.countDocuments(), 5);
});

test('application drafts validate submission, ownership and application windows', async () => {
  const scheme = schemes.find(item => item.code === 'ARG45');
  await request('POST', '/applications', { schemeId: scheme._id }, auth.officer, 403);
  const created = await request('POST', '/applications', { schemeId: scheme._id }, auth.applicant, 201);
  applicationId = created.application._id;
  const resumed = await request('POST', '/applications', { schemeId: scheme._id }, auth.applicant);
  assert.equal(resumed.application._id, applicationId);
  await request('POST', `/applications/${applicationId}/submit`, {}, auth.applicant, 400);
  await request('GET', `/applications/${applicationId}`, null, auth.other, 403);
  await request('GET', `/applications/${applicationId}/timeline`, null, auth.other, 403);
  await request('GET', '/applications/invalid-id', null, auth.applicant, 400);
  await request('POST', `/officer/applications/${applicationId}/eligibility-decision`, { decision: 'ELIGIBLE', remarks: 'Invalid premature decision' }, auth.officer, 409);
  await request('PUT', `/applications/${applicationId}`, { formData: { researchTopic: 'Physics', university: 'Test University', course: 'Ph.D. Full Time', marksPercent: 80, familyIncome: 0, researchGuide: 'Guide' } }, auth.applicant);
  await request('POST', `/applications/${applicationId}/submit`, {}, auth.applicant, 400);
  assert.equal((await request('GET', '/applications/mine', null, auth.applicant)).count, 1);
});

test('multipart uploads, OCR, protected originals and deficiency replacement work', async () => {
  const beforeFiles = (await readdir(uploadDir)).length;
  await request('POST', `/documents/${applicationId}/upload`, upload('bad', 'caste_certificate'), auth.other, 403);
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal((await readdir(uploadDir)).length, beforeFiles);
  await request('POST', `/documents/${applicationId}/upload`, upload('bad', 'unknown_key'), auth.applicant, 400);
  const uploaded = await request('POST', `/documents/${applicationId}/upload`, upload('not a real PDF', 'caste_certificate'), auth.applicant, 201);
  documentId = uploaded.document._id;
  assert.equal(uploaded.document.fileData, undefined);
  assert.equal((await waitOcr(documentId)).ocrStatus, 'failed');
  await request('GET', `/documents/${documentId}/status`, null, auth.other, 403);
  await request('GET', `/documents/${documentId}/file`, null, null, 401);
  await request('GET', `/documents/${documentId}/file`, null, auth.other, 403);
  const original = await fetch(`${base}/documents/${documentId}/file`, { headers: { Authorization: `Bearer ${auth.applicant}` } });
  assert.equal(original.status, 200); assert.equal(await original.text(), 'not a real PDF');
  assert.equal(original.headers.get('cache-control'), 'private, no-store');
  for (const required of schemes.find(item => item.code === 'ARG45').requiredDocuments.filter(item => item.key !== 'caste_certificate')) {
    const doc = await request('POST', `/documents/${applicationId}/upload`, upload(textPdf(`Test Scholar ${required.label} Test University certificate number 12345 academic year 2026 annual income 0 marks 80 percent`), required.key), auth.applicant, 201);
    const processed = await waitOcr(doc.document._id);
    assert.equal(processed.ocrStatus, 'done', `PDF OCR failed for ${required.key}`);
  }
  const submitted = await request('POST', `/applications/${applicationId}/submit`, {}, auth.applicant);
  assert.equal(submitted.application.eligibilityResult.passed, true);
  await request('DELETE', `/applications/${applicationId}`, null, auth.applicant, 409);
  await request('PUT', `/applications/${applicationId}`, { formData: {} }, auth.applicant, 400);
  const def = await request('POST', `/verifier/applications/${applicationId}/deficiency`, { docKey: 'caste_certificate', reason: 'Upload the clear original' }, auth.verifier, 201);
  deficiencyId = def.deficiency._id;
  await request('POST', `/documents/${deficiencyId}/reupload`, upload(textPdf('Scheduled Tribe ST caste certificate Test Scholar issued by District Magistrate 2026 certificate number ST12345'), null, deficiencyId), auth.other, 403);
  const replacement = await request('POST', `/documents/${deficiencyId}/reupload`, upload(textPdf('Scheduled Tribe ST caste certificate Test Scholar issued by District Magistrate 2026 certificate number ST12345'), null, deficiencyId), auth.applicant);
  assert.equal(replacement.document._id, documentId);
  assert.equal((await waitOcr(documentId)).ocrStatus, 'done');
});

test('verifier, officer, merit publication and installment tracking complete the workflow', async () => {
  await request('GET', '/verifier/queue', null, auth.verifier);
  const detail = await request('GET', `/applications/${applicationId}`, null, auth.verifier);
  for (const doc of detail.documents) {
    await request('POST', `/verifier/documents/${doc._id}/decision`, { decision: 'approved', remark: 'Original verified manually' }, auth.verifier);
  }
  assert.equal((await Application.findById(applicationId)).status, 'UNDER_SCRUTINY');
  assert.equal(await Deficiency.countDocuments({ applicationId, status: 'open' }), 0);
  await request('GET', '/officer/scrutiny', null, auth.officer);
  await request('POST', `/officer/applications/${applicationId}/eligibility-decision`, { decision: 'ELIGIBLE', remarks: 'Checked all rules and originals' }, auth.officer);
  await request('POST', `/officer/applications/${applicationId}/recommend`, { remarks: 'Recommended by test committee' }, auth.officer);
  const schemeId = schemes.find(item => item.code === 'ARG45')._id;
  const merit = await request('GET', `/admin/merit/${schemeId}`, null, auth.officer);
  assert.equal(merit.provisionalList.length, 1);
  await request('POST', `/officer/merit/${schemeId}/publish`, { remarks: 'Test publication' }, auth.admin, 403);
  await request('POST', `/officer/merit/${schemeId}/publish`, { remarks: 'Test publication' }, auth.officer);
  const payments = await request('GET', '/disbursements/mine', null, auth.applicant);
  disbursementId = payments.disbursements[0]._id;
  await request('POST', `/disbursements/${disbursementId}/release`, { remarks: 'Test release' }, auth.officer, 403);
  await request('POST', `/disbursements/${disbursementId}/release`, { remarks: 'Test release' }, auth.officer2);
  await request('POST', `/disbursements/${disbursementId}/release`, { remarks: 'Duplicate' }, auth.officer2, 400);
  await request('POST', `/officer/merit/${schemeId}/publish`, { remarks: 'Duplicate' }, auth.officer, 409);
  const milestones = await request('GET', '/disbursements/mine', null, auth.applicant);
  assert.equal(milestones.disbursements.length, 2);
  const nextId = milestones.disbursements.find(item => item.installmentNo === 2)._id;
  await request('POST', `/disbursements/${nextId}/release`, {}, auth.officer2, 400);
  await request('POST', `/disbursements/${nextId}/report`, upload(textPdf('Progress report endorsed by research supervisor for Test Scholar and research activities 2026')), auth.applicant);
  await request('POST', `/disbursements/${nextId}/release`, { remarks: 'Second installment test' }, auth.officer2);
  assert.equal((await Application.findById(applicationId)).status, 'DISBURSING');
});

test('remaining frontend API endpoints return the expected data shapes', async () => {
  const routes = ['/dashboard/stats', '/dashboard/timeseries', '/dashboard/by-state', '/dashboard/funnel', '/admin/anomalies', '/admin/audit', '/admin/users', '/ml/model-info', '/disbursements'];
  for (const route of routes) assert.equal((await request('GET', route, null, auth.admin)).success, true, route);
  const notifications = await request('GET', '/notifications', null, auth.applicant);
  assert.ok(notifications.unreadCount > 0);
  await request('PUT', `/notifications/${notifications.notifications[0]._id}/read`, {}, auth.applicant);
  await request('PUT', '/notifications/all/read', {}, auth.applicant);
  assert.equal((await request('GET', '/notifications', null, auth.applicant)).unreadCount, 0);
  await request('POST', '/chatbot/message', { message: 'Which scholarship schemes can I apply for?' });
  await request('POST', `/schemes/${schemes[0]._id}/test-rules`, {}, auth.admin);
  await request('PUT', `/schemes/${schemes[0]._id}`, { description: schemes[0].description, updateReason: 'Integration check' }, auth.admin);
  await request('GET', '/missing-route', null, null, 404);
  await request('GET', '/health');
});

test('production never returns development OTPs and email failures are recoverable', async () => {
  process.env.NODE_ENV = 'production';
  try {
    const failed = await request('POST', '/auth/register', { name: 'Pending Scholar', email: 'pending@example.test', phone: '9876543210', password: 'Pending@123', profile }, null, 503);
    assert.equal(failed.code, 'OTP_DELIVERY_FAILED'); assert.equal(failed.otpDebug, undefined);
    await request('POST', '/auth/resend-otp', { email: 'pending@example.test' }, null, 503);
    assert.ok(await User.findOne({ email: 'pending@example.test', isVerified: false }));
  } finally { process.env.NODE_ENV = 'test'; }
  const pending = await User.findOne({ email: 'pending@example.test' });
  assert.equal(pending.isVerified, false);
});

test('expired codes cannot verify and concurrent drafts have distinct tracking numbers', async () => {
  const expired = await User.create({ name: 'Expired Account', email: 'expired@example.test', phone: '9876543210', passwordHash: 'Expired@123', otp: '123456', otpExpiry: new Date(Date.now() - 1000) });
  await request('POST', '/auth/verify-otp', { email: expired.email, otp: '123456' }, null, 400);
  const scheme = schemes.find(item => item.code === 'AZKMI');
  const drafts = await Promise.all([
    request('POST', '/applications', { schemeId: scheme._id }, auth.applicant, 201),
    request('POST', '/applications', { schemeId: scheme._id }, auth.other, 201)
  ]);
  assert.notEqual(drafts[0].application.applicationNo, drafts[1].application.applicationNo);
  for (let i = 0; i < drafts.length; i++) await request('DELETE', `/applications/${drafts[i].application._id}`, null, i === 0 ? auth.applicant : auth.other);
});

test('admin writes, optional ML APIs, and account deletion work without exposing credentials', async () => {
  const custom = await request('POST', '/schemes', { code: 'TEST', name: 'Test Scheme', description: 'Disposable integration scheme', openDate: new Date(Date.now() - 10000), closeDate: new Date(Date.now() + 86400000), totalSeats: 1 }, auth.admin, 201);
  assert.match(custom.scheme._id, /^[a-f\d]{24}$/);
  const other = await User.findOne({ email: 'other@example.test' });
  await request('PUT', `/admin/users/${other._id}/role`, { role: 'verifier' }, auth.admin);
  await request('PUT', `/admin/users/${other._id}/role`, { role: 'applicant' }, auth.admin);
  const customPrediction = await request('POST', '/ml/predict-custom', { scheme_code: 'ARG45', marks_percent: 80, family_income: 100000, age: 25, education_level: 'masters' }, auth.admin);
  assert.ok(customPrediction.data.eligibility);
  await request('GET', `/ml/predict/${applicationId}`, null, auth.officer);
  await request('GET', '/ml/predict/000000000000000000000000', null, auth.officer, 404);
  await request('DELETE', '/auth/account', null, auth.other);
  await request('GET', '/auth/me', null, auth.other, 401);
});
