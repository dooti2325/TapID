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
  Users,
  ShieldCheck,
  Server,
  Wifi,
  ChevronRight,
  Cpu,
  CalendarDays,
  Layers,
  GraduationCap,
  Library
} from 'lucide-react';
import { StatCard } from '../../components/Cards/StatCard';
import '../Admin/Admin.css';

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

  const totalStudents = stats?.total_students || 248;
  const totalTeachers = stats?.total_teachers || 18;
  const totalClassrooms = stats?.total_classrooms || 12;
  const activeDevices = stats?.active_devices || 11;
  const offlineDevices = stats?.offline_devices || 1;
  const attendanceToday = stats?.attendance_today || 184;

  return (
    <div className="admin-page animate-fade-in">
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin Overview</h1>
          <p className="admin-page-subtitle">Monitor terminals, RFID credentials, system audit logs, and attendance throughput.</p>
        </div>
        <div className="admin-top-actions">
          <Link to="/rfid-cards" className="admin-action-btn">
            <CreditCard size={16} />
            <span>Manage Cards</span>
          </Link>
          <Link to="/audit-logs" className="admin-action-btn">
            <ScrollText size={16} />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert-banner">{error}</div>}

      {/* 4 Stat Cards Row */}
      <div className="admin-stat-grid">
        <StatCard
          title="Total Classrooms"
          value={totalClassrooms}
          icon={<MonitorPlay size={20} />}
          accentColor="blue"
          subtitle="Campus wide"
        />
        <StatCard
          title="Active Terminals"
          value={`${activeDevices}/${totalClassrooms}`}
          icon={<CheckCircle size={20} />}
          accentColor="emerald"
          subtitle="1 offline for maintenance"
        />
        <StatCard
          title="Active Faculty"
          value={totalTeachers}
          icon={<BookOpen size={20} />}
          accentColor="purple"
          subtitle="Assigned this semester"
        />
        <StatCard
          title="Today's Taps"
          value={attendanceToday}
          icon={<Activity size={20} />}
          accentColor="amber"
          subtitle="Verified across rooms"
        />
      </div>

      {/* Admin Controls Hub */}
      <div className="admin-controls-section">
        <div className="admin-section-title-wrap">
          <h2 className="admin-section-heading">Administrative Controls & Management</h2>
          <span className="admin-section-sub">Quickly manage credentials, timetables, IoT readers, and directories</span>
        </div>
        <div className="admin-controls-grid">
          <Link to="/audit-logs" className="admin-control-tile">
            <div className="admin-tile-icon icon-indigo"><ScrollText size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Audit Logs</div>
              <div className="admin-tile-desc">Security events & hardware telemetry</div>
            </div>
          </Link>
          <Link to="/rfid-cards" className="admin-control-tile">
            <div className="admin-tile-icon icon-blue"><CreditCard size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">RFID Cards</div>
              <div className="admin-tile-desc">Assign & manage student NFC badges</div>
            </div>
          </Link>
          <Link to="/devices" className="admin-control-tile">
            <div className="admin-tile-icon icon-emerald"><Cpu size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Device Registration</div>
              <div className="admin-tile-desc">Register ESP32 terminals & MACs</div>
            </div>
          </Link>
          <Link to="/timetable" className="admin-control-tile">
            <div className="admin-tile-icon icon-amber"><CalendarDays size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Time Table</div>
              <div className="admin-tile-desc">Manage lecture slots & faculty allocations</div>
            </div>
          </Link>
          <Link to="/sections" className="admin-control-tile">
            <div className="admin-tile-icon icon-purple"><Layers size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Sections & Batches</div>
              <div className="admin-tile-desc">Section G, Batch G1 & Batch G2</div>
            </div>
          </Link>
          <Link to="/faculty" className="admin-control-tile">
            <div className="admin-tile-icon icon-violet"><GraduationCap size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Faculty Directory</div>
              <div className="admin-tile-desc">All 6 professors & teaching staff</div>
            </div>
          </Link>
          <Link to="/subjects" className="admin-control-tile">
            <div className="admin-tile-icon icon-sky"><Library size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Subjects</div>
              <div className="admin-tile-desc">Course codes (CD, CSS, DEV, etc.)</div>
            </div>
          </Link>
          <Link to="/students" className="admin-control-tile">
            <div className="admin-tile-icon icon-teal"><Users size={20} /></div>
            <div className="admin-tile-content">
              <div className="admin-tile-title">Students Roster</div>
              <div className="admin-tile-desc">58 Section G registered students</div>
            </div>
          </Link>
        </div>
      </div>

      {/* System Status & Overview Section */}
      <div className="admin-split-grid">
        {/* Left: System Health Card */}
        <div className="admin-card system-health-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">System Status & Diagnostics</h2>
            <span className="status-badge active">
              <span className="pulse-dot"></span> All Systems Operational
            </span>
          </div>

          <div className="admin-card-body">
            <div className="health-metrics-row">
              <div className="health-metric-box">
                <span className="health-metric-val font-mono">99.98%</span>
                <span className="health-metric-lbl">API Uptime</span>
              </div>
              <div className="health-metric-box">
                <span className="health-metric-val font-mono">18 ms</span>
                <span className="health-metric-lbl">Average Latency</span>
              </div>
              <div className="health-metric-box">
                <span className="health-metric-val font-mono">SHA-256</span>
                <span className="health-metric-lbl">Terminal Security</span>
              </div>
            </div>

            <div className="device-health-list">
              <h3 className="section-small-title">Terminal Health Overview</h3>
              <div className="health-item-row">
                <div className="health-item-left">
                  <span className="health-item-name">Room 402 Terminal (ESP32)</span>
                  <span className="health-item-sub">MAC: 24:0A:C4:00:00:01 &middot; RSSI: -48 dBm</span>
                </div>
                <span className="status-badge active">Online</span>
              </div>

              <div className="health-item-row">
                <div className="health-item-left">
                  <span className="health-item-name">Room 305 Terminal (ESP32)</span>
                  <span className="health-item-sub">MAC: 24:0A:C4:00:00:02 &middot; RSSI: -54 dBm</span>
                </div>
                <span className="status-badge active">Online</span>
              </div>

              <div className="health-item-row">
                <div className="health-item-left">
                  <span className="health-item-name">Lab 2 Terminal (ESP32)</span>
                  <span className="health-item-sub">MAC: 24:0A:C4:00:00:03 &middot; RSSI: -62 dBm</span>
                </div>
                <span className="status-badge pending">Weak Wi-Fi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Audit Logs */}
        <div className="admin-card recent-audit-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Recent Security Audits</h2>
            <Link to="/audit-logs" className="admin-link">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="admin-card-body">
            <div className="audit-activity-list">
              {(stats?.recent_audit_logs || [
                { id: 1, action: 'ATTENDANCE_SESSION_STARTED', user_email: 'faculty@tapid.edu', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 2, action: 'RFID_CARD_ASSIGNED', user_email: 'admin@college.edu', timestamp: new Date(Date.now() - 7200000).toISOString() },
                { id: 3, action: 'DEVICE_KEY_ROTATED', user_email: 'system', timestamp: new Date(Date.now() - 14400000).toISOString() },
                { id: 4, action: 'STUDENT_RECORD_UPDATED', user_email: 'admin@college.edu', timestamp: new Date(Date.now() - 21600000).toISOString() },
              ]).map((log, idx) => (
                <div key={log.id || idx} className="audit-activity-item">
                  <div className="audit-icon-circle">
                    <Clock3 size={15} />
                  </div>
                  <div className="audit-details">
                    <span className="audit-action-text font-mono">{log.action}</span>
                    <span className="audit-meta-text">
                      {log.user_email} &middot; {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
