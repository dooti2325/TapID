import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch {
                // Corrupted storage — clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Ensure we always store the full user object including name
        const enrichedUser = { ...userData };
        setUser(enrichedUser);
        localStorage.setItem('user', JSON.stringify(enrichedUser));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUserInContext = (updatedData) => {
        const updated = { ...user, ...updatedData };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUserInContext }}>
            {children}
        </AuthContext.Provider>
    );
};
