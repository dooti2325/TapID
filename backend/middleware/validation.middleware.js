const { isValidEmail, isValidMacAddress, isValidRfidUid, isValidEnrollment } = require('../utils/validator');

/**
 * Middleware factory to check required body fields
 */
const validateBody = (requiredFields) => (req, res, next) => {
  const missing = [];
  for (const field of requiredFields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required field(s): ${missing.join(', ')}`,
      missing,
    });
  }
  next();
};

/**
 * Validation middleware for RFID attendance tap payload
 */
const validateAttendanceTap = (req, res, next) => {
  const { rfid_uid, mac_address } = req.body;

  if (!rfid_uid || !mac_address) {
    return res.status(400).json({
      success: false,
      message: 'Both rfid_uid and mac_address are required',
    });
  }

  if (!isValidRfidUid(rfid_uid)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid RFID UID format. Must be hexadecimal characters.',
    });
  }

  next();
};

/**
 * Validation middleware for Student creation/update
 */
const validateStudentInput = (req, res, next) => {
  const { name, enrollment_number } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Student name is required' });
  }

  if (!enrollment_number || !isValidEnrollment(enrollment_number)) {
    return res.status(400).json({ success: false, message: 'Valid enrollment number is required' });
  }

  next();
};

module.exports = {
  validateBody,
  validateAttendanceTap,
  validateStudentInput,
};
