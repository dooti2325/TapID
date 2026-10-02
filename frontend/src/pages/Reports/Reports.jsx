import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Filter, 
  FileSpreadsheet, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Award,
  Users,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/Cards/StatCard';
import './Reports.css';

function Reports() {
  const [reportsData, setReportsData] = useState({
    records: [],
    studentSummaries: [],
    summary: {
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
      totalClassesHeld: 0,
      averageAttendance: 0,
      defaultersCount: 0
    }
  });
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'scans'
  const [selectedStudentLogs, setSelectedStudentLogs] = useState(null);

  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    date: '',
    section: 'All Sections'
  });

  useEffect(() => {
    // Load subjects & sections for filter dropdowns
    api.get('/subjects').then(r => Array.isArray(r.data) && setSubjects(r.data)).catch(() => {});
    api.get('/sections').then(r => Array.isArray(r.data) && setSections(r.data)).catch(() => {});
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.subject && filters.subject !== 'All Subjects') {
        params.subject_id = filters.subject;
      }
      if (filters.section && filters.section !== 'All Sections') {
        params.department = filters.section;
      }
      if (filters.date) {
        params.date = filters.date;
      }

      const response = await api.get('/reports/attendance', { params });
      if (response.data) {
        setReportsData({
          records: response.data.records || [],
          studentSummaries: response.data.studentSummaries || [],
          summary: {
            totalStudents: response.data.summary?.totalStudents || 0,
            presentToday: response.data.summary?.presentToday || 0,
            absentToday: response.data.summary?.absentToday || 0,
            totalClassesHeld: response.data.summary?.totalClassesHeld || 0,
            averageAttendance: response.data.summary?.averageAttendance || 0,
            defaultersCount: response.data.summary?.defaultersCount || 0
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const isSummary = activeTab === 'summary';
    let headers = [];
    let rows = [];

    if (isSummary) {
      headers = ['"Roll No"', '"Student Name"', '"Section"', '"Total Classes"', '"Attended"', '"Percentage"', '"Status"'];
      rows = reportsData.studentSummaries.map(r => 
        `"${r.roll_no}","${r.name}","${r.section_name || ''}","${r.total_classes}","${r.attended}","${r.percentage}%","${r.status}"`
      );
    } else {
      headers = ['"Scan Time"', '"Roll No"', '"Student Name"', '"Subject"', '"Section"', '"Status"'];
      rows = reportsData.records.map(r => 
        `"${r.time ? new Date(r.time).toLocaleString() : ''}","${r.enrollment_number}","${r.name}","${r.subject_name}","${r.section_name}","${r.status}"`
      );
    }

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tapid_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Header Branding
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('TapID - Official Attendance Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${currentDate} | Filter: ${filters.subject} / ${filters.section}`, 14, 28);
    doc.text(`Total Students: ${reportsData.summary.totalStudents} | Classes Held: ${reportsData.summary.totalClassesHeld} | Avg Attendance: ${reportsData.summary.averageAttendance}%`, 14, 34);

    if (activeTab === 'summary') {
      const tableData = reportsData.studentSummaries.map(s => [
        s.roll_no,
        s.name,
        s.section_name || 'CS-Core',
        String(s.total_classes),
        String(s.attended),
        `${s.percentage}%`,
        s.status
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['Roll No', 'Student Name', 'Section', 'Held', 'Attended', 'Attendance %', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 }
      });
    } else {
      const tableData = reportsData.records.map(r => [
        r.time ? new Date(r.time).toLocaleTimeString() : '',
        r.enrollment_number,
        r.name,
        r.subject_name || '',
        r.section_name || '',
        r.status || 'Present'
      ]);

      autoTable(doc, {
        startY: 42,
        head: [['Time', 'Roll No', 'Student Name', 'Subject', 'Section', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 }
      });
    }

    doc.save(`tapid_${activeTab}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const viewStudentLogs = (student) => {
    const studentScans = reportsData.records.filter(r => r.enrollment_number === student.roll_no);
    setSelectedStudentLogs({
      student,
      scans: studentScans
    });
  };

  return (
    <div className="reports-page animate-fade-in">
      {/* Top Header Bar */}
      <div className="reports-header-row">
        <div>
          <h1 className="reports-title">Attendance Reports & Audits</h1>
          <p className="reports-subtitle">Real-time attendance analytics, defaulter tracking, and verified RFID scan logs.</p>
        </div>
        <div className="reports-export-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportCSV} className="btn-export-excel" title="Download CSV">
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          <button onClick={exportPDF} className="btn-export-excel" style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1' }} title="Download PDF Report">
            <FileText size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="reports-filter-card">
        <div className="filter-item">
          <label>Select Subject</label>
          <select 
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="filter-select"
          >
            <option value="All Subjects">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Filter Date</label>
          <input 
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="filter-select"
            style={{ height: '38px' }}
          />
        </div>

        <div className="filter-item">
          <label>Select Section / Batch</label>
          <select 
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="filter-select"
          >
            <option value="All Sections">All Sections</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.name}>{sec.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-action">
          <button onClick={fetchReports} disabled={loading} className="btn-apply-filter">
            <Filter size={16} />
            <span>{loading ? 'Filtering...' : 'Apply Filters'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="reports-metric-grid">
        <StatCard
          title="Average Attendance"
          value={`${reportsData.summary.averageAttendance}%`}
          icon={<TrendingUp size={20} />}
          accentColor="blue"
          subtitle={reportsData.summary.totalClassesHeld > 0 ? `${reportsData.summary.totalClassesHeld} sessions evaluated` : 'No sessions recorded yet'}
        />
        <StatCard
          title="Total Classes Held"
          value={String(reportsData.summary.totalClassesHeld)}
          icon={<Calendar size={20} />}
          accentColor="purple"
          subtitle="In current filter"
        />
        <StatCard
          title="Defaulters (<75%)"
          value={String(reportsData.summary.defaultersCount)}
          icon={<AlertCircle size={20} />}
          accentColor="rose"
          subtitle={reportsData.summary.defaultersCount > 0 ? 'Requires academic warning' : 'All students in good standing'}
        />
        <StatCard
          title="Students Evaluated"
          value={String(reportsData.summary.totalStudents)}
          icon={<Award size={20} />}
          accentColor="emerald"
          subtitle="Active student roster"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'summary' ? '#2563eb' : 'transparent',
            color: activeTab === 'summary' ? '#fff' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Student Attendance Summaries ({reportsData.studentSummaries.length})
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'scans' ? '#2563eb' : 'transparent',
            color: activeTab === 'scans' ? '#fff' : '#64748b',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Raw RFID Scan Audit Logs ({reportsData.records.length})
        </button>
      </div>

      {/* Detailed Reports Table Card */}
      <div className="reports-table-card">
        <div className="reports-table-card-header">
          <div>
            <h2 className="reports-card-title">
              {activeTab === 'summary' ? 'Student Attendance Roster' : 'Verified Card Tap Log'}
            </h2>
            <p className="reports-card-subtitle">
              {activeTab === 'summary' 
                ? 'Calculated attendance percentage across verified IoT sessions' 
                : 'Individual timestamped hardware scans from ESP32 readers'}
            </p>
          </div>
          <span className="reports-counter-pill">
            {activeTab === 'summary' ? `${reportsData.studentSummaries.length} Students` : `${reportsData.records.length} Scans`}
          </span>
        </div>

        <div className="reports-table-wrap">
          {activeTab === 'summary' ? (
            reportsData.studentSummaries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                No student records found matching the selected filter.
              </div>
            ) : (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Section</th>
                    <th>Total Classes</th>
                    <th>Attended</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.studentSummaries.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono text-primary font-bold">{r.roll_no}</td>
                      <td>
                        <span className="font-medium text-slate-800">{r.name}</span>
                      </td>
                      <td>
                        <span className="text-secondary">{r.section_name || 'CS-Core'}</span>
                      </td>
                      <td>{r.total_classes}</td>
                      <td className="font-semibold">{r.attended}</td>
                      <td>
                        <div className="attendance-progress-row">
                          <div className="progress-bar-bg">
                            <div 
                              className={`progress-bar-fill ${r.percentage >= 75 ? 'bg-success' : 'bg-danger'}`}
                              style={{ width: `${Math.min(100, r.percentage)}%` }}
                            />
                          </div>
                          <span className="progress-text">{r.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        {r.status === 'Eligible' ? (
                          <span className="status-badge active">Eligible</span>
                        ) : r.status === 'Warning' ? (
                          <span className="status-badge pending">Warning</span>
                        ) : (
                          <span className="status-badge revoked">Defaulter</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button 
                          onClick={() => viewStudentLogs(r)}
                          className="table-row-action"
                        >
                          View Logs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            reportsData.records.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                No RFID scan logs found for the selected criteria.
              </div>
            ) : (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Section</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsData.records.map((r, i) => (
                    <tr key={r.attendance_id || i}>
                      <td className="font-mono text-secondary">
                        {r.time ? new Date(r.time).toLocaleString() : 'N/A'}
                      </td>
                      <td className="font-mono font-bold text-primary">{r.enrollment_number}</td>
                      <td>{r.name}</td>
                      <td>{r.subject_name}</td>
                      <td>{r.section_name}</td>
                      <td>
                        <span className="status-badge active">
                          <CheckCircle size={12} /> {r.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Student Audit Scan Modal */}
      {selectedStudentLogs && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {selectedStudentLogs.student.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  Roll No: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedStudentLogs.student.roll_no}</span> &middot; Attendance: {selectedStudentLogs.student.percentage}%
                </p>
              </div>
              <button 
                onClick={() => setSelectedStudentLogs(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recorded RFID Scans ({selectedStudentLogs.scans.length})
              </h4>
              {selectedStudentLogs.scans.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>
                  No individual scan records found for this student in the current filter range.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedStudentLogs.scans.map((scan, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                          {scan.subject_name || 'Lecture Session'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {scan.time ? new Date(scan.time).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                      <span className="status-badge active" style={{ fontSize: '0.75rem' }}>
                        {scan.status || 'Verified'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedStudentLogs(null)}
                style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', color: '#334155' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
