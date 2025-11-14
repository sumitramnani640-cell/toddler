// src/services/smsService.js
module.exports = {
  sendOtpSms: async ({ to, otp, purpose }) => {
    // TODO: integrate your SMS provider SDK here
    console.log(`(sms) to ${to}: OTP ${otp} for ${purpose}`);
    return true;
  }
};
