import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Monitor, Wifi, WifiOff, AlertTriangle, DoorOpen } from 'lucide-react';
import './Classrooms.css';

const ClassroomStatus = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await api.get('/classrooms');
                setRooms(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch classrooms');
            } finally {
                setLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    const getStatusInfo = (deviceStatus) => {
        switch (deviceStatus) {
            case 'active':
                return { text: 'Online', class: 'status-active', icon: <Wifi size={14} /> };
            case 'maintenance':
                return { text: 'Maintenance', class: 'status-maintenance', icon: <AlertTriangle size={14} /> };
            case 'offline':
                return { text: 'Offline', class: 'status-offline', icon: <WifiOff size={14} /> };
            default:
                return { text: 'No Device', class: 'status-none', icon: <Monitor size={14} /> };
        }
    };

    return (
        <div className="classrooms-page">
            <div className="page-header">
                <div>
                    <h1>Classrooms Status</h1>
                    <p className="text-secondary">Monitor the real-time status of all classroom attendance terminals.</p>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-secondary">Loading classrooms...</div>
            ) : error ? (
                <div className="p-8 text-center" style={{ color: '#f87171' }}>{error}</div>
            ) : (
                <div className="classrooms-grid">
                    {rooms.map((room) => {
                        const status = getStatusInfo(room.device_status);
                        
                        return (
                            <div key={room.id} className="classroom-card">
                                <DoorOpen size={120} className="device-icon" />
                                
                                <div className="classroom-card-header">
                                    <div className="classroom-title">
                                        <h2>Room {room.room_number}</h2>
                                        <p>{room.building}</p>
                                    </div>
                                    <div className={`device-status ${status.class}`}>
                                        {status.icon}
                                        <span>{status.text}</span>
                                    </div>
                                </div>
                                
                                <div className="device-info">
                                    <div className="device-info-row">
                                        <span>Terminal ID</span>
                                        <span>{room.device_id || 'Not Assigned'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {rooms.length === 0 && (
                        <div className="p-8 text-center text-secondary col-span-full">
                            No classrooms configured in the system.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassroomStatus;
