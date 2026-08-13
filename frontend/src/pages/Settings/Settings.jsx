import React, { useState, useEffect, useContext } from 'react';
import { Save, Bell, Shield, Moon, Sun, Smartphone, UserCheck, Key, X, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Settings.css';

const Settings = () => {
  const { user } = useContext(AuthContext);
  
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('tapid_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.notifications ?? true);
      setEmailAlerts(parsed.emailAlerts ?? false);
      setDarkMode(parsed.darkMode ?? true);
      setTwoFactor(parsed.twoFactor ?? false);
    }
  }, []);

  const handleSave = () => {
    // Save to local storage
    localStorage.setItem('tapid_settings', JSON.stringify({
      notifications, emailAlerts, darkMode, twoFactor
    }));
    
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.innerHTML = '<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Saved!</span>';
      btn.classList.add('bg-emerald-500');
      setTimeout(() => {
        btn.innerHTML = '<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Save Changes</span>';
        btn.classList.remove('bg-emerald-500');
      }, 2000);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', passwordData);
      alert('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-container fade-in relative">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your preferences and configurations</p>
        </div>
        <button id="save-btn" onClick={handleSave} className="save-settings-btn glass-panel transition-all">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-grid">
        {/* Appearance Settings */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header border-b border-gray-700/50 pb-4 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Sun size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Appearance</h2>
          </div>
          
          <div className="setting-row">
            <div className="setting-info">
              <h3 className="text-gray-200 font-medium">Dark Mode</h3>
              <p className="text-sm text-gray-400">Use dark theme across the application</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card glass-panel">
          <div className="settings-card-header border-b border-gray-700/50 pb-4 mb-6 flex items-center gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
              <Bell size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-100">Notifications</h2>
          </div>
          
          <div className="setting-row">
            <div className="setting-info">
              <h3 className="text-gray-200 font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-400">Receive alerts in your browser</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <h3 className="text-gray-200 font-medium">Email Alerts</h3>
              <p className="text-sm text-gray-400">Receive daily summary reports</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Security Settings - Admin Only */}
        {user?.role === 'admin' && (
          <div className="settings-card glass-panel col-span-full">
            <div className="settings-card-header border-b border-gray-700/50 pb-4 mb-6 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Shield size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">Security & Access</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="setting-row">
                <div className="setting-info">
                  <h3 className="text-gray-200 font-medium flex items-center gap-2">
                    <Smartphone size={16} className="text-gray-400" />
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-400">Require an extra step during login</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-row">
                <div className="setting-info">
                  <h3 className="text-gray-200 font-medium flex items-center gap-2">
                    <Key size={16} className="text-gray-400" />
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-400">Update your account password</p>
                </div>
                <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-700">
                  Update
                </button>
              </div>
              
              <div className="setting-row">
                <div className="setting-info">
                  <h3 className="text-gray-200 font-medium flex items-center gap-2">
                    <UserCheck size={16} className="text-gray-400" />
                    Active Sessions
                  </h3>
                  <p className="text-sm text-gray-400">Manage devices currently logged in</p>
                </div>
                <button onClick={() => setShowSessionsModal(true)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors border border-gray-700">
                  View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                <input 
                  type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-400 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                <input 
                  type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-400 outline-none transition-colors"
                  required
                />
              </div>
              <button 
                type="submit" disabled={passwordLoading}
                className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
          <div className="glass-panel w-full max-w-lg p-6 relative shadow-2xl">
            <button onClick={() => setShowSessionsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserCheck className="text-emerald-400" /> Active Sessions
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-emerald-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">Windows 11 • Chrome</h4>
                    <p className="text-sm text-gray-400 mt-1">IP: 192.168.1.5</p>
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><Check size={12}/> Current Session</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-medium">iPhone 14 • Safari</h4>
                    <p className="text-sm text-gray-400 mt-1">IP: 10.0.0.12</p>
                    <p className="text-xs text-gray-500 mt-2">Last active: 2 hours ago</p>
                  </div>
                  <button className="text-sm text-red-400 hover:text-red-300">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
