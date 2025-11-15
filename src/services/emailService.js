// src/services/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const FROM = process.env.FROM_EMAIL || `"Saver Grocery" <${process.env.GMAIL_USER || 'no-reply@saver.com'}>`;
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '');

// Optional generic SMTP envs (kept for flexibility)
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === 'true';

let transporterPromise = null;

async function createTransporter() {
  // 1) Try Gmail App Password first (recommended)
  if (gmailUser && gmailPass) {
    try {
      console.log('[MAIL] Attempting Gmail SMTP using GMAIL_USER + GMAIL_APP_PASSWORD');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass }
      });
      await transporter.verify();
      console.log('[MAIL] Gmail SMTP configured and verified.');
      return { transporter, type: 'gmail' };
    } catch (err) {
      console.error('[MAIL] Gmail SMTP verify failed:', err && err.message ? err.message : err);
      console.error('[MAIL] Falling back to other SMTP options.');
      // continue to try other options
    }
  } else {
    console.log('[MAIL] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping Gmail config.');
  }

  // 2) Try generic SMTP settings (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    try {
      console.log('[MAIL] Attempting generic SMTP using SMTP_* env variables');
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure || smtpPort === 587,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      });
      await transporter.verify();
      console.log('[MAIL] Generic SMTP configured and verified.');
      return { transporter, type: 'smtp' };
    } catch (err) {
      console.error('[MAIL] Generic SMTP verify failed:', err && err.message ? err.message : err);
      console.error('[MAIL] Falling back to Ethereal test mailbox (dev only).');
    }
  } else {
    console.log('[MAIL] SMTP_* envs not fully set — skipping generic SMTP.');
  }

  // 3) Ethereal fallback (development/testing)
  try {
    console.log('[MAIL] No SMTP configured → using Ethereal test mailbox');
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('[MAIL] Ethereal transporter ready (dev only).');
    return { transporter, type: 'ethereal', testAccount };
  } catch (err) {
    console.error('[MAIL] Failed to create Ethereal test account:', err);
    throw err;
  }
}

// single shared promise so we create transporter once
function getTransporterPromise() {
  if (!transporterPromise) transporterPromise = createTransporter();
  return transporterPromise;
}

async function sendMail(mailOptions) {
  const { transporter, type } = await getTransporterPromise();
  const info = await transporter.sendMail(mailOptions);

  if (type === 'ethereal') {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log('[MAIL] Ethereal preview:', preview);
    return { info, preview };
  }

  return { info };
}

async function sendOtpEmail({ to, otp, purpose = 'otp' }) {
  const subject =
    purpose === 'registration' ? 'Your Saver Grocery registration OTP' :
    purpose === 'forgot_password' ? 'Your Saver Grocery password reset OTP' :
    purpose === 'login' ? 'Your Saver Grocery login OTP' :
    'Your Saver Grocery OTP';

  const text = `Your OTP is ${otp}. This code will expire shortly. If you did not request this, ignore this message.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.4;">
      <h3>${subject}</h3>
      <p>Your OTP code is:</p>
      <p style="font-size: 20px; font-weight: bold;">${otp}</p>
      <p>This code will expire in a few minutes. If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  return sendMail({
    from: FROM,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendOtpEmail,
  // expose for debugging if you need lower-level access
  sendMail
};
