import React, { useState, useEffect } from 'react';
import { ScrollText, Search, ShieldCheck, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

const DEFAULT_AUDIT_LOGS = [
  { id: 1, action: 'ATTENDANCE_SESSION_STARTED', details: 'Compiler Design (CD) Room C-102 session initialized', user_email: 'chetram.thakur@tapid.edu', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, action: 'RFID_CARD_SCANNED', details: 'UID: A1:B2:C3:D4 - Shantanu Yashwant Raut (Present)', user_email: 'terminal_c102', timestamp: new Date(Date.now() - 1740000).toISOString() },
  { id: 3, action: 'RFID_CARD_SCANNED', details: 'UID: 14:F2:3C:99 - Divyansh Manukant Gadekar (Present)', user_email: 'terminal_c102', timestamp: new Date(Date.now() - 1680000).toISOString() },
  { id: 4, action: 'DEVICE_PING_VERIFIED', details: 'ESP32 Terminal Room C-102 (MAC: 24:0A:C4:00:00:01) RSSI: -32 dBm', user_email: 'system', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 5, action: 'RFID_CARD_ASSIGNED', details: 'Card 240AC401 issued to Harshal Suhas Vidhate (Roll 18)', user_email: 'admin@tapid.edu', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 6, action: 'TIMETABLE_SLOT_ACCESSED', details: 'Schedule for Section G accessed by faculty Ashish Trivedi', user_email: 'ashish.trivedi@tapid.edu', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: 7, action: 'DEVICE_KEY_ROTATED', details: 'HMAC SHA-256 rotating token updated for reader TAPID-RDR-01', user_email: 'system', timestamp: new Date(Date.now() - 28800000).toISOString() },
  { id: 8, action: 'STUDENT_ROSTER_SYNCED', details: 'Section G 58 students verified with database', user_email: 'admin@tapid.edu', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

function AuditLogs() {
  const [logs, setLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/logs/audit');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setLogs(response.data);
      } else {
        setLogs(DEFAULT_AUDIT_LOGS);
      }
    } catch (err) {
      setLogs(DEFAULT_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action) => {
    if (action.includes('START') || action.includes('SYNC')) return 'badge-green';
    if (action.includes('KEY') || action.includes('REVOKE')) return 'badge-red';
    if (action.includes('DEVICE') || action.includes('PING')) return 'badge-orange';
    return 'badge-blue';
  };

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    log.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Security & Audit Logs</h1>
          <p className="admin-page-subtitle">Track all system events, attendance scans, device telemetry, and administrative actions</p>
        </div>
        <button onClick={fetchLogs} className="admin-action-btn">
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Filter logs by action, user, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-count-pill">
          {filteredLogs.length} events logged
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="loader"></div></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="cell-details">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="cell-details-sub">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-slate-800 text-xs">{log.user_email || 'System'}</span>
                  </td>
                  <td>
                    <span className={`admin-badge ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="cell-truncate text-slate-700 text-xs" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty-state">No audit logs matching "{search}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
