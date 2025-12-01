import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/auth';
import { LoadingButton, FormLoading } from './LoadingStates';

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  const existingToast = document.getElementById('toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
  
  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };
  
  toast.className += ` ${colors[type]}`;
  toast.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">×</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-x-full'), 100);
  setTimeout(() => toast.remove(), 4000);
};

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onLogin: (userData: {name: string, type: 'candidate' | 'employer'}) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Attempting login with:', { email });

    try {
      const response = await authAPI.login({ email, password });
      console.log('Login successful:', response);
      
      // Check if this is an employer account - REJECT if so
      if (response.user.userType === 'employer') {
        setError('This is an employer account. Please use "Employer Login" instead.');
        setLoading(false);
        return;
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Show success toast
      showToast(`Welcome back, ${response.user.name || response.user.email.split('@')[0]}!`, 'success');
      
      // Call onLogin with user data
      console.log('Raw API response userType:', response.user.userType);
      const userType = response.user.userType === 'employer' ? 'employer' : 'candidate';
      console.log('Mapped user type for app:', userType);
      onLogin({ 
        name: response.user.name || response.user.email.split('@')[0], 
        type: userType
      });
      
      // Always go to dashboard after login
      onNavigate('dashboard');
      
      // Clear any pending job role
      sessionStorage.removeItem('pendingJobRole');
      
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 relative">
          {loading && <FormLoading message="Authenticating..." />}
          <div className="text-center mb-8">
            <div className="bg-red-600 text-white w-12 h-12 rounded flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              Z
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600">Log in to continue</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter Password"
                  required
                />
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-teal-600 hover:text-teal-700 flex items-center space-x-1 ml-auto"
                >
                  <span>Show Password</span>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                onClose();
                onNavigate('forgot-password');
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              Partner with us to help you hire top tech talent.
            </p>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Signing In..."
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Sign In
            </LoadingButton>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('register');
                }}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;