const logger = require('../config/logger');

/**
 * Service to handle notification emails (alerts for absence, low attendance, etc.)
 */
const sendAttendanceAlert = async ({ toEmail, studentName, subjectName, date }) => {
  logger.info(`[EMAIL] Attendance alert queued for ${toEmail}: ${studentName} was absent in ${subjectName} on ${date}`);
  // In production, configure nodemailer or SendGrid/SES provider
  return {
    success: true,
    message: `Alert dispatched to ${toEmail}`,
  };
};

const sendLowAttendanceWarning = async ({ toEmail, studentName, percentage }) => {
  logger.info(`[EMAIL] Low attendance warning queued for ${toEmail}: ${studentName} current rate: ${percentage}%`);
  return {
    success: true,
    message: `Warning dispatched to ${toEmail}`,
  };
};

module.exports = {
  sendAttendanceAlert,
  sendLowAttendanceWarning,
};
