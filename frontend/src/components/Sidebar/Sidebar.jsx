import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  MonitorPlay,
  CreditCard,
  ScrollText,
  UploadCloud,
  LogOut,
  Radio,
  Cpu,
  GraduationCap,
  Library,
  Settings,
  CalendarDays,
  Building2,
  Layers,
  User,
} from 'lucide-react';
import './Sidebar.css';

const navItem = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Radio size={20} />
        </div>
        <div>
          <h2>TapID</h2>
          <span className="sidebar-tagline">Smart Attendance</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* ─── Admin Only Dashboard ─── */}
        {user?.role === 'admin' && (
          <NavLink to="/admin-dashboard" className={navItem}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>
        )}

        {/* ─── Faculty Only Dashboard ─── */}
        {user?.role === 'faculty' && (
          <NavLink to="/dashboard" className={navItem}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
        )}

        {/* ─── Shared ─── */}
        <div className="nav-section-label">Attendance</div>

        <NavLink to="/attendance" className={navItem}>
          <ClipboardList size={18} />
          <span>Sessions</span>
        </NavLink>

        <NavLink to="/reports" className={navItem}>
          <BookOpen size={18} />
          <span>Reports</span>
        </NavLink>

        <div className="nav-section-label">Management</div>

        <NavLink to="/students" className={navItem}>
          <Users size={18} />
          <span>Students</span>
        </NavLink>

        <NavLink to="/subjects" className={navItem}>
          <Library size={18} />
          <span>Subjects</span>
        </NavLink>

        {/* ─── Admin Only ─── */}
        {user?.role === 'admin' && (
          <>
            <NavLink to="/faculty" className={navItem}>
              <GraduationCap size={18} />
              <span>Faculty</span>
            </NavLink>

            <NavLink to="/sections" className={navItem}>
              <Layers size={18} />
              <span>Sections</span>
            </NavLink>

            <NavLink to="/timetable" className={navItem}>
              <CalendarDays size={18} />
              <span>Timetable</span>
            </NavLink>

            <div className="nav-section-label">Infrastructure</div>

            <NavLink to="/classrooms" className={navItem}>
              <Building2 size={18} />
              <span>Classrooms</span>
            </NavLink>

            <NavLink to="/devices" className={navItem}>
              <Cpu size={18} />
              <span>Devices</span>
            </NavLink>

            <NavLink to="/rfid-cards" className={navItem}>
              <CreditCard size={18} />
              <span>RFID Cards</span>
            </NavLink>

            <div className="nav-section-label">System</div>

            <NavLink to="/audit-logs" className={navItem}>
              <ScrollText size={18} />
              <span>Audit Logs</span>
            </NavLink>

            <NavLink to="/upload" className={navItem}>
              <UploadCloud size={18} />
              <span>Uploads</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className={navItem}>
          <User size={18} />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/settings" className={navItem}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
