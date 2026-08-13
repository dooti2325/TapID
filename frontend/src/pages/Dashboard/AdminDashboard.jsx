import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock3,
  CreditCard,
  MonitorPlay,
  Radio,
  ScrollText,
  Users
} from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin overview');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Students', value: stats?.total_students || 0, icon: <Users size={24} />, color: 'blue' },
    { title: 'Faculty', value: stats?.total_teachers || 0, icon: <BookOpen size={24} />, color: 'purple' },
    { title: 'Classrooms', value: stats?.total_classrooms || 0, icon: <MonitorPlay size={24} />, color: 'orange' },
    { title: 'Active Devices', value: stats?.active_devices || 0, icon: <CheckCircle size={24} />, color: 'green' },
    { title: 'Active Sessions', value: stats?.active_sessions || 0, icon: <Radio size={24} />, color: 'cyan' },
    { title: 'Taps Today', value: stats?.attendance_today || 0, icon: <Activity size={24} />, color: 'lime' },
    { title: 'Revoked Cards', value: stats?.revoked_cards || 0, icon: <CreditCard size={24} />, color: 'red' },
    { title: 'Unassigned Cards', value: stats?.unassigned_cards || 0, icon: <AlertTriangle size={24} />, color: 'amber' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Overview</h1>
          <p className="text-secondary">Monitor attendance operations, devices, cards, and audit activity.</p>
        </div>
        <div className="admin-actions">
          <Link to="/rfid-cards" className="admin-action-link">
            <CreditCard size={18} />
            <span>Cards</span>
          </Link>
          <Link to="/audit-logs" className="admin-action-link">
            <ScrollText size={18} />
            <span>Audit</span>
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert">{error}</div>}

      <div className="stats-grid">
        {statCards.map((card, idx) => (
          <div key={idx} className={`stat-card glass-panel border-${card.color}`}>
            <div className={`stat-icon text-${card.color}`}>
              {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="admin-grid">
        <section className="admin-panel glass-panel">
          <h2>System Status</h2>
          <div className={`system-state ${stats?.system_status === 'All Systems Operational' ? 'healthy' : 'warning'}`}>
            <div className="status-indicator"></div>
            <span>{stats?.system_status || 'All Systems Operational'}</span>
          </div>
          <div className="system-breakdown">
            <div>
              <strong>{stats?.offline_devices || 0}</strong>
              <span>Offline devices</span>
            </div>
            <div>
              <strong>{stats?.total_subjects || 0}</strong>
              <span>Subjects</span>
            </div>
          </div>
        </section>

        <section className="admin-panel glass-panel">
          <h2>Device Health</h2>
          <div className="admin-list">
            {(stats?.device_status || []).map((device) => (
              <div className="admin-list-row" key={device.id}>
                <div>
                  <strong>{device.room_number ? `Room ${device.room_number}` : 'Unassigned room'}</strong>
                  <span>{device.mac_address}</span>
                </div>
                <span className={`status-pill ${device.status}`}>{device.status}</span>
              </div>
            ))}
            {(stats?.device_status || []).length === 0 && <p className="empty-text">No devices registered.</p>}
          </div>
        </section>

        <section className="admin-panel glass-panel wide">
          <div className="panel-title-row">
            <h2>Recent Sessions</h2>
            <Link to="/reports">View reports</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>Started</th>
                  <th>Present</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_sessions || []).map((session) => (
                  <tr key={session.id}>
                    <td>{session.subject_name}</td>
                    <td>{session.faculty_name}</td>
                    <td>{session.room_number}</td>
                    <td>{new Date(session.start_time).toLocaleString()}</td>
                    <td>{session.present_count}</td>
                    <td><span className={`status-pill ${session.status}`}>{session.status}</span></td>
                  </tr>
                ))}
                {(stats?.recent_sessions || []).length === 0 && (
                  <tr><td colSpan="6" className="empty-cell">No attendance sessions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel glass-panel">
          <div className="panel-title-row">
            <h2>Recent Audit</h2>
            <Link to="/audit-logs">Open logs</Link>
          </div>
          <div className="admin-list">
            {(stats?.recent_audit_logs || []).map((log) => (
              <div className="admin-list-row audit-row" key={log.id}>
                <Clock3 size={18} />
                <div>
                  <strong>{log.action}</strong>
                  <span>{log.user_email || 'System'} · {new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {(stats?.recent_audit_logs || []).length === 0 && <p className="empty-text">No audit activity yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
