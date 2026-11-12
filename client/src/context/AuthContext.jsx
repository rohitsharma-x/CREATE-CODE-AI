import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('createcode_token') || null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const storedToken = localStorage.getItem('createcode_token');
        if (storedToken) {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            setToken(storedToken);
            setLoading(false);
            return;
          }
        }
        // Seamlessly auto-connect demo session for instant access
        const demoRes = await api.post('/auth/demo');
        if (demoRes.data?.success && demoRes.data?.user) {
          setUser(demoRes.data.user);
          setToken(demoRes.data.token);
          localStorage.setItem('createcode_token', demoRes.data.token);
        }
      } catch (err) {
        localStorage.removeItem('createcode_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('createcode_token', res.data.token);
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('createcode_token', res.data.token);
      return res.data;
    }
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo');
    if (res.data?.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('createcode_token', res.data.token);
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore error on logout
    }
    localStorage.removeItem('createcode_token');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

