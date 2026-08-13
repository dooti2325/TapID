import React, { useState, useEffect } from 'react';
import { Library, Book, Plus, X, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import './Subjects.css';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', semester: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ code: '', name: '', semester: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setFormData({ code: subject.code, name: subject.name, semester: subject.semester });
    setEditingId(subject.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ code: '', name: '', semester: '' });
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
        await api.put(`/subjects/${editingId}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      await fetchSubjects();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      await fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  return (
    <div className="subjects-container fade-in relative">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            Course Subjects
          </h1>
          <p className="text-gray-400 mt-2">Manage academic subjects and curriculum</p>
        </div>
        <button onClick={openAddModal} className="add-subject-btn glass-panel">
          <Plus size={18} />
          <span>Add Subject</span>
        </button>
      </div>

      {error && (
        <div className="glass-panel border-l-4 border-red-500 text-red-400 p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div key={subject.id} className="subject-card glass-panel group relative">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(subject)} 
                  className="p-2 bg-gray-800/80 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(subject.id)} 
                  className="p-2 bg-gray-800/80 rounded-lg text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="subject-icon-wrapper">
                <Book size={28} className="text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="subject-content">
                <h3 className="text-xl font-bold text-gray-100">{subject.name}</h3>
                <span className="subject-code">{subject.code}</span>
                
                <div className="subject-description">
                  Semester: {subject.semester}
                </div>
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="col-span-full glass-panel p-8 text-center text-gray-400">
              No subjects found in the curriculum.
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
              {editingId ? 'Edit Subject' : 'Add Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Code</label>
                <input 
                  type="text" 
                  name="code" 
                  value={formData.code} 
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Introduction to Programming"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Semester</label>
                <input 
                  type="number" 
                  name="semester" 
                  value={formData.semester} 
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-orange-400 outline-none transition-colors"
                  placeholder="1-8"
                  min="1" max="8"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 mt-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-lg transition-all"
              >
                {submitting ? 'Saving...' : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
