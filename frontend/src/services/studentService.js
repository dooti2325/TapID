import api from './api';

export const studentService = {
  async getStudents(params = {}) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  async getStudentById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  async createStudent(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  async updateStudent(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  async deleteStudent(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

export default studentService;
