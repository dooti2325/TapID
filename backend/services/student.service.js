const Student = require('../models/Student');
const RfidCard = require('../models/RfidCard');

const getAllStudents = async () => {
  return await Student.findAll();
};

const getStudentById = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }
  return student;
};

const createStudent = async ({ name, enrollment_number, section_id, rfid_uid }) => {
  // Check if enrollment already exists
  const existing = await Student.findByEnrollment(enrollment_number);
  if (existing) {
    const err = new Error('Enrollment number already in use');
    err.status = 409;
    throw err;
  }

  const studentId = await Student.create({ name, enrollment_number, section_id });

  // If RFID UID provided, associate or assign
  if (rfid_uid) {
    const card = await RfidCard.findByUid(rfid_uid);
    if (card) {
      await RfidCard.assignStudent(card.id, studentId);
    } else {
      await RfidCard.create({ uid: rfid_uid, student_id: studentId });
    }
  }

  return await Student.findById(studentId);
};

const updateStudent = async (id, { name, enrollment_number, section_id, rfid_uid }) => {
  await getStudentById(id);
  await Student.update(id, { name, enrollment_number, section_id });

  if (rfid_uid) {
    const card = await RfidCard.findByUid(rfid_uid);
    if (card) {
      await RfidCard.assignStudent(card.id, id);
    } else {
      await RfidCard.create({ uid: rfid_uid, student_id: id });
    }
  }

  return await Student.findById(id);
};

const deleteStudent = async (id) => {
  await getStudentById(id);
  return await Student.delete(id);
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
