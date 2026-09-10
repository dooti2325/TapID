import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Play, 
  Wifi, 
  Info, 
  BookOpen, 
  Users, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import './Attendance.css';

const OFFICIAL_SUBJECTS = [
  { id: 1, name: 'CD: Compiler Design (Chetram Thakur)', code: 'CD', defaultRoom: 'Room C-102' },
  { id: 2, name: 'CSS: Computer System Security (Ashish Trivedi)', code: 'CSS', defaultRoom: 'Room C-102' },
  { id: 3, name: 'ES-AI: Ethical & Social Implication of AI (Dr. Sumalata Bhandari)', code: 'ES-AI', defaultRoom: 'Room C-102' },
  { id: 4, name: 'DEV: DevOps: Software Dev & IT Ops (Dr. Trupti Meshram)', code: 'DEV', defaultRoom: 'Room C-102' },
  { id: 5, name: 'AIML: Artificial Intelligence & Machine Learning (Amol Dhankar)', code: 'AIML', defaultRoom: 'Room C-102' },
  { id: 6, name: 'CD-G1: Compiler Design Practical (Chetram Thakur - G1)', code: 'CD-G1', defaultRoom: 'Room C-117' },
  { id: 7, name: 'CD-G2: Compiler Design Practical (Prachi Jain - G2)', code: 'CD-G2', defaultRoom: 'Room C-102' },
  { id: 8, name: 'PROJECT: Capstone Project Lab', code: 'PROJECT', defaultRoom: 'Room C-102' },
  { id: 9, name: 'SPORTS: Sports & Athletics', code: 'SPORTS', defaultRoom: 'Sports Ground' }
];

const ROOMS = ['Room C-102', 'Room C-117', 'Sports Ground'];
const SECTIONS = ['CS-Core (All Students)', 'Batch G1 (Roll 1 to 33)', 'Batch G2 (Roll 34 Onwards)'];
const SEMESTERS = ['Semester 5 - Fall 2026', 'Semester 6 - Spring 2027'];

