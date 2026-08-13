import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Admin.css';

function RfidCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [cardToRevoke, setCardToRevoke] = useState(null);

  useEffect(() => {
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
    fetchCards();
  }, []);

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
      await api.post('/revocation/card', { uid: cardToRevoke.uid });
      setCards(cards.map(c => c.uid === cardToRevoke.uid ? { ...c, status: 'revoked' } : c));
      closeRevokeModal();
    } catch (err) {
      alert('Failed to revoke card');
      closeRevokeModal();
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

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>RFID Card Management</h1>
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
              {cards.map((card) => (
                <tr key={card.id}>
                  <td>
                    <span className="font-mono">{card.uid}</span>
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
                      <span>{new Date(card.issued_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    {card.status === 'active' && (
                      <button 
                        onClick={() => openRevokeModal(card)} 
                        className="btn-action btn-revoke"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan="5" className="admin-empty-state">No cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {revokeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Revoke Card</h3>
            <p>
              Are you sure you want to revoke the RFID card with UID <strong>{cardToRevoke?.uid}</strong>? 
              {cardToRevoke?.student_name ? ` This will unassign it from ${cardToRevoke.student_name}.` : ''} 
              This action cannot be undone immediately.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeRevokeModal}>Cancel</button>
              <button className="btn-danger" onClick={confirmRevokeCard}>Revoke</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RfidCards;
