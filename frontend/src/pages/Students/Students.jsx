import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import './Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', enrollment_number: '', section_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', enrollment_number: '', section_id: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setFormData({ 
      name: student.name, 
      enrollment_number: student.enrollment_number, 
      section_id: student.section_id || '' 
    });
    setEditingId(student.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', enrollment_number: '', section_id: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Pass data with fallback for section_id
      const submitData = { ...formData, section_id: formData.section_id || null };
      if (editingId) {
        await api.put(`/students/${editingId}`, submitData);
      } else {
        await api.post('/students', submitData);
      }
      await fetchStudents();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      await fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter((student) => {
    const value = `${student.name} ${student.enrollment_number} ${student.rfid_uid || ''} ${student.branch || ''}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  return (
    <div className="students-page fade-in relative">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Students Directory
          </h1>
          <p className="text-gray-400 mt-2">Manage and map RFID tags to students.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary glass-panel border border-blue-500/30">
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

      <div className="table-container glass-panel p-0 overflow-hidden">
        <div className="table-actions p-6 border-b border-white/5">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, roll no, or RFID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Enrollment No</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Semester</th>
                <th>RFID UID</th>
                <th className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="font-mono text-blue-300">{student.enrollment_number}</td>
                  <td className="font-medium text-white">{student.name}</td>
                  <td className="text-gray-300">{student.branch || 'Unassigned'}</td>
                  <td className="text-gray-300">{student.semester || 'Unassigned'}</td>
                  <td>
                    <span className={`badge-rfid ${student.rfid_uid ? 'issued' : 'missing'}`}>
                      {student.rfid_uid || 'Not issued'}
                    </span>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEditModal(student)} className="text-blue-400 hover:text-blue-300 transition-colors" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? 'Edit Student' : 'Add Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Enrollment Number</label>
                <input 
                  type="text" name="enrollment_number" value={formData.enrollment_number} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors"
                  placeholder="e.g. EN2024001" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors"
                  placeholder="e.g. John Doe" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section ID (Optional)</label>
                <input 
                  type="number" name="section_id" value={formData.section_id} onChange={handleInputChange}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-400 outline-none transition-colors"
                  placeholder="e.g. 1" min="1"
                />
              </div>
              <button 
                type="submit" disabled={submitting}
                className="w-full py-3 mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-lg transition-all"
              >
                {submitting ? 'Saving...' : 'Save Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
