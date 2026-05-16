import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

const ADMIN_EMAIL    = 'ahmad@devops.pk';
const ADMIN_PASSWORD = 'password123';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const autoLogin = async () => {
    try {
      // try existing token first
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        setUser(data);
        setLoading(false);
        return;
      }
    } catch {
      localStorage.removeItem('token');
    }

    // auto login with admin credentials
    try {
      const { data } = await api.post('/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
    } catch {
      // if admin doesn't exist yet, register then login
      try {
        await api.post('/auth/register', {
          name: 'Ahmad',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'admin',
        });
        const { data } = await api.post('/auth/login', {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });
        localStorage.setItem('token', data.token);
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
      } catch (err) {
        console.log('Auto login failed:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    autoLogin();
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