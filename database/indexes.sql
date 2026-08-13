USE tapid;

CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_timestamp ON attendance(timestamp);
CREATE INDEX idx_attendance_sessions_status ON attendance_sessions(status);
CREATE INDEX idx_attendance_sessions_faculty ON attendance_sessions(faculty_id);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_timetable_faculty_day ON timetable(faculty_id, day_of_week);
CREATE INDEX idx_students_section ON students(section_id);
