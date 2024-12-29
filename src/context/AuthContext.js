import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []); 


  const login = async (token, userData) => {
    try {
        console.log('Starting login process...');
        
        // Clear any existing token
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        // Store new token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Token stored:', token.substring(0, 20) + '...');
        
        // Set user state before verification
        setUser(userData);
        
        // Verify token works
        try {
            const response = await api.get('/auth/me');
            console.log('Auth verification successful:', response.data);
        } catch (error) {
            console.error('Auth verification failed:', error);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        // Cleanup
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        throw error;
    }
};


  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
