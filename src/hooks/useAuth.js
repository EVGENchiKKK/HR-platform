import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import authService from '../api/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const cachedUser = authService.getUserFromCookie();
          
          if (cachedUser) {
            const response = await authService.getCurrentUser();
            
            if (response.success) {
              setUser(response.data);
              setToken(Cookies.get('auth_token'));
            } else {
              authService.clearAuthData();
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user } = response.data;
        
        authService.saveAuthData(token, user, credentials.remember);
        setToken(token);
        setUser(user);
        
        return { success: true, user };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ошибка соединения с сервером';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      authService.clearAuthData();
      setUser(null);
      setToken(null);
    }
  }, []);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError: () => setError(null),
  };
};

export default useAuth;