import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './Devices.css';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (err) {
      setError('Failed to fetch devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Wifi className="status-icon active" />;
      case 'offline':
        return <WifiOff className="status-icon offline" />;
      default:
        return <AlertCircle className="status-icon unknown" />;
    }
  };

  return (
    <div className="devices-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Device Management
          </h1>
          <p className="text-gray-400 mt-2">Monitor ESP32 and RFID hardware endpoints</p>
        </div>
        <div className="glass-panel px-4 py-2 flex items-center gap-3">
          <Cpu className="text-blue-400" />
          <span className="font-semibold text-gray-200">{devices.length} Total Devices</span>
        </div>
      </div>

      {error && (
        <div className="glass-panel border-l-4 border-red-500 text-red-400 p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <div key={device.id} className="device-card glass-panel group">
              <div className="device-header">
                <div className="device-icon-wrapper group-hover:scale-110 transition-transform">
                  <Cpu size={24} className="text-blue-400" />
                </div>
                <div className={`status-badge ${device.status}`}>
                  {getStatusIcon(device.status)}
                  <span>{device.status ? device.status.charAt(0).toUpperCase() + device.status.slice(1) : 'Unknown'}</span>
                </div>
              </div>
              
              <div className="device-info">
                <h3 className="text-xl font-bold text-gray-100 mb-1">ESP32 Terminal</h3>
                <p className="text-gray-400 text-sm mb-4 font-mono">{device.mac_address}</p>
                
                <div className="device-details">
                  <div className="detail-item">
                    <span className="label">Location</span>
                    <span className="value text-emerald-400">
                      {device.room_number ? `Room ${device.room_number}` : 'Unassigned'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Seen</span>
                    <span className="value">
                      {new Date(device.last_ping || device.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="col-span-full glass-panel p-8 text-center text-gray-400">
              No devices registered in the system.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Devices;
