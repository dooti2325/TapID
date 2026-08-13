import React, { useState, useEffect } from 'react';
import { GraduationCap, Mail, Phone, Building2, UserPlus, Edit, Trash2, X } from 'lucide-react';
import api from '../../services/api';
import './Faculty.css';

const Faculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFacultyList(response.data);
    } catch (err) {
      setError('Failed to fetch faculty list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', department: '', email: '', phone: '', address: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (faculty) => {
    setFormData({ 
      name: faculty.name, 
      department: faculty.department, 
      email: faculty.email, 
      phone: faculty.phone || '', 
      address: faculty.address || '' 
    });
    setEditingId(faculty.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', department: '', email: '', phone: '', address: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/faculty/${editingId}`, formData);
      } else {
        await api.post('/faculty', formData);
      }
      await fetchFaculty();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save faculty member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api.delete(`/faculty/${id}`);
      await fetchFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete faculty');
    }
  };

  return (
    <div className="faculty-container fade-in relative">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Faculty Directory
          </h1>
          <p className="text-gray-400 mt-2">Manage professors and teaching staff</p>
        </div>
        <button onClick={openAddModal} className="add-faculty-btn glass-panel">
          <UserPlus size={18} />
          <span>Add Faculty</span>
        </button>
      </div>

      {error && (
        <div className="glass-panel border-l-4 border-red-500 text-red-400 p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      ) : (
        <div className="faculty-grid">
          {facultyList.map((faculty) => (
            <div key={faculty.id} className="faculty-card glass-panel group">
              <div className="faculty-header">
                <div className="avatar-placeholder">
                  {faculty.name.charAt(0).toUpperCase()}
                </div>
                <div className="faculty-actions opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(faculty)} className="action-btn text-blue-400 hover:bg-blue-400/10"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(faculty.id)} className="action-btn text-red-400 hover:bg-red-400/10"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="faculty-info">
                <h3 className="text-xl font-bold text-gray-100">{faculty.name}</h3>
                <p className="text-purple-400 text-sm mb-4">{faculty.department}</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-300">{faculty.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-300">{faculty.phone || 'N/A'}</span>
                  </div>
                  <div className="contact-item">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="text-gray-300">Department of {faculty.department}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {facultyList.length === 0 && (
            <div className="col-span-full glass-panel p-8 text-center text-gray-400">
              No faculty members found.
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit Faculty' : 'Add Faculty'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                  placeholder="e.g. Dr. Rajesh Kumar" required
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                    placeholder="e.g. faculty@tapid.edu" required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                <input 
                  type="text" name="department" value={formData.department} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                  placeholder="e.g. Computer Science" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                  placeholder="e.g. 0987654321"
                />
              </div>
              <button 
                type="submit" disabled={submitting}
                className="w-full py-3 mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all"
              >
                {submitting ? 'Saving...' : 'Save Faculty'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
