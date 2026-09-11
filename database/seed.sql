USE tapid;

SET @demo_password_hash = '$2b$10$E1NSnAY21jNZbxh557eqBe1f6iQSkmxdtmp.OEekmqfx7DFR5k5aC';

-- 1. Users
INSERT INTO users (email, password_hash, role) VALUES
('admin@tapid.edu', @demo_password_hash, 'admin'),
('faculty@tapid.edu', @demo_password_hash, 'faculty'),
('ashish.trivedi@tapid.edu', @demo_password_hash, 'faculty'),
('chetram.thakur@tapid.edu', @demo_password_hash, 'faculty'),
('sumalata.bhandari@tapid.edu', @demo_password_hash, 'faculty'),
('trupti.meshram@tapid.edu', @demo_password_hash, 'faculty'),
('amol.dhankar@tapid.edu', @demo_password_hash, 'faculty'),
('prachi.jain@tapid.edu', @demo_password_hash, 'faculty'),
('reenadewangan@tapid.edu', @demo_password_hash, 'faculty'),
('student1@tapid.edu', @demo_password_hash, 'student'),
('student2@tapid.edu', @demo_password_hash, 'student'),
('harshal.vidhate@tapid.edu', @demo_password_hash, 'student')
ON DUPLICATE KEY UPDATE
password_hash = VALUES(password_hash),
role = VALUES(role);

-- 2. Faculty Directory
INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Ashish Trivedi (AT)', '+91 98765 43221', 'Computer Science & Engineering'
FROM users WHERE email = 'ashish.trivedi@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Chetram Thakur (CT)', '+91 98765 43222', 'Computer Science & Engineering'
FROM users WHERE email = 'chetram.thakur@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Dr. Sumalata Bhandari (SB)', '+91 98765 43223', 'Computer Science & Engineering'
FROM users WHERE email = 'sumalata.bhandari@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Dr. Trupti Meshram (TM)', '+91 98765 43224', 'Computer Science & Engineering'
FROM users WHERE email = 'trupti.meshram@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Amol Dhankar (AD)', '+91 98765 43225', 'Computer Science & Engineering'
FROM users WHERE email = 'amol.dhankar@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Prachi Jain (PSJ)', '+91 98765 43226', 'Computer Science & Engineering'
FROM users WHERE email = 'prachi.jain@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Reena Dewangan', '+91 98765 43227', 'Fuzzy Logic'
FROM users WHERE email = 'reenadewangan@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

-- 3. Sections & Practical Batches
INSERT INTO sections (name, branch, semester) VALUES
('Section G', 'Computer Science', 5),
('G1 (Roll 1-33)', 'Computer Science', 5),
('G2 (Roll 34+)', 'Computer Science', 5),
('CS-Core', 'Computer Science', 5),
('CS-D', 'Computer Science', 7)
ON DUPLICATE KEY UPDATE
branch = VALUES(branch),
semester = VALUES(semester);

