import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Radio, StopCircle, Wifi, Users, Clock } from 'lucide-react';
import api from '../../services/api';
import './Attendance.css';

function LiveAttendance() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/attendance');
      return;
    }

    const fetchAttendance = async () => {
      try {
        const response = await api.get(`/attendance/session/${sessionId}`);
        setAttendance(response.data);
      } catch (err) {
        console.error('Failed to fetch live attendance', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [sessionId, navigate]);

  const endSession = async () => {
    if (!window.confirm('Are you sure you want to end this session?')) return;
    try {
      await api.post(`/session/${sessionId}/end`);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to end session');
    }
  };

  return (
    <div className="live-attendance-container fade-in">
      <div className="live-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="pulse-indicator">
              <span className="ping"></span>
              <span className="dot"></span>
            </div>
            Live Session
          </h1>
          <p className="text-gray-400 mt-2">Session ID: {sessionId}</p>
        </div>
        <button 
          onClick={endSession}
          className="btn-end-session"
        >
          <StopCircle size={18} />
          <span>End Session</span>
        </button>
      </div>

      <div className="live-layout">
        <div className="attendance-table-container glass-panel">
          <div className="attendance-table-header">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              Recent Taps
            </h2>
            <span className="attendance-count">{attendance.length} Present</span>
          </div>
          
          <div className="attendance-list">
            {loading && attendance.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-400"></div>
              </div>
            ) : attendance.length > 0 ? (
              <div>
                {attendance.map((record, idx) => (
                  <div key={idx} className="attendance-row">
                    <div className="student-info">
                      <div className="student-avatar">
                        {record.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-details">
                        <h4>{record.name}</h4>
                        <p>{record.enrollment_number}</p>
                      </div>
                    </div>
                    <div className="scan-time">
                      <p className="flex items-center gap-1 justify-end">
                        <Clock size={14} />
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </p>
                      <span className="status-present">Present</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Radio size={48} className="text-gray-600 mb-2" />
                <p>Waiting for students to tap their RFID cards...</p>
              </div>
            )}
          </div>
        </div>

        <div className="device-status-card glass-panel">
           <h3 className="flex items-center gap-2">
             <Wifi size={20} className="text-emerald-400" />
             Device Status
           </h3>
           
           <div className="status-indicator">
             <div className="reader-online-pulse">
                <span className="ping"></span>
                <span className="dot"></span>
             </div>
             <span className="text">Reader Online & Listening</span>
           </div>
           
           <p>The ESP32 terminal assigned to this classroom is currently active. It will automatically transmit RFID taps directly to this dashboard in real time.</p>
        </div>
      </div>
    </div>
  );
}

export default LiveAttendance;
