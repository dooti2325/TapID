import api from './api';

export const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getRfidCards() {
    const response = await api.get('/admin/rfid-cards');
    return response.data;
  },

  async createRfidCard(cardData) {
    const response = await api.post('/admin/rfid-cards', cardData);
    return response.data;
  },

  async assignCard(id, studentId) {
    const response = await api.put(`/admin/rfid-cards/${id}/assign`, {
      student_id: studentId,
    });
    return response.data;
  },

  async updateCardStatus(id, status) {
    const response = await api.put(`/admin/rfid-cards/${id}/status`, { status });
    return response.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/logs/audit', { params });
    return response.data;
  },

  async getSystemLogs(params = {}) {
    const response = await api.get('/logs', { params });
    return response.data;
  },
};

export default adminService;
