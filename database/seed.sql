USE tapid;

SET @demo_password_hash = '$2b$10$E1NSnAY21jNZbxh557eqBe1f6iQSkmxdtmp.OEekmqfx7DFR5k5aC';

INSERT INTO users (email, password_hash, role) VALUES
('admin@tapid.edu', @demo_password_hash, 'admin'),
('faculty@tapid.edu', @demo_password_hash, 'faculty'),
('student1@tapid.edu', @demo_password_hash, 'student'),
('student2@tapid.edu', @demo_password_hash, 'student')
ON DUPLICATE KEY UPDATE
password_hash = VALUES(password_hash),
role = VALUES(role);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Prof. Bob Jones', '0987654321', 'Computer Science'
FROM users
WHERE email = 'faculty@tapid.edu'
ON DUPLICATE KEY UPDATE
name = VALUES(name),
phone = VALUES(phone),
department = VALUES(department);

INSERT INTO sections (name, branch, semester) VALUES
('CS-A', 'Computer Science', 5),
('CS-B', 'Computer Science', 5)
ON DUPLICATE KEY UPDATE
branch = VALUES(branch),
semester = VALUES(semester);

INSERT INTO students (user_id, name, enrollment_number, section_id)
SELECT u.id, 'John Doe', 'EN2024001', sec.id
FROM users u
JOIN sections sec ON sec.name = 'CS-A'
WHERE u.email = 'student1@tapid.edu'
ON DUPLICATE KEY UPDATE
user_id = VALUES(user_id),
name = VALUES(name),
section_id = VALUES(section_id);

INSERT INTO students (user_id, name, enrollment_number, section_id)
SELECT u.id, 'Jane Roe', 'EN2024002', sec.id
FROM users u
JOIN sections sec ON sec.name = 'CS-A'
WHERE u.email = 'student2@tapid.edu'
ON DUPLICATE KEY UPDATE
user_id = VALUES(user_id),
name = VALUES(name),
section_id = VALUES(section_id);

INSERT INTO students (user_id, name, enrollment_number, section_id)
SELECT NULL, 'Sam Smith', 'EN2024003', sec.id
FROM sections sec
WHERE sec.name = 'CS-B'
ON DUPLICATE KEY UPDATE
name = VALUES(name),
section_id = VALUES(section_id);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT 'A1B2C3D4', id, 'active' FROM students WHERE enrollment_number = 'EN2024001'
ON DUPLICATE KEY UPDATE
student_id = VALUES(student_id),
status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT 'E5F6G7H8', id, 'active' FROM students WHERE enrollment_number = 'EN2024002'
ON DUPLICATE KEY UPDATE
student_id = VALUES(student_id),
status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '9I0J1K2L', id, 'active' FROM students WHERE enrollment_number = 'EN2024003'
ON DUPLICATE KEY UPDATE
student_id = VALUES(student_id),
status = VALUES(status);

INSERT INTO subjects (code, name, semester) VALUES
('CS101', 'Introduction to Programming', 1),
('CS201', 'Data Structures', 3),
('EE301', 'Microprocessors', 5)
ON DUPLICATE KEY UPDATE
name = VALUES(name),
semester = VALUES(semester);

INSERT INTO classrooms (room_number, building) VALUES
('101', 'Engineering Block A'),
('205', 'Engineering Block B')
ON DUPLICATE KEY UPDATE
building = VALUES(building);

INSERT INTO devices (mac_address, classroom_id, status)
SELECT '24:0A:C4:00:00:01', id, 'offline'
FROM classrooms
WHERE room_number = '101'
ON DUPLICATE KEY UPDATE
classroom_id = VALUES(classroom_id),
status = VALUES(status);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '10:00:00', '11:00:00'
FROM faculty f
JOIN users u ON f.user_id = u.id AND u.email = 'faculty@tapid.edu'
JOIN subjects sub ON sub.code = 'CS201'
JOIN sections sec ON sec.name = 'CS-A'
JOIN classrooms c ON c.room_number = '101'
WHERE NOT EXISTS (
    SELECT 1 FROM timetable t
    WHERE t.faculty_id = f.id
      AND t.subject_id = sub.id
      AND t.section_id = sec.id
      AND t.classroom_id = c.id
      AND t.day_of_week = 'Monday'
      AND t.start_time = '10:00:00'
);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '11:00:00', '12:00:00'
FROM faculty f
JOIN users u ON f.user_id = u.id AND u.email = 'faculty@tapid.edu'
JOIN subjects sub ON sub.code = 'CS201'
JOIN sections sec ON sec.name = 'CS-B'
JOIN classrooms c ON c.room_number = '205'
WHERE NOT EXISTS (
    SELECT 1 FROM timetable t
    WHERE t.faculty_id = f.id
      AND t.subject_id = sub.id
      AND t.section_id = sec.id
      AND t.classroom_id = c.id
      AND t.day_of_week = 'Tuesday'
      AND t.start_time = '11:00:00'
);
