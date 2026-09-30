import fs from 'fs';
import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';
import Deficiency from '../models/Deficiency.js';
import VerificationLog from '../models/VerificationLog.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import Disbursement from '../models/Disbursement.js';
import { sendNotification } from '../services/notificationService.js';
import { sendOtpEmail } from '../services/emailService.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'development_jwt_secret_key_change_in_production', {
  expiresIn: process.env.JWT_EXPIRE || '7d'
});
const normalizeEmail = email => typeof email === 'string' ? email.trim().toLowerCase() : '';
const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const issueOtp = () => String(randomInt(100000, 1000000));
const otpResponse = (delivery, otp) => ({
  delivery: delivery.mode,
  ...(delivery.mode === 'development' ? { otpDebug: otp } : {})
});

export const register = async (req, res, next) => {
  try {
    const { name, phone, password, preferredLanguage = 'en', profile = {} } = req.body;
    const email = normalizeEmail(req.body.email);
    if (typeof name !== 'string' || !name.trim() || !validEmail(email) || typeof phone !== 'string' || !/^\+?[\d\s()-]{10,16}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'A name, valid email address, and valid phone number are required.' });
    }
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters and at most 72 bytes.' });
    }
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      return res.status(400).json({ success: false, message: 'Profile must be an object.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, code: existing.isVerified ? 'ACCOUNT_EXISTS' : 'EMAIL_NOT_VERIFIED', email,
        message: existing.isVerified ? 'An account with this email already exists. Please log in.' : 'This account is awaiting verification. Continue to verify or resend your code.' });
    }
    const otp = issueOtp();
    const user = await User.create({ name: name.trim(), email, phone: phone.trim(), passwordHash: password,
      role: 'applicant', isVerified: false, otp, otpExpiry: new Date(Date.now() + 15 * 60 * 1000),
      preferredLanguage, profile: { category: 'ST', ...profile } });
    try {
      const delivery = await sendOtpEmail({ toEmail: email, name: user.name, otp });
      return res.status(201).json({ success: true, userId: user._id, email,
        message: delivery.mode === 'development' ? 'Account created. Use the development verification code shown below.' : 'Account created. A verification code was sent to your email.',
        ...otpResponse(delivery, otp) });
    } catch (error) {
      // Keep the pending account so the user can retry delivery without losing registration.
      return res.status(503).json({ success: false, code: 'OTP_DELIVERY_FAILED', email, userId: user._id,
        message: 'Your account was created, but the verification email could not be sent. Please retry using Resend Code.' });
    }
  } catch (error) { next(error); }
};

export const resendOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!validEmail(email)) return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account is already verified. Please log in.' });
    const otp = issueOtp();
    const delivery = await sendOtpEmail({ toEmail: email, name: user.name, otp });
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otpAttempts = 0;
    await user.save();
    res.json({ success: true, email, message: delivery.mode === 'development' ? 'A fresh development code is shown below.' : 'A fresh verification code was sent to your email.', ...otpResponse(delivery, otp) });
  } catch (error) { next(error); }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
    if (!validEmail(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: 'Provide your email and a six-digit verification code.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Account is already verified. Please log in.' });
    if (!user.otpExpiry || user.otpExpiry <= new Date()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new verification code.' });
    if (user.otp !== otp) {
      await User.updateOne({ _id: user._id, isVerified: false }, { $inc: { otpAttempts: 1 } });
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }
    // Only one request can consume an unexpired code.
    const verified = await User.findOneAndUpdate({ _id: user._id, isVerified: false, otp, otpExpiry: { $gt: new Date() }, otpAttempts: { $lt: 5 } },
      { $set: { isVerified: true, otp: null, otpExpiry: null, otpAttempts: 0 } }, { new: true });
    if (!verified) return res.status(400).json({ success: false, message: 'This code has already been used or expired.' });
    res.json({ success: true, message: 'Email verified successfully.', token: generateToken(verified._id), user: verified });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!validEmail(email) || typeof password !== 'string' || !password) return res.status(400).json({ success: false, message: 'Provide a valid email and password.' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (!user.isVerified) return res.status(403).json({ success: false, code: 'EMAIL_NOT_VERIFIED', email, message: 'Verify your email before logging in.' });
    res.json({ success: true, message: 'Logged in successfully.', token: generateToken(user._id), user });
  } catch (error) { next(error); }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const { name, phone, preferredLanguage, profile } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (profile) {
      user.profile = {
        ...(user.profile?.toObject?.() || user.profile || {}),
        ...profile,
        education: { ...(user.profile?.education?.toObject?.() || user.profile?.education || {}), ...(profile.education || {}) }
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 1. Find all applications by this user
    const applications = await Application.find({ applicantId: userId });
    const appIds = applications.map(a => a._id);

    // 2. Find and delete all documents & disk files for this user's applications
    const documents = await Document.find({ applicationId: { $in: appIds } });
    for (const doc of documents) {
      if (doc.storedPath && fs.existsSync(doc.storedPath)) {
        try { fs.unlinkSync(doc.storedPath); } catch {}
      }
    }
    await Document.deleteMany({ applicationId: { $in: appIds } });

    // 3. Delete all Deficiencies for these applications
    await Deficiency.deleteMany({ applicationId: { $in: appIds } });

    // 4. Delete all VerificationLogs and Disbursements for these applications
    await VerificationLog.deleteMany({ applicationId: { $in: appIds } });
    await Disbursement.deleteMany({ applicationId: { $in: appIds } });

    // 5. Delete all Applications
    await Application.deleteMany({ applicantId: userId });

    // 6. Delete all Notifications for this user
    await Notification.deleteMany({ userId });

    // 7. Record Audit Log before deleting user record
    try {
      await AuditLog.create({
        actorId: userId,
        actorName: user.name,
        actorRole: user.role,
        action: 'USER_ACCOUNT_DELETED',
        entityType: 'User',
        entityId: userId.toString(),
        reason: 'User self-requested permanent account deletion.',
        ip: req.ip || '127.0.0.1'
      });
    } catch {}

    // 8. Delete User account from database
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Your account and all associated documents and applications have been permanently deleted.'
    });
  } catch (error) {
    next(error);
  }
};
