const bcrypt = require('bcryptjs');

const DEFAULT_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;
const OTP_HASH_SALT_ROUNDS = 10;

function generateNumericOtp(len = OTP_LENGTH) {
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = {
  generateAndSaveOtp: async ({ modelInstance, purpose = 'forgot_password', length = OTP_LENGTH, expiryMinutes = DEFAULT_EXPIRY_MINUTES }) => {
    if (!modelInstance) throw new Error('modelInstance required');
    const otp = generateNumericOtp(length);
    const otpExpires = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const hashed = await bcrypt.hash(otp, OTP_HASH_SALT_ROUNDS);
    modelInstance.otp = hashed;
    modelInstance.otp_expires = otpExpires;
    modelInstance.otp_purpose = purpose;
    await modelInstance.save();
    return { otp, otp_expires: otpExpires };
  },

  verifyOtp: async ({ modelInstance, otp, purpose }) => {
    if (!modelInstance) return { ok: false, reason: 'not_found' };
    if (modelInstance.otp_purpose !== purpose) return { ok: false, reason: 'wrong_purpose' };
    if (!modelInstance.otp || !modelInstance.otp_expires) return { ok: false, reason: 'no_otp' };

    if (new Date() > new Date(modelInstance.otp_expires)) return { ok: false, reason: 'expired' };

    const match = await bcrypt.compare(String(otp), modelInstance.otp);
    if (!match) return { ok: false, reason: 'mismatch' };

    modelInstance.otp = null;
    modelInstance.otp_expires = null;
    modelInstance.otp_purpose = null;
    await modelInstance.save();

    return { ok: true };
  }
};
