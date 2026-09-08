import api from './api';

export const attendanceService = {
  async startSession({ timetable_id, subject_id, classroom_id }) {
    const response = await api.post('/session/start', {
      timetable_id,
      subject_id,
      classroom_id,
    });
    return response.data;
  },

  async endSession(sessionId) {
    const response = await api.post(`/session/${sessionId}/end`);
    return response.data;
  },

  async getActiveSessions() {
    const response = await api.get('/session/active');
    return response.data;
  },

  async getSessionAttendance(sessionId) {
    const response = await api.get(`/attendance/session/${sessionId}`);
    return response.data;
  },

  async recordAttendance(rfidUid, macAddress) {
    const response = await api.post('/attendance/record', {
      rfid_uid: rfidUid,
      mac_address: macAddress,
    });
    return response.data;
  },

  async bulkRecordAttendance(macAddress, records) {
    const response = await api.post('/attendance/bulk-record', {
      mac_address: macAddress,
      records,
    });
    return response.data;
  },
};

export default attendanceService;
