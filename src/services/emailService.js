// src/services/emailService.js
const nodemailer = require("nodemailer");

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If user has configured .env SMTP → use real SMTP
  if (host && port && user && pass) {
    console.log("[MAIL] Using real SMTP configuration");
    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  // No SMTP configured → fallback to Ethereal for development
  console.log("[MAIL] No SMTP configured → using Ethereal test mailbox");

  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}

async function sendOtpEmail({ to, otp, purpose }) {
  const subject =
    purpose === "registration"
      ? "Your Registration OTP"
      : "Your Password Reset OTP";

  const html = `
    <p>Your OTP is <strong>${otp}</strong>.</p>
    <p>This code expires in <strong>10 minutes</strong>.</p>
  `;

  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || '"Saver Grocery" <no-reply@saver.com>',
    to,
    subject,
    html,
    text: `Your OTP is ${otp}. It expires in 10 minutes.`
  });

  // If using Ethereal, print preview URL
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("[MAIL] Ethereal preview:", preview);
  }

  return info;
}

module.exports = { sendOtpEmail };
