import React, { useState, useEffect, useContext } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Profile.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        employee_id: '',
        department: '',
        role: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            const data = response.data;
            setFormData({
                name: data.name || '',
                employee_id: data.employee_id || data.enrollment_number || '',
                department: data.department || data.branch || '',
                role: data.role || 'user',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await api.put('/auth/profile', formData);
            setIsEditing(false);
            await fetchProfile(); // refresh data
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;

    return (
        <div className="p-8 fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-white">Profile Information</h1>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            >
                                <Edit size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Profile Picture & Basic Info */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=4f46e5&color=fff&size=128`}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-700"
                                />
                                {isEditing && (
                                    <button className="absolute -bottom-2 -right-2 bg-gray-900 p-2 rounded-full hover:bg-gray-700 transition-colors">
                                        <Edit size={16} className="text-gray-400" />
                                    </button>
                                )}
                            </div>

                            <div className="text-center w-full">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full text-2xl font-bold text-center bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white focus:border-indigo-400 outline-none transition-colors"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-white">{formData.name || 'Anonymous User'}</h2>
                                )}

                                <div className="text-sm text-gray-400 mt-1 font-mono">
                                    {formData.employee_id || 'ID NOT ASSIGNED'}
                                </div>

                                <div className="mt-4 w-full">
                                    {isEditing ? (
                                        <>
                                            {user?.role !== 'student' && (
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm text-white mb-2 focus:border-indigo-400 outline-none"
                                                >
                                                    <option value="Computer Science">Computer Science</option>
                                                    <option value="Electrical">Electrical</option>
                                                    <option value="Mechanical">Mechanical</option>
                                                    <option value="Physics">Physics</option>
                                                    <option value="Chemistry">Chemistry</option>
                                                </select>
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-2 mt-2">
                                            <div className="text-sm text-gray-300">{formData.department}</div>
                                            <div className="text-sm text-gray-400 capitalize">{formData.role}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Address Info */}
                        <div className="space-y-4">
                            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Contact Information</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 w-12">Email:</span>
                                        <span className="text-white font-mono break-all">{formData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-gray-500 w-12">Phone:</span>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-indigo-400 outline-none"
                                            />
                                        ) : (
                                            <span className="text-white font-mono">{formData.phone || 'Not provided'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Address</h3>
                                {isEditing ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-indigo-400 outline-none resize-none"
                                        placeholder="Enter your full address"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300">{formData.address || 'No address on file.'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
