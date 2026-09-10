import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MonitorPlay,
  Users,
  TrendingUp,
  Radio,
  BookOpen,
  ChevronRight,
  Play
} from 'lucide-react';
import { StatCard } from '../../components/Cards/StatCard';
import './Dashboard.css';

const WEEKLY_SCHEDULE = {
  Monday: [
    { id: 101, subject_code: 'CD', subject_name: 'Compiler Design', teacher: 'Chetram Thakur (CT)', time: '08:05 AM - 09:00 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 102, subject_code: 'CSS', subject_name: 'Computer System Security', teacher: 'Ashish Trivedi (AT)', time: '09:00 AM - 09:55 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 103, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', teacher: 'Dr. Sumalata Bhandari (SB)', time: '10:15 AM - 11:10 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'active' },
    { id: 104, subject_code: 'SPORTS', subject_name: 'Sports & Athletics', teacher: 'Sports Dept', time: '11:10 AM - 12:05 PM', room_number: 'Ground', section_name: 'CS-Core', status: 'pending' },
    { id: 105, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', teacher: 'Faculty Guides', time: '12:10 PM - 02:00 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' }
  ],
  Tuesday: [
    { id: 201, subject_code: 'CSS', subject_name: 'Computer System Security', teacher: 'Ashish Trivedi (AT)', time: '08:05 AM - 09:00 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 202, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', teacher: 'Dr. Trupti Meshram (TM)', time: '09:00 AM - 09:55 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'active' },
    { id: 203, subject_code: 'CD', subject_name: 'Compiler Design', teacher: 'Chetram Thakur (CT)', time: '10:15 AM - 11:10 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' },
    { id: 204, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', teacher: 'Dr. Sumalata Bhandari (SB)', time: '11:10 AM - 12:05 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' },
    { id: 205, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', teacher: 'Faculty Guides', time: '12:10 PM - 02:00 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' }
  ],
  Wednesday: [
    { id: 301, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', teacher: 'Dr. Sumalata Bhandari (SB)', time: '08:05 AM - 09:00 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 302, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', teacher: 'Amol Dhankar (AD)', time: '09:00 AM - 09:55 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 303, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', teacher: 'Dr. Trupti Meshram (TM)', time: '10:15 AM - 11:10 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'active' },
    { id: 304, subject_code: 'CSS', subject_name: 'Computer System Security', teacher: 'Ashish Trivedi (AT)', time: '11:10 AM - 12:05 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' },
    { id: 305, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', teacher: 'Faculty Guides', time: '12:10 PM - 02:00 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' }
  ],
  Thursday: [
    { id: 401, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', teacher: 'Amol Dhankar (AD)', time: '08:05 AM - 09:00 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 402, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', teacher: 'Dr. Trupti Meshram (TM)', time: '09:00 AM - 09:55 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 403, subject_code: 'AIML', subject_name: 'Artificial Intelligence & Machine Learning', teacher: 'Amol Dhankar (AD)', time: '10:15 AM - 11:10 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'active' },
    { id: 404, subject_code: 'CD', subject_name: 'Compiler Design', teacher: 'Chetram Thakur (CT)', time: '11:10 AM - 12:05 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' },
    { id: 405, subject_code: 'CD-G1', subject_name: 'Compiler Design Practical (G1)', teacher: 'Chetram Thakur (CT)', time: '12:10 PM - 02:00 PM', room_number: 'C-117', section_name: 'G1 (Roll 1-33)', status: 'pending' }
  ],
  Friday: [
    { id: 501, subject_code: 'DEV', subject_name: 'DevOps: Software Dev & IT Ops', teacher: 'Dr. Trupti Meshram (TM)', time: '08:05 AM - 09:00 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'completed' },
    { id: 502, subject_code: 'ES-AI', subject_name: 'Ethical & Social Implication of AI', teacher: 'Dr. Sumalata Bhandari (SB)', time: '09:00 AM - 09:55 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'active' },
    { id: 503, subject_code: 'CD-G2', subject_name: 'Compiler Design Practical (G2)', teacher: 'Prachi Jain (PSJ)', time: '10:15 AM - 12:05 PM', room_number: 'C-102', section_name: 'G2 (Roll 34+)', status: 'pending' },
    { id: 504, subject_code: 'PROJECT', subject_name: 'Capstone Project Lab', teacher: 'Faculty Guides', time: '12:10 PM - 02:00 PM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' }
  ],
  Saturday: [
    { id: 601, subject_code: 'SPORTS', subject_name: 'Sports & Athletics Session I', teacher: 'Sports Dept', time: '08:05 AM - 09:55 AM', room_number: 'Ground', section_name: 'CS-Core', status: 'completed' },
    { id: 602, subject_code: 'SPORTS', subject_name: 'Sports & Athletics Session II', teacher: 'Sports Dept', time: '10:15 AM - 02:00 PM', room_number: 'Ground', section_name: 'CS-Core', status: 'pending' }
  ],
  Sunday: [
    { id: 701, subject_code: 'CD', subject_name: 'Compiler Design (Review Session)', teacher: 'Chetram Thakur (CT)', time: '10:00 AM - 11:30 AM', room_number: 'C-102', section_name: 'CS-Core', status: 'pending' }
  ]
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.full_name ? user.full_name.split(' ')[0] : 'Faculty');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await api.get('/timetable');
        if (Array.isArray(response.data) && response.data.length > 0) {
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayClassesFromApi = timetable.filter(c => c.day_of_week === today);
  const displayClasses = todayClassesFromApi.length > 0 ? todayClassesFromApi : (WEEKLY_SCHEDULE[today] || WEEKLY_SCHEDULE.Thursday);

  return (
    <div className="faculty-dashboard animate-fade-in">
      {/* Top Welcome Header */}
      <div className="dashboard-welcome-row">
        <div>
          <h1 className="welcome-title">Welcome, {firstName} </h1>
          <p className="welcome-subtitle">Here's your class timetable for today ({today}).</p>
        </div>
        <div className="welcome-actions">
          <Link to="/attendance" className="btn btn-primary start-attendance-cta">
            <MonitorPlay size={18} />
            <span>Start Attendance</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="stats-metric-grid">
        <StatCard
          title="Today's Classes"
          value={displayClasses.length}
          icon={<Calendar size={20} />}
          accentColor="blue"
          subtitle="Scheduled lectures"
        />
        <StatCard
          title="Today's Attendance"
          value="88.2%"
          icon={<TrendingUp size={20} />}
          accentColor="emerald"
          subtitle="Verified via RFID"
          trend="+3.4%"
          trendUp={true}
        />
        <StatCard
          title="Total Students"
          value="68"
          icon={<Users size={20} />}
          accentColor="amber"
          subtitle="Batches G1 (1-33) & G2 (34+)"
        />
        <StatCard
          title="Active Terminal"
          value="C-102"
          icon={<Radio size={20} />}
          accentColor="purple"
          subtitle="ESP32 Terminal Ready"
        />
      </div>

      {/* Today's Lectures Card */}
      <div className="dashboard-card lectures-card">
        <div className="dashboard-card-header">
          <div>
            <h2 className="dashboard-card-title">Today's Schedule ({today})</h2>
            <p className="dashboard-card-subtitle">Official Semester Timetable &middot; {displayClasses.length} sessions</p>
          </div>
          <Link to="/attendance" className="card-header-link">
            Launch Session <ChevronRight size={16} />
          </Link>
        </div>

        <div className="lectures-table-wrapper">
          <table className="lectures-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Time</th>
                <th>Room</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayClasses.map((cls) => {
                const isOngoing = cls.status === 'active' || cls.status === 'Active';
                const isCompleted = cls.status === 'completed';
                const timeString = cls.time || `${cls.start_time?.substring(0, 5)} - ${cls.end_time?.substring(0, 5)}`;
                const subjectText = cls.subject_name || cls.subject_code;
                const roomText = cls.room_number ? `Room ${cls.room_number}` : 'Room C-102';
                const teacherText = cls.teacher || cls.faculty_name || 'Faculty';

                return (
                  <tr key={cls.id}>
                    <td>
                      <div className="subject-cell">
                        <div className="subject-icon-box">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <div className="subject-name">{subjectText}</div>
                          <div className="subject-sub">
                            {cls.subject_code || 'CS'} &middot; {teacherText} &middot; {cls.section_name || 'CS-Core'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <Clock size={14} className="cell-icon" />
                        <span>{timeString}</span>
                      </div>
                    </td>
                    <td>
                      <span className="room-pill">{roomText}</span>
                    </td>
                    <td>
                      {isOngoing ? (
                        <span className="status-badge active">
                          <span className="pulse-dot"></span> Active
                        </span>
                      ) : isCompleted ? (
                        <span className="status-badge completed">Completed</span>
                      ) : (
                        <span className="status-badge pending">Upcoming</span>
                      )}
                    </td>
                    <td className="text-right">
                      {isOngoing ? (
                        <Link to="/attendance/live" className="action-btn action-view">
                          View Live
                        </Link>
                      ) : isCompleted ? (
                        <Link to="/reports" className="action-btn action-secondary">
                          Report
                        </Link>
                      ) : (
                        <Link to="/attendance" className="action-btn action-start">
                          <Play size={12} fill="currentColor" /> Start
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
