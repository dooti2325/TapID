import api from './api';

export const facultyService = {
  async getFaculty() {
    const response = await api.get('/faculty');
    return response.data;
  },

  async createFaculty(data) {
    const response = await api.post('/faculty', data);
    return response.data;
  },

  async updateFaculty(id, data) {
    const response = await api.put(`/faculty/${id}`, data);
    return response.data;
  },

  async deleteFaculty(id) {
    const response = await api.delete(`/faculty/${id}`);
    return response.data;
  },
};

export default facultyService;
