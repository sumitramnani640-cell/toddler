const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: `"Savers Grocery" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code for Registration",
    html: `
      <div style="font-family:sans-serif;line-height:1.6;">
        <h2 style="color:#2f8a4a;">Email Verification</h2>
        <p>Hi there,</p>
        <p>Your OTP code for registration is:</p>
        <h1 style="background:#2f8a4a;color:white;display:inline-block;padding:10px 20px;border-radius:8px;">
          ${otp}
        </h1>
        <p>This code is valid for <strong>5 minutes</strong>.</p>
        <p>Thank you,<br>Savers Grocery Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
  }
}

module.exports = { sendOTP };