-- 4. Real Students of Section G (58 Students)
INSERT INTO students (name, enrollment_number, section_id)
SELECT raw_students.s_name, raw_students.s_enroll, sec.id
FROM (
    SELECT 'Shantanu Yashwant Raut' AS s_name, 'GHRUA23011060140' AS s_enroll, 'G1 (Roll 1-33)' AS s_sec UNION ALL
    SELECT 'DIVYANSH MANUKANT GADEKAR', 'GHRUA23011060170', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'VEDANT MANISH BAVARIA', 'GHRUA23011060205', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'SAMIKSHA PRABHAKAR MOHITKAR', 'GHRUA23011060250', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'SANSKAR LAXMAN GADDEWAR', 'GHRUA23011060258', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'SHREYA ANIL MAHETKAR', 'GHRUA23011060273', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'SHRUTI TULSHIRAM KAWALE', 'GHRUA23011060275', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'SUYASH SUNILRAO HANUMANTE', 'GHRUA23011060283', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'TRUPTI DHIRAJ SEWARE', 'GHRUA23011060289', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'VEDANT GOPAL MANKAR', 'GHRUA23011060297', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'VEDANT MOHAN WANKHEDE', 'GHRUA23011060298', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'VEDANT SUNIL DURGE', 'GHRUA23011060300', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'YASH NAGESHWAR KARME', 'GHRUA23011060309', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'ADITYA BHASKAR DARNE', 'GHRUA23011060317', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'ANURAG ATUL JOSHI', 'GHRUA23011060322', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'AYUSH RAJESH KALAMBE', 'GHRUA23011060336', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'Dootiballav Gouriprasanna Saha', 'GHRUA23011060348', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'HARSHAL SUHAS VIDHATE', 'GHRUA23011060359', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'HARSHAL RAMESH VIJAYWAR', 'GHRUA23011060360', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'KASTURI VIVEK AWACHAT', 'GHRUA23011060389', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'KRITIKA JITENDRA PANDEY', 'GHRUA23011060393', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'KUNAL SUDEEP JAIN', 'GHRUA23011060396', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'Nikhil Parmeshwar Netam', 'GHRUA23011060418', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'PRASAD PRASHANT DEO', 'GHRUA23011060454', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'PRASHIT PRABHAT HOKAM', 'GHRUA23011060455', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'KUNALI AMOL PATHRABE', 'GHRUA23011060457', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'Madhur Sudhir Madankar', 'GHRUA23011060462', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'PRATHMESH RAMESH AMLE', 'GHRUA23011060467', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'PRIYANSHU DINESH AMBHORE', 'GHRUA23011060471', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'VEDANT SACHIDANAND WANDHARE', 'GHRUA23011060500', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'DIVYANSH SALIL VERMA', 'GHRUA23011060571', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'PRIYANSHU SWARUPKUMAR KATRE', 'GHRUA23011060592', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'TRISHA NARENDRA TURKAR', 'GHRUA23011060606', 'G1 (Roll 1-33)' UNION ALL
    SELECT 'KSHITIJ JOHNEY DUSHING', 'GHRUA23011060614', 'G2 (Roll 34+)' UNION ALL
    SELECT 'VEDANT GOPALRAO BIRGADE', 'GHRUA23011060687', 'G2 (Roll 34+)' UNION ALL
    SELECT 'YASH RAJESH TAMHANKAR', 'GHRUA23011060688', 'G2 (Roll 34+)' UNION ALL
    SELECT 'PRINCY KAMLESH TABHANE', 'GHRUA23011060713', 'G2 (Roll 34+)' UNION ALL
    SELECT 'Om Yuwaraj Chandekar', 'GHRUA23011060725', 'G2 (Roll 34+)' UNION ALL
    SELECT 'Aniket Gajanan Balbudhe', 'GHRUA23011060780', 'G2 (Roll 34+)' UNION ALL
    SELECT 'RUTUJA RAKESH BHUSARI', 'GHRUA23011060793', 'G2 (Roll 34+)' UNION ALL
    SELECT 'Prajkta Narendra Wankhede', 'GHRUA23011060816', 'G2 (Roll 34+)' UNION ALL
    SELECT 'SARTHAK AKHILESH DUBEY', 'GHRUA23011060819', 'G2 (Roll 34+)' UNION ALL
    SELECT 'KRISHNA SANTOSH MORE', 'GHRUA23011060837', 'G2 (Roll 34+)' UNION ALL
    SELECT 'SAMPADA DAULATHRAMSINGH BUNDEL', 'GHRUA23011060840', 'G2 (Roll 34+)' UNION ALL
    SELECT 'AVINASH RAJU MUDE', 'GHRUA23011060866', 'G2 (Roll 34+)' UNION ALL
    SELECT 'KAUSTUBH KISHOR SAURKAR', 'GHRUA23011060868', 'G2 (Roll 34+)' UNION ALL
    SELECT 'KRUTEE WASUDEO SHENDE', 'GHRUA23011060870', 'G2 (Roll 34+)' UNION ALL
    SELECT 'KUNAL RAJU JIWTODE', 'GHRUA23011060872', 'G2 (Roll 34+)' UNION ALL
    SELECT 'PRATIK LAKHANLAL GHORMARE', 'GHRUA23011060873', 'G2 (Roll 34+)' UNION ALL
    SELECT 'HARSHAL SURENDRA DOIFODE', 'GHRUA23011060889', 'G2 (Roll 34+)' UNION ALL
    SELECT 'ANJALI RAMESH REWATKAR', 'GHRUA23011060893', 'G2 (Roll 34+)' UNION ALL
    SELECT 'PRACHI SANJAY DHOTE', 'GHRUA23011060894', 'G2 (Roll 34+)' UNION ALL
    SELECT 'PUSHPAK RAJKUMAR IKHAR', 'GHRUA23011060907', 'G2 (Roll 34+)' UNION ALL
    SELECT 'TRUPTI PRAVIN ZILPE', 'GHRUA23011060914', 'G2 (Roll 34+)' UNION ALL
    SELECT 'YASH DHANARAJ HATWAR', 'GHRUA23011060922', 'G2 (Roll 34+)' UNION ALL
    SELECT 'SAKSHI RAJENDRA OZA', 'GHRUA23011060939', 'G2 (Roll 34+)' UNION ALL
    SELECT 'VEDANT RAJESH WANDHARE', 'GHRUA23011060972', 'G2 (Roll 34+)' UNION ALL
    SELECT 'KARAN SHIVPRASAD SHAHU', 'GHRUA23011060981', 'G2 (Roll 34+)'
) raw_students
JOIN sections sec ON sec.name = raw_students.s_sec
ON DUPLICATE KEY UPDATE
name = VALUES(name),
section_id = VALUES(section_id);

