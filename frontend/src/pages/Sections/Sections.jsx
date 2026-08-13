import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Layers } from 'lucide-react';
import api from '../../services/api';
import './Sections.css';

const EMPTY_FORM = { name: '', branch: '', semester: '' };
const BRANCHES = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Electronics', 'Physics', 'Chemistry', 'Mathematics'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    try {
      const res = await api.get('/sections');
      setSections(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const openAdd = () => { setFormData(EMPTY_FORM); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (s) => { setFormData({ name: s.name, branch: s.branch, semester: s.semester }); setEditingId(s.id); setError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormData(EMPTY_FORM); setEditingId(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/sections/${editingId}`, formData);
      } else {
        await api.post('/sections', formData);
      }
      await fetchSections();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete section "${name}"? Students in this section will be unassigned.`)) return;
    try {
      await api.delete(`/sections/${id}`);
      await fetchSections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete section');
    }
  };

  // Group by branch for nicer display
  const grouped = sections.reduce((acc, s) => {
    if (!acc[s.branch]) acc[s.branch] = [];
    acc[s.branch].push(s);
    return acc;
  }, {});

  return (
    <div className="sections-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Sections
          </h1>
          <p className="text-gray-400 mt-2">Manage academic sections grouped by branch and semester.</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          <Plus size={18} /> Add Section
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="loader" /></div>
      ) : sections.length === 0 ? (
        <div className="glass-panel empty-state">
          <Layers size={48} style={{ opacity: 0.3 }} />
          <p>No sections defined yet. Add your first section to get started.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([branch, branchSections]) => (
          <div key={branch} className="branch-group glass-panel">
            <div className="branch-header">
              <h2>{branch}</h2>
              <span className="branch-count">{branchSections.length} section{branchSections.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Semester</th>
                    <th>ID</th>
                    <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSections.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: '#a5b4fc' }}>{s.name}</td>
                      <td>Semester {s.semester}</td>
                      <td className="font-mono" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{s.id}</td>
                      <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEdit(s)} className="action-icon-btn edit"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(s.id, s.name)} className="action-icon-btn delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button onClick={closeModal} className="modal-close-btn"><X size={20} /></button>
            <h2>{editingId ? 'Edit Section' : 'Add Section'}</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Section Name</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input" placeholder="e.g. CS-A" required />
              </div>
              <div className="form-group">
                <label>Branch / Department</label>
                <select value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="form-select" required>
                  <option value="">— Select Branch —</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <select value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="form-select" required>
                  <option value="">— Select Semester —</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sections;
