import React, { useState, useEffect } from 'react';
import { ScrollText, Search, ShieldCheck, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/logs/audit');
      if (Array.isArray(response.data)) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setError(err.response?.data?.message || 'Failed to load audit logs from server.');
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
