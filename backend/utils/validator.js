/**
 * Validation helpers for TapID Backend
 */

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

const isValidMacAddress = (mac) => {
  if (!mac || typeof mac !== 'string') return false;
  const re = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return re.test(mac.trim());
};

const isValidRfidUid = (uid) => {
  if (!uid || typeof uid !== 'string') return false;
  // RFID card UIDs are typically 4, 7, or 10 byte hex strings (8, 14, or 20 characters)
  const re = /^[0-9A-Fa-f]{4,32}$/;
  return re.test(uid.trim());
};

const isValidEnrollment = (enrollment) => {
  if (!enrollment || typeof enrollment !== 'string') return false;
  return enrollment.trim().length >= 3 && enrollment.trim().length <= 30;
};

module.exports = {
  isValidEmail,
  isValidMacAddress,
  isValidRfidUid,
  isValidEnrollment,
};
