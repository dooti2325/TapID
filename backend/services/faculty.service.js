const Faculty = require('../models/Faculty');

const getAllFaculty = async () => {
  return await Faculty.findAll();
};

const getFacultyById = async (id) => {
  const faculty = await Faculty.findById(id);
  if (!faculty) {
    const err = new Error('Faculty member not found');
    err.status = 404;
    throw err;
  }
  return faculty;
};

const updateFaculty = async (id, data) => {
  await getFacultyById(id);
  await Faculty.update(id, data);
  return await Faculty.findById(id);
};

const deleteFaculty = async (id) => {
  await getFacultyById(id);
  return await Faculty.delete(id);
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
};
