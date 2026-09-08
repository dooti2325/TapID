export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
};

export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  REVOKED: 'revoked',
};

export const CARD_STATUS = {
  ACTIVE: 'active',
  REVOKED: 'revoked',
  LOST: 'lost',
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const STATUS_COLORS = {
  present: 'success',
  late: 'warning',
  absent: 'danger',
  active: 'success',
  revoked: 'danger',
  lost: 'warning',
  online: 'success',
  offline: 'neutral',
};
