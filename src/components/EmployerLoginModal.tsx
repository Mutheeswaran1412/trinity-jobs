import React, { useState } from 'react';
import { X, Mail, Lock, Building, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../api/auth';

interface EmployerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, data?: any) => void;
  onLogin: (userData: {name: string, type: 'candidate' | 'employer', email?: string}) => void;
  onShowNotification?: (notification: {type: 'success' | 'error' | 'info', message: string}) => void;
}

const EmployerLoginModal: React.FC<EmployerLoginModalProps> = ({ isOpen, onClose, onNavigate, onLogin, onShowNotification }) => {
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

    try {
      const response = await authAPI.login({ email, password });
      
      console.log('Employer login - API response userType:', response.user.userType);
      
      // Verify this is an employer account - REJECT candidates
      if (response.user.userType !== 'employer') {
        setError('This is a candidate account. Please use regular "Login" instead.');
        setLoading(false);
        return;
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Stored employer user data:', response.user);
      
      // Use consistent name from backend - prioritize name field, fallback to company or email
      const displayName = response.user.name || response.user.companyName || response.user.company || response.user.fullName || response.user.email.split('@')[0];
      
      // Call onLogin with user data
      onLogin({ 
        name: displayName, 
        type: 'employer',
        email: response.user.email
      });
      console.log('Set employer user type in app');
      
      // Close modal and navigate immediately
      onClose();
      onNavigate('dashboard');
      
      // Show success notification after navigation
      setTimeout(() => {
        if (onShowNotification) {
          onShowNotification({
            type: 'success',
            message: 'Welcome back! Login successful.'
          });
        }
      }, 100);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Show error notification
      if (onShowNotification) {
        onShowNotification({
          type: 'error',
          message: errorMessage
        });
      }
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

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Employer Portal</h2>
            <p className="text-gray-600">Access your hiring dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('forgot-password');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New to hiring on Trinitejob?{' '}
              <button
                onClick={() => {
                  console.log('Sign up button clicked in EmployerLoginModal');
                  onClose();
                  onNavigate('register');
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Looking for a job?{' '}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('login');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Job seeker login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerLoginModal;