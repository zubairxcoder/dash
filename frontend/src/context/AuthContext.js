import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // attach token globally (IMPORTANT FIX)
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.log('Auth check failed:', err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      localStorage.setItem('token', data.token);

      // IMPORTANT FIX: attach token immediately
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

      setUser(data.user);

      return data.user;
    } catch (err) {
      console.log('Login error:', err.response?.data || err.message);
      throw err; // VERY IMPORTANT (so Login page catches it)
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}

    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);