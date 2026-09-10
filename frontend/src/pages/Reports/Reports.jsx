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
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { StatCard } from '../../components/Cards/StatCard';
import './Reports.css';

const DEFAULT_RECORDS = [
  { id: 1, roll_no: 'GHRUA23011060140', name: 'Shantanu Yashwant Raut', total_classes: 40, attended: 38, percentage: 95.0, status: 'Eligible' },
  { id: 2, roll_no: 'GHRUA23011060170', name: 'DIVYANSH MANUKANT GADEKAR', total_classes: 40, attended: 35, percentage: 87.5, status: 'Eligible' },
  { id: 3, roll_no: 'GHRUA23011060205', name: 'VEDANT MANISH BAVARIA', total_classes: 40, attended: 29, percentage: 72.5, status: 'Defaulter' },
  { id: 4, roll_no: 'GHRUA23011060348', name: 'Dootiballav Gouriprasanna Saha', total_classes: 40, attended: 39, percentage: 97.5, status: 'Eligible' },
  { id: 5, roll_no: 'GHRUA23011060359', name: 'HARSHAL SUHAS VIDHATE', total_classes: 40, attended: 39, percentage: 97.5, status: 'Eligible' },
  { id: 6, roll_no: 'GHRUA23011060614', name: 'KSHITIJ JOHNEY DUSHING', total_classes: 40, attended: 26, percentage: 65.0, status: 'Defaulter' },
  { id: 7, roll_no: 'GHRUA23011060981', name: 'KARAN SHIVPRASAD SHAHU', total_classes: 40, attended: 34, percentage: 85.0, status: 'Eligible' },
];

function Reports() {
  const [reports, setReports] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    dateRange: 'This Month',
    section: 'All Sections'
  });

  useEffect(() => {
    fetchReports();
    api.get('/subjects').then(r => setSubjects(r.data)).catch(() => {});
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/attendance');
      setReports(response.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const rows = DEFAULT_RECORDS.map(r => 
      `"${r.roll_no}","${r.name}","${r.total_classes}","${r.attended}","${r.percentage}%","${r.status}"`
    );
    const csvContent = ['"Roll No","Student Name","Total Classes","Attended","Percentage","Status"', ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tapid_attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-page animate-fade-in">
      {/* Top Header Bar */}
      <div className="reports-header-row">
        <div>
          <h1 className="reports-title">Attendance Reports</h1>
          <p className="reports-subtitle">Filter, view, and export student attendance analytics & audit logs.</p>
        </div>
        <div className="reports-export-actions">
          <button onClick={exportExcel} className="btn-export-excel">
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
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
            <option value="CD">CD: Compiler Design</option>
            <option value="CSS">CSS: Computer System Security</option>
            <option value="ES-AI">ES-AI: Ethical & Social Implication of AI</option>
            <option value="DEV">DEV: DevOps</option>
            <option value="AIML">AIML: AI & Machine Learning</option>
            <option value="PROJECT">PROJECT: Capstone Project</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Select Date Range</label>
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="filter-select"
          >
            <option value="This Month">This Month (Sep 2026)</option>
            <option value="Last Month">Last Month (Aug 2026)</option>
            <option value="Full Semester">Full Semester (Fall 2026)</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Select Section / Batch</label>
          <select 
            value={filters.section}
            onChange={(e) => setFilters({ ...filters, section: e.target.value })}
            className="filter-select"
          >
            <option value="All Sections">All Sections</option>
            <option value="CS-Core">CS-Core (All Students)</option>
            <option value="G1">Batch G1 (Roll 1-33)</option>
            <option value="G2">Batch G2 (Roll 34+)</option>
          </select>
        </div>

        <div className="filter-action">
          <button onClick={fetchReports} className="btn-apply-filter">
            <Filter size={16} />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="reports-metric-grid">
        <StatCard
          title="Average Attendance"
          value="84.2%"
          icon={<TrendingUp size={20} />}
          accentColor="blue"
          trend="+1.8%"
          trendUp={true}
          subtitle="vs previous term"
        />
        <StatCard
          title="Total Classes Held"
          value="38"
          icon={<Calendar size={20} />}
          accentColor="purple"
          subtitle="Semester to date"
        />
        <StatCard
          title="Defaulters (<75%)"
          value="12"
          icon={<AlertCircle size={20} />}
          accentColor="rose"
          subtitle="Action required"
        />
        <StatCard
          title="Top Attendance Section"
          value="CS-A"
          icon={<Award size={20} />}
          accentColor="emerald"
          subtitle="91.4% average"
        />
      </div>

      {/* Detailed Reports Table Card */}
      <div className="reports-table-card">
        <div className="reports-table-card-header">
          <div>
            <h2 className="reports-card-title">Detailed Attendance Summary</h2>
            <p className="reports-card-subtitle">Showing semester attendance ratio per student</p>
          </div>
          <span className="reports-counter-pill">{DEFAULT_RECORDS.length} Students Evaluated</span>
        </div>

        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Attendance %</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_RECORDS.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-primary font-bold">{r.roll_no}</td>
                  <td>
                    <span className="font-medium text-slate-800">{r.name}</span>
                  </td>
                  <td>{r.total_classes}</td>
                  <td className="font-semibold">{r.attended}</td>
                  <td>
                    <div className="attendance-progress-row">
                      <div className="progress-bar-bg">
                        <div 
                          className={`progress-bar-fill ${r.percentage >= 75 ? 'bg-success' : 'bg-danger'}`}
                          style={{ width: `${r.percentage}%` }}
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
                    <button className="table-row-action">View Logs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
