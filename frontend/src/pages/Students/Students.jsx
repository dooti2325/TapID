import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, X, Edit, Trash2, CreditCard } from 'lucide-react';
import './Students.css';

const EMPTY_FORM = { name: '', enrollment_number: '', section_id: '', rfid_uid: '' };

const Students = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data);
    } catch {
      // non-critical — just no dropdown options
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
      section_id: student.section_id || '',
      rfid_uid: student.rfid_uid || '',
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
      setError(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/students/${id}`);
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const filtered = students.filter((s) =>
    `${s.name} ${s.enrollment_number} ${s.rfid_uid || ''} ${s.branch || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="students-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Students Directory
          </h1>
          <p className="text-gray-400 mt-2">Manage student records and RFID card assignments.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, enrollment no, or RFID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader" />
          </div>
        ) : (
          <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Branch / Sem</th>
                  <th>RFID Card</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono" style={{ color: '#60a5fa' }}>{s.enrollment_number}</td>
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.name}</td>
                    <td style={{ color: '#94a3b8' }}>{s.section_name || '—'}</td>
                    <td style={{ color: '#94a3b8' }}>
                      {s.branch ? `${s.branch}` : '—'}
                      {s.semester ? ` · Sem ${s.semester}` : ''}
                    </td>
                    <td>
                      {s.rfid_uid ? (
                        <span className="badge-rfid issued">
                          <CreditCard size={12} />
                          {s.rfid_uid}
                        </span>
                      ) : (
                        <span className="badge-rfid missing">No card</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(s)} className="action-icon-btn edit" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="action-icon-btn delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">No students found matching your search.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={closeModal} className="modal-close-btn">
              <X size={20} />
            </button>
            <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Enrollment Number</label>
                <input
                  type="text" name="enrollment_number" value={formData.enrollment_number}
                  onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                  className="form-input" placeholder="e.g. EN2024001" required
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input" placeholder="e.g. John Doe" required
                />
              </div>

              <div className="form-group">
                <label>Section</label>
                <select
                  name="section_id" value={formData.section_id}
                  onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                  className="form-select"
                >
                  <option value="">— No Section —</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} · {sec.branch} · Sem {sec.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>RFID Card UID (Optional)</label>
                <input
                  type="text" name="rfid_uid" value={formData.rfid_uid}
                  onChange={(e) => setFormData({ ...formData, rfid_uid: e.target.value })}
                  className="form-input" placeholder="e.g. A1B2C3D4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
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
