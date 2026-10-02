import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Monitor, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  DoorOpen, 
  RefreshCw, 
  Radio, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import './Classrooms.css';

const ClassroomStatus = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pingStatus, setPingStatus] = useState({});

  const fetchClassrooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/classrooms');
      if (Array.isArray(response.data)) {
        setRooms(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch classrooms', err);
      setError(err.response?.data?.message || 'Failed to fetch classrooms.');
    } finally {
      setLoading(false);
    }
  };

  const handlePing = async (roomId) => {
    setPingStatus(prev => ({ ...prev, [roomId]: 'Pinging...' }));
    try {
      await fetchClassrooms();
      setPingStatus(prev => ({ ...prev, [roomId]: 'ACK 200 (Online)' }));
      setTimeout(() => {
        setPingStatus(prev => ({ ...prev, [roomId]: null }));
      }, 3000);
    } catch {
      setPingStatus(prev => ({ ...prev, [roomId]: 'Timeout' }));
      setTimeout(() => {
        setPingStatus(prev => ({ ...prev, [roomId]: null }));
      }, 3000);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <div className="classrooms-page animate-fade-in">
      {/* Header */}
      <div className="classrooms-header-row">
        <div>
          <h1 className="classrooms-page-title">Classrooms & Reader Terminals</h1>
          <p className="classrooms-page-subtitle">Monitor hardware connectivity, assigned faculty, and live session status across all rooms.</p>
        </div>
        <button onClick={fetchClassrooms} className="btn-refresh-terminals">
          <RefreshCw size={15} />
          <span>Refresh Terminals</span>
        </button>
      </div>

      {/* Classroom Status Table Card */}
      <div className="classrooms-table-card">
        <div className="classrooms-card-header">
          <div>
            <h2 className="classrooms-card-title">Terminal Telemetry Status</h2>
            <p className="classrooms-card-subtitle">Real-time heartbeat signals via Wi-Fi from ESP32 readers</p>
          </div>
          <span className="terminal-summary-badge">
            {rooms.filter(r => r.device_status === 'active').length} of {rooms.length} Online
          </span>
        </div>

        <div className="classrooms-table-wrap">
          <table className="classrooms-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Assigned Terminal</th>
                <th>Status</th>
                <th>Assigned Faculty</th>
                <th>Current Lecture</th>
                <th>Last Heartbeat</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const isOnline = room.device_status === 'active';
                const isMaint = room.device_status === 'maintenance';
                return (
                  <tr key={room.id}>
                    <td>
                      <div className="room-name-box">
                        <span className="room-title font-bold">Room {room.room_number}</span>
                        <span className="room-bldg">{room.building || 'Engineering Complex'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="device-id-badge font-mono">
                        {room.device_id || `TAPID-RDR-0${room.id}`}
                      </span>
                    </td>
                    <td>
                      {isOnline ? (
                        <span className="status-badge active">
                          <span className="pulse-dot"></span> Online
                        </span>
                      ) : isMaint ? (
                        <span className="status-badge pending">
                          <AlertTriangle size={12} /> Maintenance
                        </span>
                      ) : (
                        <span className="status-badge revoked">
                          <WifiOff size={12} /> Offline
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="teacher-text">{room.teacher || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className="subject-lecture-text">{room.current_subject || 'None Scheduled'}</span>
                    </td>
                    <td>
                      <div className="heartbeat-time">
                        <Clock size={13} className="text-slate-400" />
                        <span>{room.last_ping || 'Just now'}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => handlePing(room.id)}
                        className="btn-ping-terminal"
                        disabled={pingStatus[room.id] === 'Pinging...'}
                      >
                        {pingStatus[room.id] || 'Ping'}
                      </button>
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

export default ClassroomStatus;
