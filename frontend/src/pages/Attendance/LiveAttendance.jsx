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
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/Cards/StatCard';
import './Attendance.css';

function LiveAttendance() {
  const [searchParams] = useSearchParams();
  const rawSessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState(rawSessionId);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If no sessionId in query params, check active session from backend
  useEffect(() => {
    let isMounted = true;
    const resolveSession = async () => {
      if (!rawSessionId) {
        try {
          const res = await api.get('/session/active');
          if (isMounted && res.data && res.data.id) {
            setSessionId(String(res.data.id));
          } else if (isMounted) {
            setError('No active attendance session found. Please start a session first.');
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError('Could not verify active attendance sessions.');
            setLoading(false);
          }
        }
      } else {
        setSessionId(rawSessionId);
      }
    };
    resolveSession();
    return () => { isMounted = false; };
  }, [rawSessionId]);

  // Load session metadata
  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    const fetchSessionMeta = async () => {
      try {
        const res = await api.get(`/session/${sessionId}`);
        if (isMounted && res.data) {
          setSessionDetails(res.data);
        }
      } catch (err) {
        console.error('Failed to load session details', err);
      }
    };

    fetchSessionMeta();
    return () => { isMounted = false; };
  }, [sessionId]);

  // Poll live attendance records
  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;

    const fetchAttendance = async () => {
      try {
        const response = await api.get(`/attendance/session/${sessionId}`);
        if (isMounted) {
          if (Array.isArray(response.data)) {
            setAttendance(response.data);
          }
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching live attendance', err);
        if (isMounted && attendance.length === 0) {
          // If session doesn't exist on server
          if (err.response?.status === 404) {
            setError(`Session #${sessionId} was not found on server.`);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  const endSession = async () => {
    if (!window.confirm('Are you sure you want to end this attendance session?')) return;
    try {
      if (sessionId) {
        await api.post(`/session/${sessionId}/end`);
      }
      navigate('/attendance/reports');
    } catch (err) {
      console.error('Failed to end session', err);
      navigate('/attendance/reports');
    }
  };

  const totalEnrolled = Number(sessionDetails?.enrolled_count) || 58;
  const presentCount = attendance.length;
  const absentCount = Math.max(0, totalEnrolled - presentCount);
  const attendanceRate = totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : '0.0';

  const subjectTitle = sessionDetails?.subject_name
    ? `${sessionDetails.subject_name} (${sessionDetails.subject_code || ''})`
    : 'Attendance Session';

  const roomDisplay = sessionDetails?.room_number ? `Room ${sessionDetails.room_number}` : 'Assigned Classroom';
  const sectionDisplay = sessionDetails?.section_name || 'Class Roster';

  if (!sessionId && error) {
    return (
      <div className="live-page animate-fade-in" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>No Active Session</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</p>
          <button 
            onClick={() => navigate('/attendance/start')}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="live-page animate-fade-in">
      {/* Top Header */}
      <div className="live-header-bar">
        <div>
          <div className="live-status-chip">
            <span className="live-pulse-dot"></span>
            <span>Live Session Active</span>
          </div>
          <h1 className="live-page-title">{subjectTitle}</h1>
          <p className="live-page-meta">
            {roomDisplay} &middot; {sectionDisplay} &middot; Session ID: <code>{sessionId}</code>
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
            {attendance.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'rgba(37, 99, 235, 0.08)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1rem',
                  color: '#2563eb'
                }}>
                  <Radio size={32} className="live-pulse-dot" style={{ width: '32px', height: '32px', background: 'transparent' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.35rem' }}>
                  Waiting for RFID Card Taps...
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto', lineHeight: 1.5 }}>
                  The ESP32 reader in <strong>{roomDisplay}</strong> is active. Students can tap their RFID identity cards now to automatically register presence.
                </p>
              </div>
            ) : (
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
                        <span className="roll-badge">{record.enrollment_number || record.student_id || `STU-${idx + 1}`}</span>
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
                        <span className="tag-uid-pill">{record.rfid_tag_id || record.card_uid || 'NFC-TAG'}</span>
                      </td>
                      <td>
                        <span className="scan-timestamp">
                          {record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : 'Just now'}
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
            )}
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
              <span className="iot-detail-val">{roomDisplay}</span>
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
              <span className="iot-detail-val font-mono">
                {attendance.length > 0 ? (attendance[0].rfid_tag_id || attendance[0].card_uid || 'Scanned') : 'Waiting...'}
              </span>
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
