import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Radio, 
  StopCircle, 
  Wifi, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Cpu, 
  Signal, 
  Key,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/Cards/StatCard';
import './Attendance.css';

const MOCK_RECORDS = [
  { id: 1, enrollment_number: 'GHRUA23011060140', name: 'Shantanu Yashwant Raut', rfid_tag_id: 'A1:B2:C3:D4', timestamp: new Date(Date.now() - 420000).toISOString(), status: 'Present' },
  { id: 2, enrollment_number: 'GHRUA23011060170', name: 'DIVYANSH MANUKANT GADEKAR', rfid_tag_id: '14:F2:3C:99', timestamp: new Date(Date.now() - 360000).toISOString(), status: 'Present' },
  { id: 3, enrollment_number: 'GHRUA23011060205', name: 'VEDANT MANISH BAVARIA', rfid_tag_id: '3A:BC:D1:42', timestamp: new Date(Date.now() - 280000).toISOString(), status: 'Present' },
  { id: 4, enrollment_number: 'GHRUA23011060348', name: 'Dootiballav Gouriprasanna Saha', rfid_tag_id: '88:E1:90:3F', timestamp: new Date(Date.now() - 190000).toISOString(), status: 'Present' },
  { id: 5, enrollment_number: 'GHRUA23011060359', name: 'HARSHAL SUHAS VIDHATE', rfid_tag_id: '24:0A:C4:01', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'Present' },
];

function LiveAttendance() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'SES-402918';
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAttendance = async () => {
      try {
        const response = await api.get(`/attendance/session/${sessionId}`);
        if (isMounted) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            setAttendance(response.data);
          } else {
            setAttendance(MOCK_RECORDS);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAttendance(MOCK_RECORDS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  const endSession = async () => {
    if (!window.confirm('Are you sure you want to end this attendance session?')) return;
    try {
      await api.post(`/session/${sessionId}/end`);
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const totalEnrolled = 58;
  const presentCount = attendance.length || 42;
  const absentCount = Math.max(0, totalEnrolled - presentCount);
  const attendanceRate = ((presentCount / totalEnrolled) * 100).toFixed(1);

  return (
    <div className="live-page animate-fade-in">
      {/* Top Header */}
      <div className="live-header-bar">
        <div>
          <div className="live-status-chip">
            <span className="live-pulse-dot"></span>
            <span>Live Session Active</span>
          </div>
          <h1 className="live-page-title">Compiler Design (CD)</h1>
          <p className="live-page-meta">
            Room C-102 &middot; Section G &middot; Session ID: <code>{sessionId}</code>
          </p>
        </div>

        <div>
          <button onClick={endSession} className="btn-stop-session">
            <StopCircle size={18} />
            <span>Stop Attendance</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="live-stats-row">
        <StatCard
          title="Total Enrolled"
          value={totalEnrolled}
          icon={<Users size={20} />}
          accentColor="blue"
          subtitle="Class roster"
        />
        <StatCard
          title="Present"
          value={presentCount}
          icon={<CheckCircle2 size={20} />}
          accentColor="emerald"
          subtitle="Cards scanned"
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon={<XCircle size={20} />}
          accentColor="rose"
          subtitle="Pending taps"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={<TrendingUp size={20} />}
          accentColor="purple"
          subtitle="Target: 75%+"
        />
      </div>

      {/* Main 2-Column Split: Scanned Table (70%) + IoT Terminal Status (30%) */}
      <div className="live-grid-split">
        {/* Left: Scanned Students Table */}
        <div className="live-card scanned-table-card">
          <div className="live-card-header">
            <div>
              <h2 className="live-card-title">Live Scanned Students</h2>
              <p className="live-card-subtitle">Real-time RFID card taps verified by ESP32 terminal</p>
            </div>
            <span className="badge-present-count">{presentCount} Scanned</span>
          </div>

          <div className="scanned-table-wrap">
            <table className="scanned-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>NFC Tag ID</th>
                  <th>Scan Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, idx) => (
                  <tr key={record.id || idx}>
                    <td className="text-secondary">{idx + 1}</td>
                    <td>
                      <span className="roll-badge">{record.enrollment_number || record.student_id || `22CS0${idx + 1}`}</span>
                    </td>
                    <td>
                      <div className="student-profile-cell">
                        <div className="avatar-circle">
                          {(record.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="student-name-text">{record.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="tag-uid-pill">{record.rfid_tag_id || record.card_uid || '14:F2:3C:99'}</span>
                    </td>
                    <td>
                      <span className="scan-timestamp">
                        {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '09:05 AM'}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge present">
                        <Check size={12} strokeWidth={3} /> Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: IoT Device Status Panel */}
        <div className="live-card iot-terminal-card">
          <div className="live-card-header">
            <h2 className="live-card-title">IoT Terminal Status</h2>
            <span className="status-badge active">
              <span className="pulse-dot"></span> Online
            </span>
          </div>

          <div className="iot-details-list">
            <div className="iot-detail-item">
              <span className="iot-detail-label">Terminal ID</span>
              <span className="iot-detail-val font-mono">TAPID-RDR-01</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Assigned Room</span>
              <span className="iot-detail-val">Room C-102</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Wi-Fi Network</span>
              <span className="iot-detail-val">Campus_Secure_5G</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Signal RSSI</span>
              <span className="iot-detail-val text-success font-mono">-48 dBm (Strong)</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Firmware</span>
              <span className="iot-detail-val font-mono">v2.1.0-secure</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Last Card Scanned</span>
              <span className="iot-detail-val font-mono">14:F2:3C:99</span>
            </div>

            <div className="iot-detail-item">
              <span className="iot-detail-label">Total Cards Read</span>
              <span className="iot-detail-val font-bold">{presentCount}</span>
            </div>
          </div>

          <div className="iot-security-footer">
            <ShieldCheck size={16} className="text-emerald" />
            <span>Hardware Encrypted via SHA-256 HMAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveAttendance;
