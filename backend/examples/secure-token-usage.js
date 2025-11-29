// Example: Secure JWT tokens with HTTP-only cookies

// 1. Login with HTTP-only cookie storage
async function login(email, password) {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Only store access token - refresh token is in HTTP-only cookie
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login successful:', data.user);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// 2. Make authenticated API calls
async function makeAuthenticatedRequest(url, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // If access token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      const newAccessToken = localStorage.getItem('accessToken');
      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      window.location.href = '/login';
      return;
    }
  }

  return response;
}

// 3. Refresh access token using HTTP-only cookie
async function refreshAccessToken() {
  try {
    const response = await fetch('/api/users/refresh', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// 4. Secure logout
async function logout() {
  try {
    await fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// 5. Check authentication
function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

// Example usage:
// login('test@candidate.com', '123456');
// makeAuthenticatedRequest('/api/jobs');
// logout();