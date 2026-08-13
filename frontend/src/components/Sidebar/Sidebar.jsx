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
  Settings
} from 'lucide-react';
import './Sidebar.css';

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
        <Radio className="logo-icon text-accent" size={32} />
        <h2>TapID</h2>
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'admin' && (
          <NavLink to="/admin-dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
        )}
        
        {user?.role === 'faculty' && (
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        )}

        <NavLink to="/attendance" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <ClipboardList size={20} />
          <span>Attendance</span>
        </NavLink>

        <NavLink to="/students" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={20} />
          <span>Students</span>
        </NavLink>
        
        <NavLink to="/subjects" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Library size={20} />
          <span>Subjects</span>
        </NavLink>

        <NavLink to="/classrooms" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <MonitorPlay size={20} />
          <span>Classrooms</span>
        </NavLink>

        <NavLink to="/reports" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BookOpen size={20} />
          <span>Reports</span>
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <NavLink to="/faculty" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <GraduationCap size={20} />
              <span>Faculty</span>
            </NavLink>

            <NavLink to="/devices" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <Cpu size={20} />
              <span>Devices</span>
            </NavLink>

            <NavLink to="/rfid-cards" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <CreditCard size={20} />
              <span>RFID Cards</span>
            </NavLink>

            <NavLink to="/audit-logs" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <ScrollText size={20} />
              <span>Audit Logs</span>
            </NavLink>

            <NavLink to="/upload" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
              <UploadCloud size={20} />
              <span>Uploads</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
