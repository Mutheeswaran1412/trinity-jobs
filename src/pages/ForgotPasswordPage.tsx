import React, { useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import Header from '../components/Header';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header onNavigate={onNavigate} />

        <div className="flex items-center justify-center py-16 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 text-center">
            <div className="bg-red-600 text-white w-16 h-16 rounded flex items-center justify-center mx-auto mb-6 font-bold text-2xl">
              Z
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              If this email exists, a password reset link has been sent to:
            </p>
            <p className="font-medium text-gray-900 mb-4">{email}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Demo Mode:</strong> Check the backend console for the reset link.
              </p>
              <p className="text-xs text-yellow-600">
                Look for "🔗 RESET LINK:" in the server console and copy the URL.
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              The link will expire in 15 minutes.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => onNavigate && onNavigate('home')}
                className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xl hover:bg-red-700 transition-colors cursor-pointer"
              >
                ZyncJobs
              </button>
              <nav className="hidden md:flex items-center space-x-8">
                <button className="text-white hover:text-gray-300 font-medium transition-colors flex items-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Tech Jobs</span>
                </button>
                <button className="text-white hover:text-gray-300 font-medium transition-colors">
                  Companies
                </button>
                <button className="text-white hover:text-gray-300 font-medium transition-colors">
                  Career Events
                </button>
                <button className="text-white hover:text-gray-300 font-medium transition-colors">
                  Resources
                </button>
                <button className="text-white hover:text-gray-300 font-medium transition-colors">
                  Why Dice?
                </button>
              </nav>
            </div>
            <button 
              onClick={() => onNavigate('login')}
              className="text-white hover:text-gray-300 font-medium transition-colors flex items-center space-x-1"
            >
              <span>Log In</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-red-600 text-white w-16 h-16 rounded flex items-center justify-center mx-auto mb-6 font-bold text-xl">
              Z
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Assistance</h2>
            <p className="text-gray-600 text-center mb-2">
              Enter the email address associated with your account.
            </p>
            <p className="text-gray-600 text-center">
              We will email you a link to create a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Please enter your email"
                autoComplete="email"
                required
              />
              {error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Link'}
              </button>
              
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full bg-white text-teal-600 py-3 rounded-lg font-semibold border border-teal-600 hover:bg-teal-50 transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;