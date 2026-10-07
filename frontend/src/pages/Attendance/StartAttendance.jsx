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
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    const fetchData = async () => {
      try {
        const [ttRes, subRes, clsRes, devRes] = await Promise.allSettled([
          api.get('/timetable'),
          api.get('/subjects'),
          api.get('/classrooms'),
          api.get('/devices')
        ]);
        if (ttRes.status === 'fulfilled' && Array.isArray(ttRes.value.data)) {
          setTimetable(ttRes.value.data);
        }
        if (subRes.status === 'fulfilled' && Array.isArray(subRes.value.data)) {
          setSubjects(subRes.value.data);
        }
        if (clsRes.status === 'fulfilled' && Array.isArray(clsRes.value.data)) {
          setClassrooms(clsRes.value.data);
        }
        if (devRes.status === 'fulfilled' && Array.isArray(devRes.value.data)) {
          setDevices(devRes.value.data);
        }
      } catch (err) {
        console.error('Failed to fetch attendance options', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    setError(null);
    setSubmitting(true);
    try {
      const selectedSubject = subjects.find(s => s.name === formData.subject || s.code === formData.subject || formData.subject.includes(s.code));
      const cleanRoom = formData.room.replace('Room', '').trim();
      const selectedClassroom = classrooms.find(c => c.room_number === formData.room || c.room_number === cleanRoom);
      const matching = timetable.find(
        (t) => t.subject_name?.includes(formData.subject.split(':')[0]) || t.room_number?.includes(cleanRoom)
      );
      
      const payload = {
        timetable_id: matching?.id || null,
        subject_id: selectedSubject?.id || matching?.subject_id || null,
        classroom_id: selectedClassroom?.id || matching?.classroom_id || null,
        subject_name: formData.subject,
        section_name: formData.section,
        room_number: formData.room,
        duration: formData.duration,
      };

      const response = await api.post('/session/start', payload);
      if (response.data && response.data.session_id) {
        navigate(`/attendance/live?sessionId=${response.data.session_id}`);
      } else {
        setError('Server did not return a valid session ID. Please try again.');
      }
    } catch (err) {
      console.error('Failed to start session', err);
      const msg = err.response?.data?.message || err.message || 'Failed to start session. Verify faculty status and device connection.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const startQuickSession = async (entry) => {
    setError(null);
    try {
      const response = await api.post('/session/start', {
        timetable_id: entry.id,
        subject_id: entry.subject_id,
        classroom_id: entry.classroom_id,
      });
      if (response.data && response.data.session_id) {
        navigate(`/attendance/live?sessionId=${response.data.session_id}`);
      } else {
        setError('Failed to start quick session.');
      }
    } catch (err) {
      console.error('Failed to start quick session', err);
      const msg = err.response?.data?.message || err.message || 'Failed to start quick session.';
      setError(msg);
    }
  };

  // Find selected classroom and its assigned device
  const currentCleanRoom = formData.room.replace('Room', '').trim();
  const currentClassroom = classrooms.find(c => c.room_number === formData.room || c.room_number === currentCleanRoom);
  const activeDevice = devices.find(d => d.classroom_id === currentClassroom?.id);

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
      {activeDevice ? (
        activeDevice.status === 'online' ? (
          <div className="iot-notice-card">
            <div className="iot-notice-icon">
              <Wifi size={20} />
            </div>
            <div className="iot-notice-content">
              <div className="iot-notice-title">
                IoT Terminal Connected &middot; <span>Room {currentCleanRoom} Terminal Online</span>
              </div>
              <p className="iot-notice-desc">
                ESP32 Terminal <strong>({activeDevice.device_id})</strong> is online with active Wi-Fi and synchronized with Room {currentCleanRoom}. Student taps will verify immediately.
              </p>
            </div>
          </div>
        ) : (
          <div className="iot-notice-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="iot-notice-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              <Wifi size={20} />
            </div>
            <div className="iot-notice-content">
              <div className="iot-notice-title" style={{ color: '#f87171' }}>
                IoT Terminal Offline &middot; <span>Room {currentCleanRoom} Terminal Offline</span>
              </div>
              <p className="iot-notice-desc" style={{ color: '#fca5a5' }}>
                ESP32 Terminal <strong>({activeDevice.device_id})</strong> is assigned to Room {currentCleanRoom} but is currently offline. Please ensure the device is powered on and connected to Wi-Fi.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="iot-notice-card" style={{ background: 'rgba(156, 163, 175, 0.1)', borderColor: 'rgba(156, 163, 175, 0.3)' }}>
          <div className="iot-notice-icon" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' }}>
            <Info size={20} />
          </div>
          <div className="iot-notice-content">
            <div className="iot-notice-title" style={{ color: '#9ca3af' }}>
              No Device Assigned &middot; <span>Room {currentCleanRoom}</span>
            </div>
            <p className="iot-notice-desc" style={{ color: '#d1d5db' }}>
              There is no RFID terminal assigned to Room {currentCleanRoom}. Please contact the system administrator to install and assign a device for attendance tracking.
            </p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="start-form-card">
        <div className="start-form-header">
          <h2>Lecture & Batch Configuration</h2>
          <span className="required-note">* Synchronized with department timetable</span>
        </div>

        {error && (
          <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <Info size={18} />
            <span>{error}</span>
          </div>
        )}

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
              disabled={submitting || !activeDevice || activeDevice.status !== 'online'}
              className="btn-launch-attendance"
              style={{ opacity: (!activeDevice || activeDevice.status !== 'online') ? 0.5 : 1, cursor: (!activeDevice || activeDevice.status !== 'online') ? 'not-allowed' : 'pointer' }}
            >
              <Play size={18} fill="currentColor" />
              <span>
                {submitting ? 'Launching Session...' : 
                 (!activeDevice ? 'No Device Assigned' : 
                 (activeDevice.status !== 'online' ? 'Device Offline' : 'Start Attendance Session'))}
              </span>
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
