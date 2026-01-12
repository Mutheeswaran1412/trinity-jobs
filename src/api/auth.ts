import { API_ENDPOINTS } from '../config/env';

const API_BASE_URL = 'http://localhost:5000/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: 'candidate' | 'employer';
  phone?: string;
  company?: string;
  companyLogo?: string;
  companyWebsite?: string;
  location?: string;
}

export interface User {
  id: string;
  email: string;
  userType: 'jobseeker' | 'employer';
  fullName: string;
  phone?: string;
  company?: string;
  companyName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  skills?: string[];
  experience?: string;
  location?: string;
}

export const authAPI = {
  async register(userData: RegisterData): Promise<{ id: string; message: string; userType: string }> {
    console.log('Calling register API:', API_BASE_URL + '/register');
    console.log('Register data:', userData);
    
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Register response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Register error:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    console.log('Register success:', result);
    return result;
  },

  async login(loginData: LoginData): Promise<{ message: string; user: User }> {
    console.log('Calling login API:', API_BASE_URL + '/login');
    console.log('Login data:', loginData);
    
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Login error:', error);
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    console.log('Login success:', result);
    return result;
  },

  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user');
    }

    return response.json();
  }
};