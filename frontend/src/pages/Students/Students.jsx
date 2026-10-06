import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Users
} from 'lucide-react';
import './Students.css';

const EMPTY_FORM = { name: '', enrollment_number: '', email: '', section_id: '', rfid_uid: '', branch: 'Computer Science' };

const Students = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/students');
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
      setFetchError(err.response?.data?.message || 'Failed to load student roster from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      if (Array.isArray(res.data)) setSections(res.data);
    } catch {
      // non-critical
    }
  };

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setFormData({
      name: student.name,
      enrollment_number: student.enrollment_number,
      email: student.email || `${student.enrollment_number.toLowerCase()}@ghru.edu.in`,
      section_id: student.section_id || '',
      rfid_uid: student.rfid_uid || '',
      branch: student.branch || 'Computer Science'
    });
    setEditingId(student.id);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...formData,
        section_id: formData.section_id ? Number(formData.section_id) : null,
        rfid_uid: formData.rfid_uid || undefined,
      };
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post('/students', payload);
      }
      await fetchStudents();
      closeModal();
    } catch (err) {
      console.error('Failed to save student', err);
      setError(err.response?.data?.message || 'Failed to save student. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`);
      await fetchStudents();
    } catch (err) {
      console.error('Failed to delete student', err);
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch = `${s.name} ${s.enrollment_number} ${s.rfid_uid || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSection = sectionFilter === 'All' || s.section_name === sectionFilter;
    return matchesSearch && matchesSection;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="students-container animate-fade-in">
      {/* Top Header */}
      <div className="students-header-row">
        <div>
          <h1 className="students-page-title">Section G Students Directory</h1>
          <p className="students-page-subtitle">
            Department of Computer Science &middot; 58 Official Enrolled Students (Batch G1 & G2)
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAddModal} className="btn-add-student">
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {fetchError && (
        <div className="form-error-alert" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c' }}>
          {fetchError}
        </div>
      )}

      {/* Main Table Card */}
      <div className="students-table-card">
        {/* Search & Filter Bar */}
        <div className="students-filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by student name, Stud ID (GHRUA...), or RFID UID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="student-search-input"
            />
          </div>

          <div className="section-filter-wrapper">
            <Filter size={15} className="filter-icon" />
            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="section-filter-select"
            >
              <option value="All">All Batches (G1 & G2)</option>
              <option value="Batch G1">Batch G1 (Roll 1 to 33)</option>
              <option value="Batch G2">Batch G2 (Roll 34 to 58)</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Stud Id</th>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Department</th>
                <th>NFC UID</th>
                <th>Status</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((s, index) => {
                const isRegistered = Boolean(s.rfid_uid);
                const rollDisplay = s.roll_no || (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={s.id || index}>
                    <td className="font-mono text-secondary font-semibold" style={{ width: '48px' }}>
                      #{rollDisplay}
                    </td>
                    <td className="font-mono text-primary font-bold">{s.enrollment_number}</td>
                    <td>
                      <div className="student-profile-cell">
                        <div className="student-avatar-badge">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="student-name-text">{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="room-pill font-semibold">{s.section_name || 'Section G'}</span>
                    </td>
                    <td>
                      <span className="dept-pill">{s.branch || 'Computer Science'}</span>
                    </td>
                    <td>
                      {s.rfid_uid ? (
                        <span className="uid-code-pill">
                          <CreditCard size={12} />
                          {s.rfid_uid}
                        </span>
                      ) : (
                        <span className="uid-missing-pill">Unassigned</span>
                      )}
                    </td>
                    <td>
                      {isRegistered ? (
                        <span className="status-badge active">
                          <CheckCircle2 size={12} /> Registered
                        </span>
                      ) : (
                        <span className="status-badge pending">Pending Card</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="table-actions-group">
                          <button
                            onClick={() => openEditModal(s)}
                            className="action-icon-btn edit"
                            title="Edit Student"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.name)}
                            className="action-icon-btn delete"
                            title="Delete Student"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No students found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="students-pagination-bar">
          <span className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} students (Section G)
          </span>
          <div className="pagination-controls">
            <button 
              className="page-btn prev" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              className="page-btn next" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="modal-overlay animate-fade-in">
          <div className="student-modal-card">
            <div className="modal-top">
              <h2 className="modal-title">{editingId ? 'Edit Student Details' : 'Add New Student'}</h2>
              <button onClick={closeModal} className="modal-close-icon">
                <X size={18} />
              </button>
            </div>

            {error && <div className="form-error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="student-modal-form">
              <div className="form-row-2col">
                <div className="form-group">
                  <label>Stud Id (Enrollment Number) *</label>
                  <input
                    type="text"
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                    className="modal-input font-mono"
                    placeholder="e.g. GHRUA23011060..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Full Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="modal-input"
                    placeholder="e.g. Shantanu Yashwant Raut"
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="modal-input"
                  />
                </div>

                <div className="form-group">
                  <label>Practical Batch</label>
                  <select
                    value={formData.section_id || ''}
                    onChange={(e) => {
                      const sec = sections.find(s => String(s.id) === e.target.value);
                      setFormData({ 
                        ...formData, 
                        section_id: e.target.value,
                        section_name: sec ? sec.name : ''
                      });
                    }}
                    className="modal-select"
                  >
                    <option value="">Select Practical Batch</option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>NFC Card UID (Hex string)</label>
                <input
                  type="text"
                  value={formData.rfid_uid}
                  onChange={(e) => setFormData({ ...formData, rfid_uid: e.target.value })}
                  className="modal-input font-mono"
                  placeholder="e.g. 24:0A:C4:00 or tap RFID card"
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" onClick={closeModal} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-modal-submit">
                  {submitting ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
