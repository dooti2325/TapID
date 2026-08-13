import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, WifiOff, AlertTriangle, Plus, Trash2, X, Building2 } from 'lucide-react';
import api from '../../services/api';
import './Devices.css';

const EMPTY_FORM = { mac_address: '', classroom_id: '' };

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchDevices();
    fetchClassrooms();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices');
      setDevices(res.data);
    } catch {
      setError('Failed to fetch devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch {/* non-critical */}
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/devices', {
        mac_address: formData.mac_address,
        classroom_id: formData.classroom_id || null,
      });
      await fetchDevices();
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register device');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, mac) => {
    if (!window.confirm(`Remove device ${mac}?`)) return;
    try {
      await api.delete(`/devices/${id}`);
      await fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove device');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':  return <Wifi size={14} />;
      case 'offline': return <WifiOff size={14} />;
      default:        return <AlertTriangle size={14} />;
    }
  };

  const onlineCount  = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const revokedCount = devices.filter(d => d.status === 'revoked').length;

  return (
    <div className="devices-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Device Management
          </h1>
          <p className="text-gray-400 mt-2">Monitor and manage ESP32 RFID hardware endpoints.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          Register Device
        </button>
      </div>

      {/* Summary pills */}
      <div className="devices-summary">
        <div className="summary-pill online">
          <Wifi size={16} />
          <span>{onlineCount} Online</span>
        </div>
        <div className="summary-pill offline">
          <WifiOff size={16} />
          <span>{offlineCount} Offline</span>
        </div>
        {revokedCount > 0 && (
          <div className="summary-pill revoked">
            <AlertTriangle size={16} />
            <span>{revokedCount} Revoked</span>
          </div>
        )}
      </div>

      {error && (
        <div className="glass-panel border-l-4 border-red-500 text-red-400 p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader" />
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <div key={device.id} className={`device-card glass-panel group status-${device.status}`}>
              <div className="device-header">
                <div className="device-icon-wrapper">
                  <Cpu size={22} />
                </div>
                <div className={`status-badge ${device.status}`}>
                  {getStatusIcon(device.status)}
                  <span>{device.status}</span>
                </div>
              </div>

              <div className="device-info">
                <h3>ESP32 Terminal</h3>
                <p className="device-mac">{device.mac_address}</p>

                <div className="device-meta">
                  <div className="meta-row">
                    <Building2 size={14} />
                    <span>{device.room_number ? `Room ${device.room_number}, ${device.building || ''}` : 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div className="device-actions">
                <button
                  onClick={() => handleDelete(device.id, device.mac_address)}
                  className="btn-icon-sm danger"
                  title="Remove device"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {devices.length === 0 && (
            <div className="col-span-full glass-panel p-12 text-center text-gray-400">
              <Cpu size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No devices registered. Click "Register Device" to add your first ESP32 terminal.</p>
            </div>
          )}
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={() => setShowModal(false)} className="modal-close-btn">
              <X size={20} />
            </button>
            <h2>Register New Device</h2>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>MAC Address</label>
                <input
                  type="text" value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                  className="form-input" placeholder="e.g. 24:0A:C4:00:00:01" required
                />
              </div>
              <div className="form-group">
                <label>Assign to Classroom (Optional)</label>
                <select
                  value={formData.classroom_id}
                  onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                  className="form-select"
                >
                  <option value="">— Unassigned —</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>Room {c.room_number} — {c.building || 'Unknown Building'}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
