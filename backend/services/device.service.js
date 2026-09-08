const Device = require('../models/Device');

const getAllDevices = async () => {
  return await Device.findAll();
};

const getDeviceByMac = async (macAddress) => {
  const device = await Device.findByMac(macAddress);
  if (!device) {
    const err = new Error('Device not found');
    err.status = 404;
    throw err;
  }
  return device;
};

const registerDevice = async ({ mac_address, classroom_id }) => {
  const existing = await Device.findByMac(mac_address);
  if (existing) {
    const err = new Error('Device MAC address already registered');
    err.status = 409;
    throw err;
  }
  const id = await Device.create({ mac_address, classroom_id });
  return { id, mac_address, classroom_id, status: 'offline' };
};

const updateDeviceStatus = async (id, status) => {
  const validStatuses = ['online', 'offline', 'revoked'];
  if (!validStatuses.includes(status)) {
    const err = new Error('Invalid status. Must be online, offline, or revoked');
    err.status = 400;
    throw err;
  }
  await Device.updateStatus(id, status);
  return { id, status };
};

module.exports = {
  getAllDevices,
  getDeviceByMac,
  registerDevice,
  updateDeviceStatus,
};
