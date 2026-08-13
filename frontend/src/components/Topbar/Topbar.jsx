import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="topbar glass-panel">
      <div className="search-bar">
        <Search size={18} className="text-secondary" />
        <input type="text" placeholder="Search students, classes..." />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Loading...'}</span>
            <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Faculty'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
