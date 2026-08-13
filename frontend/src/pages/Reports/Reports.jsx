import React, { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import api from '../../services/api';
import './Reports.css';

function Reports() {
  const [reports, setReports] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date: '', subject_id: '', department: '' });

  useEffect(() => {
    fetchReports();
    api.get('/subjects').then(r => setSubjects(r.data)).catch(() => {});
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date)       params.append('date', filters.date);
      if (filters.subject_id) params.append('subject_id', filters.subject_id);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/reports/attendance?${params.toString()}`);
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reports || !reports.records) return;
    const headers = ['Time', 'Name', 'Enrollment Number', 'Branch', 'Status'];
    const csvContent = [
      headers.join(','),
      ...reports.records.map(r =>
        `"${new Date(r.time).toLocaleString()}","${r.name}","${r.enrollment_number}","${r.branch}","${r.status}"`
      )
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tapid_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Attendance Reports
          </h1>
          <p className="text-gray-400 mt-2">Filter, view, and export student attendance data.</p>
        </div>
        <button onClick={exportCSV} disabled={!reports?.records?.length} className="btn-export">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="reports-filters glass-panel p-6">
        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            className="filter-input"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Subject</label>
          <select
            className="filter-input"
            value={filters.subject_id}
            onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Department</label>
          <input
            type="text"
            placeholder="e.g. Computer Science"
            className="filter-input"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          />
        </div>
        <div className="filter-group justify-end">
          <button onClick={fetchReports} className="btn-apply-filters">
            <Filter size={18} />
            Apply Filters
          </button>
        </div>
      </div>

      {reports?.summary && (
        <div className="reports-summary">
          <div className="summary-card total">
            <span className="label">Total Students</span>
            <span className="value">{reports.summary.totalStudents}</span>
          </div>
          <div className="summary-card present">
            <span className="label">Present</span>
            <span className="value">{reports.summary.present}</span>
          </div>
          <div className="summary-card absent">
            <span className="label">Absent</span>
            <span className="value">{reports.summary.absent}</span>
          </div>
        </div>
      )}

      <div className="reports-table-container glass-panel">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Name</th>
              <th>Enrollment</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <div className="flex justify-center items-center h-32">
                    <div className="loader" />
                  </div>
                </td>
              </tr>
            ) : reports?.records?.length > 0 ? (
              reports.records.map((record, idx) => (
                <tr key={idx}>
                  <td className="time">{new Date(record.time).toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{record.name}</td>
                  <td className="enrollment font-mono">{record.enrollment_number}</td>
                  <td style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{record.branch}</td>
                  <td>
                    <span className={`status-badge ${record.status?.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <div className="empty-table-state">
                    No attendance records found for the given criteria.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
