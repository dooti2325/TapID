import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="topbar glass-panel">
      <div className="search-bar">
        <Search size={18} className="text-secondary" />
        <input type="text" placeholder="Search students, classes, reports..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>

        <div className="user-profile" onClick={() => setProfileOpen(p => !p)}>
          <div className="user-avatar">
            {initials}
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty' : 'Student'}</span>
          </div>
          <ChevronDown size={16} className={`chevron ${profileOpen ? 'open' : ''}`} />
        </div>

        {profileOpen && (
          <div className="profile-dropdown glass-panel">
            <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
              <User size={16} />
              <span>My Profile</span>
            </Link>
            <Link to="/settings" className="dropdown-item" onClick={() => setProfileOpen(false)}>
              <Settings size={16} />
              <span>Settings</span>
            </Link>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
