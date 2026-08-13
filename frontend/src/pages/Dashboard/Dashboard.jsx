import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, MonitorPlay, Users } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await api.get('/timetable');
        setTimetable(response.data);
      } catch (err) {
        console.error('Failed to fetch timetable', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  // Group classes by day for a better view
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="text-secondary">Welcome back. Here is your schedule.</p>
        </div>
        <div className="admin-actions">
          <Link to="/attendance" className="admin-action-link">
            <MonitorPlay size={18} />
            <span>Start Attendance</span>
          </Link>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-panel glass-panel wide">
          <div className="panel-title-row">
            <h2>Your Classes ({today})</h2>
            <Link to="/reports">View reports</Link>
          </div>
          
          {loading ? (
            <div className="p-8 text-center"><div className="loader"></div></div>
          ) : (
            <div className="stats-grid mt-4">
              {timetable.filter(c => c.day_of_week === today).map((cls) => (
                <div key={cls.id} className="stat-card glass-panel border-blue">
                  <div className="stat-icon text-blue">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{cls.subject_name}</h3>
                    <p>{cls.section_name} &middot; Room {cls.room_number}</p>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {cls.start_time.substring(0,5)} - {cls.end_time ? cls.end_time.substring(0,5) : 'Ongoing'}
                    </p>
                  </div>
                </div>
              ))}
              {timetable.filter(c => c.day_of_week === today).length === 0 && (
                <div className="empty-text">No classes scheduled for today.</div>
              )}
            </div>
          )}
        </section>

        <section className="admin-panel glass-panel wide mt-4">
          <h2>Weekly Timetable</h2>
          {loading ? (
             <div className="p-8 text-center"><div className="loader"></div></div>
          ) : (
            <div className="admin-table-wrap mt-4">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Section</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((cls) => (
                    <tr key={cls.id}>
                      <td>
                        <span className={`status-pill ${cls.day_of_week === today ? 'active' : 'offline'}`}>
                          {cls.day_of_week}
                        </span>
                      </td>
                      <td>
                        <div className="cell-details">
                          <strong>{cls.start_time.substring(0,5)}</strong>
                          <span className="cell-details-sub">to {cls.end_time ? cls.end_time.substring(0,5) : '?'}</span>
                        </div>
                      </td>
                      <td>{cls.subject_name}</td>
                      <td>{cls.section_name}</td>
                      <td>Room {cls.room_number}</td>
                    </tr>
                  ))}
                  {timetable.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-cell">No classes in your timetable.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
