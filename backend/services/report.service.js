const Attendance = require('../models/Attendance');

const generateAttendanceReport = async ({ startDate, endDate, subjectId, sectionId }) => {
  const records = await Attendance.getAttendanceReport({
    startDate,
    endDate,
    subjectId,
    sectionId,
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;

  const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    summary: {
      total,
      present,
      late,
      absent,
      attendanceRate,
    },
    records,
  };
};

module.exports = {
  generateAttendanceReport,
};
