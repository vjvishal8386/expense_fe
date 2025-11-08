import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import type { User, RegisterResponse, TokenResponse } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, invitationToken?: string) => Promise<RegisterResponse>;
  verifyOTP: (userId: string, otp: string) => Promise<void>;
  resendOTP: (userId: string, email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, apiUrl: axiosClient.defaults.baseURL });
      
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      const { access_token, user } = response.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('Login successful, user:', user);
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      // Better error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 403) {
        // Email not verified
        throw new Error(error.response.data.detail || 'Please verify your email before logging in');
      } else if (error.response?.status === 404) {
        throw new Error('User not found. Please register first.');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const register = async (email: string, password: string, name?: string, invitationToken?: string): Promise<RegisterResponse> => {
    try {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const requestBody: { email: string; password: string; name?: string; invitation_token?: string } = {
        email,
        password,
      };
      
      if (name) {
        requestBody.name = name;
      }

      if (invitationToken) {
        requestBody.invitation_token = invitationToken;
      }

      console.log('Attempting registration with:', { email, name, hasInvitation: !!invitationToken, apiUrl: axiosClient.defaults.baseURL });

      const response = await axiosClient.post<RegisterResponse>('/auth/register', requestBody);
      
      console.log('Registration response:', response.data);
      
      // Return the response which contains user_id for OTP verification
      return response.data;
    } catch (error: any) {
      console.error('Register error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      // Better error messages
      if (error.response?.status === 400) {
        throw new Error(error.response.data.detail || 'Email already registered');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  };

  const verifyOTP = async (userId: string, otp: string) => {
    try {
      console.log('Attempting OTP verification for user:', userId);

      const response = await axiosClient.post<TokenResponse>('/auth/verify-otp', {
        user_id: userId,
        otp: otp,
      });

      console.log('OTP verification response:', response.data);

      const { access_token, user } = response.data;

      if (!access_token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      console.log('OTP verification successful, user:', user);
    } catch (error: any) {
      console.error('OTP verification error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Better error messages
      if (error.response?.status === 400) {
        throw new Error(error.response.data.detail || 'Invalid or expired OTP');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('OTP verification failed. Please try again.');
      }
    }
  };

  const resendOTP = async (userId: string, email: string) => {
    try {
      console.log('Resending OTP to:', email);

      const response = await axiosClient.post('/auth/resend-otp', {
        user_id: userId,
        email: email,
      });

      console.log('OTP resend response:', response.data);
    } catch (error: any) {
      console.error('Resend OTP error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Better error messages
      if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.message === 'Network Error') {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw new Error('Failed to resend OTP. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

