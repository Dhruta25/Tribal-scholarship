import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mota_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('mota_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('[Auth Error]: Failed to fetch user profile.');
          if (error.response?.status === 401 || error.response?.status === 403) logout();
          else {
            try { setUser(JSON.parse(localStorage.getItem('mota_user') || 'null')); } catch { setUser(null); }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mota_token' || e.key === 'mota_user') {
        const currentToken = localStorage.getItem('mota_token');
        if (!currentToken) {
          window.location.replace('/login');
          return;
        }
        try {
          const rawUser = localStorage.getItem('mota_user');
          const newUser = rawUser ? JSON.parse(rawUser) : null;
          const role = newUser?.role;
          const roleHomes = {
            admin: '/admin/dashboard',
            verifier: '/verifier/queue',
            officer: '/officer/scrutiny',
            applicant: '/applicant/dashboard'
          };
          const target = roleHomes[role] || '/applicant/dashboard';
          window.location.replace(target);
        } catch {
          window.location.replace('/login');
        }
      }
    };

    const handleUnauthorized = () => logout();
    window.addEventListener('mota:unauthorized', handleUnauthorized);
    window.addEventListener('storage', handleStorageChange);
    return () => { window.removeEventListener('storage', handleStorageChange); window.removeEventListener('mota:unauthorized', handleUnauthorized); };
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('mota_token', res.data.token);
      localStorage.setItem('mota_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (formData) => {
    try {
      const res = await axiosClient.post('/auth/register', formData);
      return res.data;
    } catch (err) {
      // If account was created but OTP delivery failed (503), still return the data
      // so the frontend can navigate to /verify-otp and let the user resend
      const data = err.response?.data;
      if (data?.code === 'OTP_DELIVERY_FAILED' || data?.requiresVerification) {
        return data;
      }
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    const res = await axiosClient.post('/auth/verify-otp', { email, otp });
    if (res.data.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('mota_token', res.data.token);
      localStorage.setItem('mota_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mota_token');
    localStorage.removeItem('mota_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('mota_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      verifyOtp,
      logout,
      updateUserProfile,
      isAuthenticated: Boolean(user && token)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
