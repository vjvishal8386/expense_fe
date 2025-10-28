import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
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

  const register = async (email: string, password: string, name?: string) => {
    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const requestBody: { email: string; password: string; name?: string } = {
        email,
        password,
      };
      
      if (name) {
        requestBody.name = name;
      }

      console.log('Attempting registration with:', { email, name, apiUrl: axiosClient.defaults.baseURL });

      const response = await axiosClient.post('/auth/register', requestBody);
      
      console.log('Registration response:', response.data);
      
      const { access_token, user } = response.data;
      
      if (!access_token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      console.log('Registration successful, user:', user);
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

