import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Play } from 'lucide-react';
import api from '../../services/api';
import './Attendance.css';

function StartAttendance() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const startSession = async (entry) => {
    try {
      const response = await api.post('/session/start', {
        timetable_id: entry.id,
        subject_id: entry.subject_id,
        classroom_id: entry.classroom_id,
      });
      navigate(`/attendance/live?sessionId=${response.data.session_id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start session');
    }
  };

  return (
    <div className="attendance-container fade-in">
      <div className="page-header mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Upcoming Classes
          </h1>
          <p className="text-gray-400 mt-2">Select a class to initiate an RFID attendance session</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        </div>
      ) : (
        <div className="timetable-grid">
          {timetable.map((entry) => (
            <div key={entry.id} className="timetable-card glass-panel group">
              <div>
                <div className="timetable-header mb-4">
                  <h3 className="subject-name">{entry.subject_name}</h3>
                  <span className="section-badge">{entry.section_name}</span>
                </div>
                
                <div className="timetable-details">
                  <div className="detail-row">
                    <Clock size={16} className="text-indigo-400" />
                    <span>{entry.day_of_week} • {entry.start_time} - {entry.end_time}</span>
                  </div>
                  <div className="detail-row">
                    <MapPin size={16} className="text-purple-400" />
                    <span>Room {entry.room_number}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => startSession(entry)}
                className="btn-start-session"
              >
                <Play size={18} />
                <span>Start Session</span>
              </button>
            </div>
          ))}
          
          {timetable.length === 0 && (
            <div className="col-span-full glass-panel p-8 text-center text-gray-400">
              No classes scheduled for today.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StartAttendance;
