import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, CalendarDays, Clock } from 'lucide-react';
import api from '../../services/api';
import './Timetable.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EMPTY_FORM = { faculty_id: '', subject_id: '', section_id: '', classroom_id: '', day_of_week: '', start_time: '', end_time: '' };

const Timetable = () => {
  const [entries, setEntries] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filterDay, setFilterDay] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [tRes, fRes, sRes, secRes, cRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/faculty'),
        api.get('/subjects'),
        api.get('/sections'),
        api.get('/classrooms'),
      ]);
      setEntries(tRes.data);
      setFaculty(fRes.data);
      setSubjects(sRes.data);
      setSections(secRes.data);
      setClassrooms(cRes.data);
    } catch {/* silent */}
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/timetable', formData);
      await fetchAll();
      setShowModal(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add timetable entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const filtered = filterDay ? entries.filter(e => e.day_of_week === filterDay) : entries;

  return (
    <div className="timetable-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            Timetable Management
          </h1>
          <p className="text-gray-400 mt-2">Manage class schedules for all faculty and sections.</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); setFormData(EMPTY_FORM); }} className="btn btn-primary">
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {/* Day filter pills */}
      <div className="day-filter-row">
        <button className={`day-pill ${!filterDay ? 'active' : ''}`} onClick={() => setFilterDay('')}>All Days</button>
        {DAYS.map(d => (
          <button key={d} className={`day-pill ${filterDay === d ? 'active' : ''}`} onClick={() => setFilterDay(d)}>{d}</button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="loader" /></div>
        ) : (
          <div className="data-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Section</th>
                  <th>Room</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td><span className="day-chip">{e.day_of_week}</span></td>
                    <td className="font-mono" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                      {e.start_time?.slice(0,5)} – {e.end_time?.slice(0,5)}
                    </td>
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{e.subject_name}</td>
                    <td style={{ color: '#94a3b8' }}>{e.faculty_name}</td>
                    <td><span className="section-chip">{e.section_name}</span></td>
                    <td style={{ color: '#6ee7b7' }}>Room {e.room_number}</td>
                    <td>
                      <button onClick={() => handleDelete(e.id)} className="action-icon-btn delete"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <CalendarDays size={40} style={{ opacity: 0.3 }} />
                        <p>No timetable entries{filterDay ? ` for ${filterDay}` : ''}. Add a slot to get started.</p>
                      </div>
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
          <div className="modal-box" style={{ maxWidth: 540 }}>
            <button onClick={() => setShowModal(false)} className="modal-close-btn"><X size={20} /></button>
            <h2>Add Timetable Slot</h2>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Day of Week</label>
                  <select value={formData.day_of_week} onChange={e => setFormData({ ...formData, day_of_week: e.target.value })} className="form-select" required>
                    <option value="">— Select Day —</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="form-input" required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Faculty</label>
                  <select value={formData.faculty_id} onChange={e => setFormData({ ...formData, faculty_id: e.target.value })} className="form-select" required>
                    <option value="">— Select Faculty —</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Subject</label>
                  <select value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} className="form-select" required>
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={formData.section_id} onChange={e => setFormData({ ...formData, section_id: e.target.value })} className="form-select" required>
                    <option value="">— Select Section —</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name} · {s.branch} · Sem {s.semester}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Classroom</label>
                  <select value={formData.classroom_id} onChange={e => setFormData({ ...formData, classroom_id: e.target.value })} className="form-select" required>
                    <option value="">— Select Room —</option>
                    {classrooms.map(c => <option key={c.id} value={c.id}>Room {c.room_number} — {c.building}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
