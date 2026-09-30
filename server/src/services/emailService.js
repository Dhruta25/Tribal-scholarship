import nodemailer from 'nodemailer';
import '../config/env.js';

// Create reusable transporter
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  if (process.env.OTP_DELIVERY === 'development' && process.env.NODE_ENV !== 'production') return null;

  if (!emailUser || !emailPass || emailUser === 'your-email@gmail.com' || emailPass === 'your-16-character-app-password') {
    return null;
  }

  // Custom SMTP configuration if host is specified
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Default to standard Gmail service
  return nodemailer.createTransport({
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

/**
 * Send real 6-digit verification OTP email to user
 */
export const sendOtpEmail = async ({ toEmail, name, otp }) => {
  const transporter = createTransporter();
  if (!transporter) {
    if (process.env.OTP_DELIVERY === 'development' && process.env.NODE_ENV !== 'production') return { mode: 'development' };
    throw Object.assign(new Error('Email delivery is not configured. Contact the portal administrator.'), { status: 503 });
  }
  const safeName = String(name || 'Applicant').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  const mailOptions = {
    from: process.env.EMAIL_FROM || { name: 'MoTA Scholarship Portal', address: process.env.EMAIL_USER },
    to: toEmail,
    subject: `🔐 ${otp} is your MoTA Scholarship Portal Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background-color: #0B2545; color: #ffffff; padding: 16px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #fbbf24;">🏛️ Ministry of Tribal Affairs (MoTA)</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #e2e8f0;">National Fellowship & Scholarship Management System (SIH-26239)</p>
          </div>
          <div style="height: 4px; background: linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%);"></div>
        </div>

        <div style="background-color: #ffffff; padding: 28px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Dear <strong>${safeName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for registering on the <strong>AI-Enabled Scholarship & Fellowship Management System for Scheduled Tribes (ST)</strong>.
          </p>
          
          <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
            Please use the following 6-digit One-Time Password (OTP) to verify your account:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; padding: 14px 32px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace;">${otp}</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">⏳ Valid for <strong>15 minutes</strong></div>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
              ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. Ministry officials will never ask for your password or verification code.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94a3b8;">
          <p style="margin: 4px 0;">Government of India | Ministry of Tribal Affairs (MoTA)</p>
          <p style="margin: 4px 0;">Smart India Hackathon 2026 — Problem Statement 26239</p>
        </div>
      </div>
    `,
    text: `Ministry of Tribal Affairs (MoTA)\n\nDear ${name || 'Applicant'},\n\nYour 6-digit verification code is: ${otp}\nThis code is valid for 15 minutes.\n\nNever share your OTP with anyone.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (!info.accepted?.length) throw new Error('SMTP did not accept the recipient.');
    return { mode: 'email', messageId: info.messageId };
  } catch (error) {
    console.error('[Email delivery failed]:', error.code || 'SMTP_ERROR');
    throw Object.assign(new Error('Could not send the verification email. Please try again.'), { status: 503 });
  }
};
