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
('student1@tapid.edu', @demo_password_hash, 'student'),
('student2@tapid.edu', @demo_password_hash, 'student'),
('harshal.vidhate@tapid.edu', @demo_password_hash, 'student')
ON DUPLICATE KEY UPDATE
password_hash = VALUES(password_hash),
role = VALUES(role);

-- 2. Faculty
INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Ashish Trivedi (AT)', '0987654322', 'Computer Science'
FROM users WHERE email = 'ashish.trivedi@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Chetram Thakur (CT)', '0987654323', 'Computer Science'
FROM users WHERE email = 'chetram.thakur@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Dr. Sumalata Bhandari (SB)', '0987654324', 'Computer Science'
FROM users WHERE email = 'sumalata.bhandari@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Dr. Trupti Meshram (TM)', '0987654325', 'Computer Science'
FROM users WHERE email = 'trupti.meshram@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Amol Dhankar (AD)', '0987654326', 'Computer Science'
FROM users WHERE email = 'amol.dhankar@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

INSERT INTO faculty (user_id, name, phone, department)
SELECT id, 'Prachi Jain (PSJ)', '0987654327', 'Computer Science'
FROM users WHERE email = 'prachi.jain@tapid.edu'
ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), department = VALUES(department);

-- 3. Sections & Practical Batches
INSERT INTO sections (name, branch, semester) VALUES
('Section G', 'Computer Science', 5),
('G1 (Roll 1-33)', 'Computer Science', 5),
('G2 (Roll 34+)', 'Computer Science', 5),
('CS-Core', 'Computer Science', 5)
ON DUPLICATE KEY UPDATE
branch = VALUES(branch),
semester = VALUES(semester);

-- 4. Real Section G Students (Roll 1 to 58)
INSERT INTO students (name, enrollment_number, section_id)
SELECT s_name, s_enroll, sec.id
FROM (
    -- Batch G1 (Roll 1 to 33)
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
    -- Batch G2 (Roll 34 to 58)
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

-- 5. RFID Cards
INSERT INTO rfid_cards (uid, student_id, status)
SELECT 'A1B2C3D4', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060140'
ON DUPLICATE KEY UPDATE
student_id = VALUES(student_id),
status = VALUES(status);

INSERT INTO rfid_cards (uid, student_id, status)
SELECT 'E5F6G7H8', id, 'active' FROM students WHERE enrollment_number = 'GHRUA23011060348'
ON DUPLICATE KEY UPDATE
student_id = VALUES(student_id),
status = VALUES(status);

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
('C-102', 'Academic Block C'),
('C-117', 'Academic Block C (Lab)')
ON DUPLICATE KEY UPDATE
building = VALUES(building);

-- 8. Hardware Terminals
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

-- 9. Timetable (Selected Core Lectures)
INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '08:05:00', '09:00:00'
FROM faculty f
JOIN subjects sub ON sub.code = 'CD'
JOIN sections sec ON sec.name = 'CS-Core'
JOIN classrooms c ON c.room_number = 'C-102'
WHERE NOT EXISTS (
    SELECT 1 FROM timetable t
    WHERE t.faculty_id = f.id AND t.subject_id = sub.id AND t.day_of_week = 'Monday' AND t.start_time = '08:05:00'
);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Monday', '09:00:00', '09:55:00'
FROM faculty f
JOIN subjects sub ON sub.code = 'CSS'
JOIN sections sec ON sec.name = 'CS-Core'
JOIN classrooms c ON c.room_number = 'C-102'
WHERE NOT EXISTS (
    SELECT 1 FROM timetable t
    WHERE t.faculty_id = f.id AND t.subject_id = sub.id AND t.day_of_week = 'Monday' AND t.start_time = '09:00:00'
);

INSERT INTO timetable (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time, end_time)
SELECT f.id, sub.id, sec.id, c.id, 'Thursday', '12:10:00', '14:00:00'
FROM faculty f
JOIN subjects sub ON sub.code = 'CD'
JOIN sections sec ON sec.name = 'G1 (Roll 1-33)'
JOIN classrooms c ON c.room_number = 'C-117'
WHERE NOT EXISTS (
    SELECT 1 FROM timetable t
    WHERE t.faculty_id = f.id AND t.subject_id = sub.id AND t.day_of_week = 'Thursday' AND t.start_time = '12:10:00'
);
