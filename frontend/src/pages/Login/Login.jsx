import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Radio, Lock, Mail } from 'lucide-react';
import './Login.css';

const FACULTY_PRESETS = [
  { name: 'Ashish Trivedi (AT)', role: 'CSS', email: 'ashish.trivedi@tapid.edu' },
  { name: 'Chetram Thakur (CT)', role: 'CD', email: 'chetram.thakur@tapid.edu' },
  { name: 'Dr. Sumalata Bhandari (SB)', role: 'ES-AI', email: 'sumalata.bhandari@tapid.edu' },
  { name: 'Dr. Trupti Meshram (TM)', role: 'DEV', email: 'trupti.meshram@tapid.edu' },
  { name: 'Amol Dhankar (AD)', role: 'AIML', email: 'amol.dhankar@tapid.edu' },
  { name: 'Prachi Jain (PSJ)', role: 'CD Lab', email: 'prachi.jain@tapid.edu' },
  { name: 'Prof. Harshal Vidhate', role: 'Faculty HOD', email: 'harshal.vidhate@tapid.edu' },
  { name: 'System Admin', role: 'Admin', email: 'admin@tapid.edu' }
];

const Login = () => {
  const [email, setEmail] = useState('ashish.trivedi@tapid.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate(response.data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'I nvalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrap">
            <Radio className="login-logo-icon" size={28} />
            <h1 className="login-brand-title">TapID</h1>
          </div>
          <p className="login-subtitle">Smart NFC Attendance System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="login-preset-selector">
          <label className="preset-label">Quick Faculty Select</label>
          <select
            className="preset-select"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setPassword('password123');
            }}
          >
            {FACULTY_PRESETS.map((p) => (
              <option key={p.email} value={p.email}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset your password.'); }} className="forgot-password-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <div className="login-footer">
        © 2024 TapID. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
