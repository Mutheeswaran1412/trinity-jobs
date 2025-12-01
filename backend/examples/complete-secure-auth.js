// Complete Secure JWT Authentication Implementation

class SecureAuth {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  // 1. Login - Get both tokens
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/users/login`, {
        method: 'POST',
        credentials: 'include', // Include HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store access token (refresh token is in HTTP-only cookie)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login successful:', data.user);
        return data;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // 2. Make authenticated requests with automatic token refresh
  async makeAuthenticatedRequest(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const config = {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, config);
      
      // If token expired, try to refresh
      if (response.status === 401) {
        const data = await response.json();
        if (data.code === 'TOKEN_EXPIRED') {
          console.log('🔄 Access token expired, refreshing...');
          
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            const newAccessToken = localStorage.getItem('accessToken');
            config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return fetch(url, config);
          } else {
            // Refresh failed, redirect to login
            this.logout();
            throw new Error('Session expired. Please login again.');
          }
        }
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 3. Refresh token with rotation
  async refreshToken() {
    if (this.isRefreshing) {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/users/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store new access token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Process failed queue
        this.processQueue(null, data.accessToken);
        
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        // Refresh failed
        this.processQueue(new Error(data.error), null);
        this.clearAuth();
        return false;
      }
    } catch (error) {
      this.processQueue(error, null);
      this.clearAuth();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Process queued requests after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // 4. Logout with token cleanup
  async logout(logoutAll = false) {
    try {
      await fetch(`${this.baseURL}/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoutAll }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
      window.location.href = '/login';
    }
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }
}

// Usage Examples:
const auth = new SecureAuth();

// Login
async function loginUser() {
  try {
    await auth.login('test@candidate.com', '123456');
    console.log('User logged in successfully');
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}

// Make API calls
async function fetchUserProfile() {
  try {
    const response = await auth.makeAuthenticatedRequest('/api/users/profile');
    const profile = await response.json();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error.message);
  }
}

// Logout
async function logoutUser() {
  await auth.logout();
}

// Logout from all devices
async function logoutFromAllDevices() {
  await auth.logout(true);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureAuth;
} else if (typeof window !== 'undefined') {
  window.SecureAuth = SecureAuth;
}