-- Associate student logins
UPDATE students s
JOIN users u ON u.email = 'student1@tapid.edu'
SET s.user_id = u.id
WHERE s.enrollment_number = 'GHRUA23011060140';

UPDATE students s
JOIN users u ON u.email = 'student2@tapid.edu'
SET s.user_id = u.id
WHERE s.enrollment_number = 'GHRUA23011060348';

UPDATE students s
JOIN users u ON u.email = 'harshal.vidhate@tapid.edu'
SET s.user_id = u.id
WHERE s.enrollment_number = 'GHRUA23011060359';

-- 5. RFID Cards for Students
INSERT INTO rfid_cards (uid, student_id, status)
SELECT '04:A2:8B:1A', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060140'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '14:F2:3C:99', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060170'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '3A:BC:D1:42', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060205'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '88:E1:90:3F', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060250'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '24:0A:C4:01', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060258'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '24:0A:C4:00', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060348'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '24:0A:C4:02', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060359'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT '0B:CC:DD:EE', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060981'
ON DUPLICATE KEY UPDATE student_id = VALUES(student_id), status = VALUES(status);

-- 6. Subjects (from Official Timetable)
INSERT INTO subjects (code, name, semester) VALUES
('CD', 'Compiler Design', 5),
('CSS', 'Computer System Security', 5),
('ES-AI', 'Ethical & Social Implication of AI', 5),
('DEV', 'DevOps: Software Development & IT Operations', 5),
('AIML', 'Artificial Intelligence and Machine Learning', 5),
('PROJECT', 'Capstone Project Lab', 5),
('SPORTS', 'Sports & Athletics', 5)
ON DUPLICATE KEY UPDATE
name = VALUES(name),
semester = VALUES(semester);

-- 7. Classrooms
INSERT INTO classrooms (room_number, building) VALUES
('C-102', 'Academic Block C (Theory)'),
('C-117', 'Academic Block C (Lab)'),
('Ground', 'Sports Ground')
ON DUPLICATE KEY UPDATE
building = VALUES(building);

-- 8. Hardware Terminals (ESP32)
INSERT INTO devices (mac_address, classroom_id, status)
SELECT '24:0A:C4:00:00:01', id, 'online'
FROM classrooms WHERE room_number = 'C-102'
ON DUPLICATE KEY UPDATE
classroom_id = VALUES(classroom_id),
status = VALUES(status);

