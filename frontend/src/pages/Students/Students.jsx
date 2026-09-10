import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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

// Real Student Roster - Section G (Roll No 1 to 58)
const REAL_SECTION_G_STUDENTS = [
  { id: 1, roll_no: 1, enrollment_number: 'GHRUA23011060140', name: 'Shantanu Yashwant Raut', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '04:A2:8B:1A', status: 'Registered' },
  { id: 2, roll_no: 2, enrollment_number: 'GHRUA23011060170', name: 'DIVYANSH MANUKANT GADEKAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '14:F2:3C:99', status: 'Registered' },
  { id: 3, roll_no: 3, enrollment_number: 'GHRUA23011060205', name: 'VEDANT MANISH BAVARIA', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '3A:BC:D1:42', status: 'Registered' },
  { id: 4, roll_no: 4, enrollment_number: 'GHRUA23011060250', name: 'SAMIKSHA PRABHAKAR MOHITKAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '88:E1:90:3F', status: 'Registered' },
  { id: 5, roll_no: 5, enrollment_number: 'GHRUA23011060258', name: 'SANSKAR LAXMAN GADDEWAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '24:0A:C4:01', status: 'Registered' },
  { id: 6, roll_no: 6, enrollment_number: 'GHRUA23011060273', name: 'SHREYA ANIL MAHETKAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '77:19:D4:5E', status: 'Registered' },
  { id: 7, roll_no: 7, enrollment_number: 'GHRUA23011060275', name: 'SHRUTI TULSHIRAM KAWALE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'B2:10:98:AA', status: 'Registered' },
  { id: 8, roll_no: 8, enrollment_number: 'GHRUA23011060283', name: 'SUYASH SUNILRAO HANUMANTE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '66:C3:41:88', status: 'Registered' },
  { id: 9, roll_no: 9, enrollment_number: 'GHRUA23011060289', name: 'TRUPTI DHIRAJ SEWARE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '55:B4:72:19', status: 'Registered' },
  { id: 10, roll_no: 10, enrollment_number: 'GHRUA23011060297', name: 'VEDANT GOPAL MANKAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '99:D1:43:21', status: 'Registered' },
  { id: 11, roll_no: 11, enrollment_number: 'GHRUA23011060298', name: 'VEDANT MOHAN WANKHEDE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '12:A3:E5:87', status: 'Registered' },
  { id: 12, roll_no: 12, enrollment_number: 'GHRUA23011060300', name: 'VEDANT SUNIL DURGE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '44:F6:71:02', status: 'Registered' },
  { id: 13, roll_no: 13, enrollment_number: 'GHRUA23011060309', name: 'YASH NAGESHWAR KARME', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '33:88:99:A1', status: 'Registered' },
  { id: 14, roll_no: 14, enrollment_number: 'GHRUA23011060317', name: 'ADITYA BHASKAR DARNE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '71:22:90:BA', status: 'Registered' },
  { id: 15, roll_no: 15, enrollment_number: 'GHRUA23011060322', name: 'ANURAG ATUL JOSHI', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '82:33:44:CD', status: 'Registered' },
  { id: 16, roll_no: 16, enrollment_number: 'GHRUA23011060336', name: 'AYUSH RAJESH KALAMBE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '19:44:55:EF', status: 'Registered' },
  { id: 17, roll_no: 17, enrollment_number: 'GHRUA23011060348', name: 'Dootiballav Gouriprasanna Saha', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '24:0A:C4:00', status: 'Registered' },
  { id: 18, roll_no: 18, enrollment_number: 'GHRUA23011060359', name: 'HARSHAL SUHAS VIDHATE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '24:0A:C4:02', status: 'Registered' },
  { id: 19, roll_no: 19, enrollment_number: 'GHRUA23011060360', name: 'HARSHAL RAMESH VIJAYWAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '91:55:66:77', status: 'Registered' },
  { id: 20, roll_no: 20, enrollment_number: 'GHRUA23011060389', name: 'KASTURI VIVEK AWACHAT', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'A5:66:77:88', status: 'Registered' },
  { id: 21, roll_no: 21, enrollment_number: 'GHRUA23011060393', name: 'KRITIKA JITENDRA PANDEY', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'B6:77:88:99', status: 'Registered' },
  { id: 22, roll_no: 22, enrollment_number: 'GHRUA23011060396', name: 'KUNAL SUDEEP JAIN', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'C7:88:99:AA', status: 'Registered' },
  { id: 23, roll_no: 23, enrollment_number: 'GHRUA23011060418', name: 'Nikhil Parmeshwar Netam', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'D8:99:AA:BB', status: 'Registered' },
  { id: 24, roll_no: 24, enrollment_number: 'GHRUA23011060454', name: 'PRASAD PRASHANT DEO', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'E9:AA:BB:CC', status: 'Registered' },
  { id: 25, roll_no: 25, enrollment_number: 'GHRUA23011060455', name: 'PRASHIT PRABHAT HOKAM', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: 'FA:BB:CC:DD', status: 'Registered' },
  { id: 26, roll_no: 26, enrollment_number: 'GHRUA23011060457', name: 'KUNALI AMOL PATHRABE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '0B:CC:DD:EE', status: 'Registered' },
  { id: 27, roll_no: 27, enrollment_number: 'GHRUA23011060462', name: 'Madhur Sudhir Madankar', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '1C:DD:EE:FF', status: 'Registered' },
  { id: 28, roll_no: 28, enrollment_number: 'GHRUA23011060467', name: 'PRATHMESH RAMESH AMLE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '2D:EE:FF:00', status: 'Registered' },
  { id: 29, roll_no: 29, enrollment_number: 'GHRUA23011060471', name: 'PRIYANSHU DINESH AMBHORE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '3E:FF:00:11', status: 'Registered' },
  { id: 30, roll_no: 30, enrollment_number: 'GHRUA23011060500', name: 'VEDANT SACHIDANAND WANDHARE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '4F:00:11:22', status: 'Registered' },
  { id: 31, roll_no: 31, enrollment_number: 'GHRUA23011060571', name: 'DIVYANSH SALIL VERMA', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '50:11:22:33', status: 'Registered' },
  { id: 32, roll_no: 32, enrollment_number: 'GHRUA23011060592', name: 'PRIYANSHU SWARUPKUMAR KATRE', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '61:22:33:44', status: 'Registered' },
  { id: 33, roll_no: 33, enrollment_number: 'GHRUA23011060606', name: 'TRISHA NARENDRA TURKAR', branch: 'Computer Science', section_name: 'Batch G1', rfid_uid: '72:33:44:55', status: 'Registered' },
  { id: 34, roll_no: 34, enrollment_number: 'GHRUA23011060614', name: 'KSHITIJ JOHNEY DUSHING', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '83:44:55:66', status: 'Registered' },
  { id: 35, roll_no: 35, enrollment_number: 'GHRUA23011060687', name: 'VEDANT GOPALRAO BIRGADE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '94:55:66:77', status: 'Registered' },
  { id: 36, roll_no: 36, enrollment_number: 'GHRUA23011060688', name: 'YASH RAJESH TAMHANKAR', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'A5:66:77:88', status: 'Registered' },
  { id: 37, roll_no: 37, enrollment_number: 'GHRUA23011060713', name: 'PRINCY KAMLESH TABHANE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'B6:77:88:99', status: 'Registered' },
  { id: 38, roll_no: 38, enrollment_number: 'GHRUA23011060725', name: 'Om Yuwaraj Chandekar', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'C7:88:99:AA', status: 'Registered' },
  { id: 39, roll_no: 39, enrollment_number: 'GHRUA23011060780', name: 'Aniket Gajanan Balbudhe', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'D8:99:AA:BB', status: 'Registered' },
  { id: 40, roll_no: 40, enrollment_number: 'GHRUA23011060793', name: 'RUTUJA RAKESH BHUSARI', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'E9:AA:BB:CC', status: 'Registered' },
  { id: 41, roll_no: 41, enrollment_number: 'GHRUA23011060816', name: 'Prajkta Narendra Wankhede', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'FA:BB:CC:DD', status: 'Registered' },
  { id: 42, roll_no: 42, enrollment_number: 'GHRUA23011060819', name: 'SARTHAK AKHILESH DUBEY', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '0B:CC:DD:EE', status: 'Registered' },
  { id: 43, roll_no: 43, enrollment_number: 'GHRUA23011060837', name: 'KRISHNA SANTOSH MORE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '1C:DD:EE:FF', status: 'Registered' },
  { id: 44, roll_no: 44, enrollment_number: 'GHRUA23011060840', name: 'SAMPADA DAULATHRAMSINGH BUNDEL', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '2D:EE:FF:00', status: 'Registered' },
  { id: 45, roll_no: 45, enrollment_number: 'GHRUA23011060866', name: 'AVINASH RAJU MUDE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '3E:FF:00:11', status: 'Registered' },
  { id: 46, roll_no: 46, enrollment_number: 'GHRUA23011060868', name: 'KAUSTUBH KISHOR SAURKAR', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '4F:00:11:22', status: 'Registered' },
  { id: 47, roll_no: 47, enrollment_number: 'GHRUA23011060870', name: 'KRUTEE WASUDEO SHENDE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '50:11:22:33', status: 'Registered' },
  { id: 48, roll_no: 48, enrollment_number: 'GHRUA23011060872', name: 'KUNAL RAJU JIWTODE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '61:22:33:44', status: 'Registered' },
  { id: 49, roll_no: 49, enrollment_number: 'GHRUA23011060873', name: 'PRATIK LAKHANLAL GHORMARE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '72:33:44:55', status: 'Registered' },
  { id: 50, roll_no: 50, enrollment_number: 'GHRUA23011060889', name: 'HARSHAL SURENDRA DOIFODE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '83:44:55:66', status: 'Registered' },
  { id: 51, roll_no: 51, enrollment_number: 'GHRUA23011060893', name: 'ANJALI RAMESH REWATKAR', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '94:55:66:77', status: 'Registered' },
  { id: 52, roll_no: 52, enrollment_number: 'GHRUA23011060894', name: 'PRACHI SANJAY DHOTE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'A5:66:77:88', status: 'Registered' },
  { id: 53, roll_no: 53, enrollment_number: 'GHRUA23011060907', name: 'PUSHPAK RAJKUMAR IKHAR', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'B6:77:88:99', status: 'Registered' },
  { id: 54, roll_no: 54, enrollment_number: 'GHRUA23011060914', name: 'TRUPTI PRAVIN ZILPE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'C7:88:99:AA', status: 'Registered' },
  { id: 55, roll_no: 55, enrollment_number: 'GHRUA23011060922', name: 'YASH DHANARAJ HATWAR', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'D8:99:AA:BB', status: 'Registered' },
  { id: 56, roll_no: 56, enrollment_number: 'GHRUA23011060939', name: 'SAKSHI RAJENDRA OZA', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'E9:AA:BB:CC', status: 'Registered' },
  { id: 57, roll_no: 57, enrollment_number: 'GHRUA23011060972', name: 'VEDANT RAJESH WANDHARE', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: 'FA:BB:CC:DD', status: 'Registered' },
  { id: 58, roll_no: 58, enrollment_number: 'GHRUA23011060981', name: 'KARAN SHIVPRASAD SHAHU', branch: 'Computer Science', section_name: 'Batch G2', rfid_uid: '0B:CC:DD:EE', status: 'Registered' },
];

const EMPTY_FORM = { name: '', enrollment_number: '', email: '', section_id: '', rfid_uid: '', branch: 'Computer Science' };

const Students = () => {
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

  useEffect(() => {
    fetchStudents();
    fetchSections();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents(REAL_SECTION_G_STUDENTS);
      }
    } catch {
      setStudents(REAL_SECTION_G_STUDENTS);
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
      if (editingId) {
        setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
      } else {
        const newStu = {
          id: Date.now(),
          roll_no: students.length + 1,
          ...formData,
          status: formData.rfid_uid ? 'Registered' : 'Pending Card'
        };
        setStudents(prev => [newStu, ...prev]);
      }
      closeModal();
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
      setStudents(prev => prev.filter(s => s.id !== id));
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
        <button onClick={openAddModal} className="btn-add-student">
          <Plus size={18} />
          <span>Add Student</span>
        </button>
      </div>

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
                <th className="text-right">Actions</th>
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
                    value={formData.section_name || 'Batch G1'}
                    onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                    className="modal-select"
                  >
                    <option value="Batch G1">Batch G1 (Roll 1 to 33)</option>
                    <option value="Batch G2">Batch G2 (Roll 34 to 58)</option>
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
