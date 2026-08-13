import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/logs/audit');
        setLogs(response.data);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Audit Logs</h1>
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
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="cell-details">
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span className="cell-details-sub">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>{log.user_email || 'System'}</td>
                  <td>
                    <span className="admin-badge badge-blue">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="cell-truncate" title={log.details}>
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="admin-empty-state">No audit logs found</td>
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
