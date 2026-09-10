import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, X, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

function RfidCards() {
  const [cards, setCards] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Revoke Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [cardToRevoke, setCardToRevoke] = useState(null);

  // Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    uid: '',
    student_id: '',
    status: 'active'
  });
  const [assignError, setAssignError] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchStudents();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await api.get('/admin/rfid-cards');
      setCards(response.data);
    } catch (err) {
      console.error('Failed to fetch RFID cards', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const openRevokeModal = (card) => {
    setCardToRevoke(card);
    setRevokeModalOpen(true);
  };

  const closeRevokeModal = () => {
    setRevokeModalOpen(false);
    setCardToRevoke(null);
  };

  const confirmRevokeCard = async () => {
    if (!cardToRevoke) return;
    try {
      await api.post('/admin/rfid-cards/status', { uid: cardToRevoke.uid, status: 'revoked' });
      setCards(cards.map(c => c.uid === cardToRevoke.uid ? { ...c, status: 'revoked' } : c));
      closeRevokeModal();
    } catch (err) {
      alert('Failed to revoke card');
      closeRevokeModal();
    }
  };

  const handleStatusChange = async (card, newStatus) => {
    try {
      await api.post('/admin/rfid-cards/status', { uid: card.uid, status: newStatus });
      setCards(cards.map(c => c.uid === card.uid ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.uid.trim()) {
      setAssignError('Please enter a valid Card UID');
      return;
    }
    setAssignSubmitting(true);
    setAssignError('');
    try {
      const selectedStudent = students.find(s => String(s.id) === String(assignForm.student_id));
      await api.post('/admin/rfid-cards/assign', {
        uid: assignForm.uid.trim(),
        student_id: assignForm.student_id || null,
        student_name: selectedStudent?.name,
        enrollment_number: selectedStudent?.enrollment_number,
        section_name: selectedStudent?.section_name || 'Section G',
        status: assignForm.status
      });
      await fetchCards();
      setAssignModalOpen(false);
      setAssignForm({ uid: '', student_id: '', status: 'active' });
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign RFID card');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'revoked': return 'badge-red';
      case 'lost': return 'badge-orange';
      default: return 'badge-blue';
    }
  };

  const filteredCards = cards.filter(c => 
    c.uid?.toLowerCase().includes(search.toLowerCase()) ||
    c.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.enrollment_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">RFID Card Management</h1>
          <p className="admin-page-subtitle">Assign, revoke, and track physical NFC cards for Section G students</p>
        </div>
        <button onClick={() => { setAssignModalOpen(true); setAssignError(''); }} className="admin-action-btn">
          <Plus size={16} />
          <span>Assign New Card</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by UID, student name, or enrollment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
        <div className="admin-count-pill">
          Showing {filteredCards.length} of {cards.length} cards
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><div className="loader"></div></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>Student</th>
                <th>Status</th>
                <th>Issued At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id}>
                  <td>
                    <span className="font-mono font-bold text-blue-600">{card.uid}</span>
                  </td>
                  <td>
                    <div className="cell-details">
                      <strong>{card.student_name || 'Unassigned'}</strong>
                      {card.enrollment_number && (
                        <span className="cell-details-sub">
                          {card.enrollment_number} &middot; {card.section_name} {card.branch ? `(${card.branch})` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${getStatusBadgeClass(card.status)}`}>
                      {card.status}
                    </span>
                  </td>
                  <td>
                    <div className="cell-details">
                      <span>{new Date(card.issued_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {card.status === 'active' ? (
                        <>
                          <button 
                            onClick={() => handleStatusChange(card, 'lost')} 
                            className="btn-action btn-warning text-xs"
                            title="Mark as lost"
                          >
                            Mark Lost
                          </button>
                          <button 
                            onClick={() => openRevokeModal(card)} 
                            className="btn-action btn-revoke text-xs"
                            title="Revoke card"
                          >
                            Revoke
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleStatusChange(card, 'active')} 
                          className="btn-action btn-activate text-xs"
                          title="Re-activate card"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCards.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty-state">No matching cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Revoke RFID Card</h3>
            <p>
              Are you sure you want to revoke the RFID card with UID <strong>{cardToRevoke?.uid}</strong>? 
              {cardToRevoke?.student_name ? ` This will immediately disable tap attendance for ${cardToRevoke.student_name}.` : ''} 
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeRevokeModal}>Cancel</button>
              <button className="btn-danger" onClick={confirmRevokeCard}>Revoke Card</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Card Modal */}
      {assignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Assign RFID Card</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {assignError && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-sm">
                {assignError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Card UID (Hex / NFC Serial)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24:0A:C4:05 or A1B2C3D4"
                  value={assignForm.uid}
                  onChange={(e) => setAssignForm({ ...assignForm, uid: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono uppercase text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Assign to Student (Section G)
                </label>
                <select
                  value={assignForm.student_id}
                  onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                  required
                >
                  <option value="">-- Choose a Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.roll_no ? `[Roll ${st.roll_no}] ` : ''}{st.name} ({st.enrollment_number}) - {st.section_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Initial Status
                </label>
                <select
                  value={assignForm.status}
                  onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="active">Active (Verified for Taps)</option>
                  <option value="lost">Lost</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              <div className="modal-actions pt-2">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={assignSubmitting}
                >
                  {assignSubmitting ? 'Assigning...' : 'Assign Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RfidCards;
