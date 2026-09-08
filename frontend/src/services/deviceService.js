import api from './api';

export const deviceService = {
  async getDevices() {
    const response = await api.get('/devices');
    return response.data;
  },

  async createDevice(deviceData) {
    const response = await api.post('/devices', deviceData);
    return response.data;
  },

  async updateDeviceStatus(id, status) {
    const response = await api.put(`/devices/${id}/status`, { status });
    return response.data;
  },
};

export default deviceService;
