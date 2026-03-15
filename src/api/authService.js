import axiosInstance from './axios';

const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
};

export const register = async (userData) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.confirmPassword,
    agreeTerms: userData.agreeTerms,
  });
  
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
    email: credentials.email,
    password: credentials.password,
    remember: credentials.remember,
  });
  
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get(AUTH_ENDPOINTS.ME);
  return response.data;
};

export const isAuthenticated = () => {
  const token = Cookies.get('auth_token');
  return !!token;
};

export const saveAuthData = (token, user, remember = false) => {
  const cookieOptions = remember 
    ? { expires: 30, secure: import.meta.env.PROD, sameSite: 'strict' }
    : { expires: 1, secure: import.meta.env.PROD, sameSite: 'strict' };
  
  Cookies.set('auth_token', token, cookieOptions);
  Cookies.set('user_data', JSON.stringify(user), cookieOptions);
};

export const clearAuthData = () => {
  Cookies.remove('auth_token');
  Cookies.remove('user_data');
};

export const getUserFromCookie = () => {
  const userData = Cookies.get('user_data');
  return userData ? JSON.parse(userData) : null;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  saveAuthData,
  clearAuthData,
  getUserFromCookie,
};