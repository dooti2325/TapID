import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User, Radio, Bell } from 'lucide-react';
import Badge from '../Badge/Badge';
import './Navbar.css';

export function Navbar({ title, activeSession = null }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="tapid-navbar glass-panel">
      <div className="tapid-navbar__left">
        {title && <h1 className="tapid-navbar__title">{title}</h1>}
        {activeSession && (
          <Link to={`/attendance/live?sessionId=${activeSession.id}`} className="tapid-navbar__session-pill">
            <Radio size={14} className="animate-pulse text-red-400" />
            <span>Live Session: {activeSession.subject_name || activeSession.id}</span>
            <Badge variant="danger" size="sm" dot>Active</Badge>
          </Link>
        )}
      </div>

      <div className="tapid-navbar__right">
        <div className="tapid-navbar__user-info">
          <div className="tapid-navbar__avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div className="tapid-navbar__details">
            <span className="tapid-navbar__name">{user?.name || user?.email}</span>
            <Badge variant={user?.role === 'admin' ? 'purple' : 'info'} size="sm">
              {user?.role || 'User'}
            </Badge>
          </div>
        </div>

        <button
          className="tapid-navbar__logout-btn"
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
