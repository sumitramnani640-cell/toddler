// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

module.exports = {
  sendOtpEmail: async ({ to, otp, purpose }) => {
    const subject = purpose === 'registration' ? 'Your registration OTP' : 'Your password reset OTP';
    const text = `Your OTP is ${otp}. It expires in 10 minutes. If you didn't request this, ignore this email.`;
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'no-reply@example.com',
      to,
      subject,
      text,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`
    });
  }
};