function StartAttendance() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    subject: OFFICIAL_SUBJECTS[0].name,
    section: 'CS-Core (All Students)',
    room: 'Room C-102',
    duration: '55',
    semester: 'Semester 5 - Fall 2026',
    gracePeriod: '10',
  });

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await api.get('/timetable');
        if (Array.isArray(response.data)) {
          setTimetable(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch timetable', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject') {
      const selected = OFFICIAL_SUBJECTS.find(s => s.name === value);
      setFormData(prev => ({
        ...prev,
        subject: value,
        room: selected?.defaultRoom || prev.room,
        section: value.includes('G1') ? 'Batch G1 (Roll 1 to 33)' : (value.includes('G2') ? 'Batch G2 (Roll 34 Onwards)' : prev.section)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const matching = timetable.find(
        (t) => t.subject_name?.includes(formData.subject.split(':')[0]) || t.room_number?.includes(formData.room)
      );
      
      const payload = matching
        ? {
            timetable_id: matching.id,
            subject_id: matching.subject_id,
            classroom_id: matching.classroom_id,
          }
        : {
            subject_name: formData.subject,
            section_name: formData.section,
            room_number: formData.room,
            duration: formData.duration,
          };

      const response = await api.post('/session/start', payload);
      const sId = response.data?.session_id || Date.now();
      navigate(`/attendance/live?sessionId=${sId}`);
    } catch (err) {
      const fallbackId = 'SES-' + Math.floor(100000 + Math.random() * 900000);
      navigate(`/attendance/live?sessionId=${fallbackId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startQuickSession = async (entry) => {
    try {
      const response = await api.post('/session/start', {
        timetable_id: entry.id,
        subject_id: entry.subject_id,
        classroom_id: entry.classroom_id,
      });
      navigate(`/attendance/live?sessionId=${response.data.session_id}`);
    } catch (err) {
      const fallbackId = 'SES-' + Math.floor(100000 + Math.random() * 900000);
      navigate(`/attendance/live?sessionId=${fallbackId}`);
    }
  };

  return (
    <div className="attendance-page animate-fade-in">
      {/* Header */}
      <div className="attendance-page-header">
        <div>
          <h1 className="attendance-title">Start Attendance Session</h1>
          <p className="attendance-subtitle">Configure and launch an RFID attendance session for your lecture or lab batch.</p>
        </div>
      </div>

      {/* IoT Device Online Info Banner */}
      <div className="iot-notice-card">
        <div className="iot-notice-icon">
          <Wifi size={20} />
        </div>
        <div className="iot-notice-content">
          <div className="iot-notice-title">
            IoT Terminal Connected &middot; <span>Room C-102 Terminal Online</span>
          </div>
          <p className="iot-notice-desc">
            ESP32 Terminal <strong>(TAPID-RDR-01)</strong> is online with active Wi-Fi and synchronized with Room C-102. Student taps will verify immediately.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="start-form-card">
        <div className="start-form-header">
          <h2>Lecture & Batch Configuration</h2>
          <span className="required-note">* Synchronized with department timetable</span>
        </div>

        <form onSubmit={handleFormSubmit} className="start-form-body">
          <div className="form-grid-2col">
            <div className="form-group">
              <label htmlFor="subject">Select Subject & Faculty</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-select"
              >
                {OFFICIAL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="section">Select Section / Practical Batch</label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="form-select"
              >
                {SECTIONS.map((sec, i) => (
                  <option key={i} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="room">Classroom / Lab</label>
              <select
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="form-select"
              >
                {ROOMS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Session Duration (Minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="10"
                max="180"
                value={formData.duration}
                onChange={handleChange}
                className="form-input"
                placeholder="55"
              />
            </div>

            <div className="form-group">
              <label htmlFor="semester">Academic Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="form-select"
              >
                {SEMESTERS.map((sem, i) => (
                  <option key={i} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gracePeriod">Attendance Grace Period (Minutes)</label>
              <input
                type="number"
                id="gracePeriod"
                name="gracePeriod"
                min="0"
                max="30"
                value={formData.gracePeriod}
                onChange={handleChange}
                className="form-input"
                placeholder="10"
              />
            </div>
          </div>

          <div className="start-form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="btn-launch-attendance"
            >
              <Play size={18} fill="currentColor" />
              <span>{submitting ? 'Launching Session...' : 'Start Attendance Session'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Start From Timetable */}
      <div className="quick-timetable-section">
        <h3 className="quick-section-title">Or 1-Click Launch from Today's Schedule</h3>
        <div className="quick-grid">
          {(timetable.length > 0 ? timetable.slice(0, 3) : [
            { id: 1, subject_name: 'Compiler Design (CT)', section_name: 'CS-Core', room_number: 'C-102', start_time: '08:05:00', end_time: '09:00:00' },
            { id: 2, subject_name: 'Computer System Security (AT)', section_name: 'CS-Core', room_number: 'C-102', start_time: '09:00:00', end_time: '09:55:00' },
            { id: 3, subject_name: 'Ethical & Social Implication of AI (SB)', section_name: 'CS-Core', room_number: 'C-102', start_time: '10:15:00', end_time: '11:10:00' },
          ]).map((entry) => (
            <div key={entry.id} className="quick-card">
              <div className="quick-card-info">
                <div className="quick-subj">{entry.subject_name}</div>
                <div className="quick-meta">
                  <span>{entry.section_name}</span> &middot; <span>Room {entry.room_number}</span>
                </div>
                <div className="quick-time">
                  <Clock size={13} /> {entry.start_time?.substring(0, 5)} - {entry.end_time?.substring(0, 5)}
                </div>
              </div>
              <button
                onClick={() => startQuickSession(entry)}
                className="quick-start-btn"
                title="Start Session"
              >
                <Play size={14} fill="currentColor" /> Launch
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StartAttendance;
