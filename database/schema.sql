CREATE DATABASE IF NOT EXISTS tapid;
USE tapid;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    UNIQUE KEY unique_section (name, branch, semester)
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    section_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

CREATE TABLE IF NOT EXISTS rfid_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(50) UNIQUE NOT NULL,
    student_id INT,
    status ENUM('active', 'revoked', 'lost') DEFAULT 'active',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    semester INT
);

CREATE TABLE IF NOT EXISTS classrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    building VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mac_address VARCHAR(50) UNIQUE NOT NULL,
    classroom_id INT,
    status ENUM('online', 'offline', 'revoked') DEFAULT 'offline',
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    subject_id INT NOT NULL,
    section_id INT NOT NULL,
    classroom_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE KEY unique_timetable_slot (faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time),
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timetable_id INT,
    faculty_id INT NOT NULL,
    subject_id INT NOT NULL,
    classroom_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status ENUM('active', 'completed') DEFAULT 'active',
    FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    rfid_card_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('present', 'late', 'absent') DEFAULT 'present',
    manual_override BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (rfid_card_id) REFERENCES rfid_cards(id),
    UNIQUE KEY unique_attendance (session_id, student_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
