import api from './api';

export const reportService = {
  async getAttendanceReport(params = {}) {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
  },

  async getAnalyticsSummary() {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};

export default reportService;