INSERT INTO devices (mac_address, classroom_id, status)
SELECT '24:0A:C4:00:00:02', id, 'online'
FROM classrooms WHERE room_number = 'C-117'
ON DUPLICATE KEY UPDATE
classroom_id = VALUES(classroom_id),
status = VALUES(status);

INSERT INTO devices (mac_address, classroom_id, status)
VALUES ('24:0A:C4:00:00:03', NULL, 'offline')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 9. Complete Institutional Weekly Timetable
-- Monday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '08:05:00', '09:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Chetram%' AND sub.code = 'CD' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '09:00:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Ashish%' AND sub.code = 'CSS' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '10:15:00', '11:10:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Sumalata%' AND sub.code = 'ES-AI' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '11:10:00', '12:05:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'SPORTS' AND sec.name = 'CS-Core' AND c.room_number = 'Ground'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '12:10:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'PROJECT' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- Tuesday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '08:05:00', '09:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Ashish%' AND sub.code = 'CSS' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '09:00:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'DEV' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '10:15:00', '11:10:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Chetram%' AND sub.code = 'CD' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '11:10:00', '12:05:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Sumalata%' AND sub.code = 'ES-AI' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Tuesday', '12:10:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'PROJECT' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- Wednesday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Wednesday', '08:05:00', '09:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Sumalata%' AND sub.code = 'ES-AI' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Wednesday', '09:00:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'AIML' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Wednesday', '10:15:00', '11:10:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'DEV' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Wednesday', '11:10:00', '12:05:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Ashish%' AND sub.code = 'CSS' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Wednesday', '12:10:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'PROJECT' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- Thursday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '08:05:00', '09:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'AIML' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '09:00:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'DEV' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '10:15:00', '11:10:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'AIML' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '11:10:00', '12:05:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Chetram%' AND sub.code = 'CD' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '12:10:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Chetram%' AND sub.code = 'CD' AND sec.name = 'G1 (Roll 1-33)' AND c.room_number = 'C-117'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- Friday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Friday', '08:05:00', '09:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'DEV' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Friday', '09:00:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Sumalata%' AND sub.code = 'ES-AI' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Friday', '10:15:00', '12:05:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Prachi%' AND sub.code = 'CD' AND sec.name = 'G2 (Roll 34+)' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Friday', '12:10:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Dr. Trupti%' AND sub.code = 'PROJECT' AND sec.name = 'CS-Core' AND c.room_number = 'C-102'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- Saturday
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Saturday', '08:05:00', '09:55:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'SPORTS' AND sec.name = 'CS-Core' AND c.room_number = 'Ground'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Saturday', '10:15:00', '14:00:00'
FROM faculty f, subjects sub, sections sec, classrooms c
WHERE f.name LIKE 'Amol%' AND sub.code = 'SPORTS' AND sec.name = 'CS-Core' AND c.room_number = 'Ground'
ON DUPLICATE KEY UPDATE end_time = VALUES(end_time);

-- 10. Sample Attendance Sessions & Attendance Records
INSERT INTO attendance_sessions (timetable_id, faculty_id, subject_id, classroom_id, session_date, start_time, end_time, status)
SELECT t.id, t.faculty_id, t.subject_id, t.classroom_id, CURDATE(), NOW() - INTERVAL 1 HOUR, NOW(), 'completed'
FROM timetable t
LIMIT 1;

-- Mark first 25 students present in that session
INSERT IGNORE INTO attendance (session_id, student_id, rfid_card_id, timestamp, status)
SELECT 1, s.id, r.id, NOW() - INTERVAL 45 MINUTE, 'present'
FROM students s
LEFT JOIN rfid_cards r ON r.student_id = s.id
LIMIT 25;

-- 11. Initial Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, details)
VALUES 
(1, 'SYSTEM_INITIALIZATION', 'SYSTEM', 'Database seeded with Section G roster, timetable, faculty, and classrooms'),
(1, 'HARDWARE_TERMINAL_CONFIGURED', 'DEVICE', 'Configured ESP32 terminals for C-102 and C-117');
