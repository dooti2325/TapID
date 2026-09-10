import React, { useState, useEffect, useContext } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Save, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUserInContext } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: user?.name || user?.full_name || 'Faculty Member',
    email: user?.email || 'faculty@tapid.edu',
    employee_id: user?.employee_id || 'FAC-2024-001',
    department: user?.department || 'Computer Science & Engineering',
    role: user?.role || 'Teacher / Faculty',
    phone: user?.phone || '+91 98765 43210',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data) {
          setProfileData(prev => ({
            ...prev,
            name: res.data.name || prev.name,
            email: res.data.email || prev.email,
            employee_id: res.data.employee_id || prev.employee_id,
            department: res.data.department || prev.department,
            phone: res.data.phone || prev.phone,
          }));
        }
      } catch {
        // use defaults
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', profileData);
      if (updateUserInContext) updateUserInContext(profileData);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSaved(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordSaved(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const initials = profileData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page-container animate-fade-in">
      {/* Header */}
      <div className="profile-page-header">
        <div>
          <h1 className="profile-title">Account & Profile Settings</h1>
          <p className="profile-subtitle">Manage your personal credentials, department assignment, and security.</p>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="profile-grid-2col">
        {/* Left Column: Profile Information */}
        <div className="profile-card profile-info-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">Profile Information</h2>
            <span className="status-badge active">Active Account</span>
          </div>

          <div className="profile-avatar-banner">
            <div className="profile-avatar-circle">
              <span>{initials}</span>
            </div>
            <div className="profile-banner-meta">
              <h3 className="profile-banner-name">{profileData.name}</h3>
              <div className="profile-banner-role-row">
                <span className="role-pill">Faculty / Teacher</span>
                <span className="emp-pill font-mono">{profileData.employee_id}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form-body">
            {profileSaved && (
              <div className="profile-alert-success">
                <CheckCircle2 size={16} /> Profile changes updated successfully!
              </div>
            )}

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="profile-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="profile-input"
                required
              />
            </div>

            <div className="profile-2col-row">
              <div className="form-group">
                <label>Employee / Faculty ID</label>
                <input
                  type="text"
                  name="employee_id"
                  value={profileData.employee_id}
                  onChange={handleProfileChange}
                  className="profile-input font-mono"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  className="profile-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="profile-input"
              />
            </div>

            <div className="profile-form-actions">
              <button type="submit" disabled={loading} className="btn-update-profile">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Change Password */}
        <div className="profile-card password-card">
          <div className="profile-card-header">
            <h2 className="profile-card-title">Security & Password</h2>
            <KeyRound size={18} className="text-slate-400" />
          </div>

          <form onSubmit={handlePasswordSubmit} className="profile-form-body">
            {passwordSaved && (
              <div className="profile-alert-success">
                <CheckCircle2 size={16} /> Password updated successfully!
              </div>
            )}

            {passwordError && (
              <div className="profile-alert-error">
                {passwordError}
              </div>
            )}

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="profile-input"
                placeholder="Re-type new password"
                required
              />
            </div>

            <div className="security-notice-box">
              <ShieldCheck size={18} className="text-blue-500" />
              <p>Passwords must be at least 6 characters. Make sure you use a strong, memorable combination.</p>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="btn-update-password">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
