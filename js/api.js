// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API helper functions with retry logic
async function apiCall(endpoint, options = {}, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`API call attempt ${i + 1}:`, url);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            const response = await fetch(url, {
                method: options.method || 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                },
                body: options.body,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
                } catch {
                    errorMessage = `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('API response:', data);
            return data;
            
        } catch (error) {
            console.error(`API Error (attempt ${i + 1}):`, error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - server not responding');
            }
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                if (i === retries - 1) {
                    throw new Error('Cannot connect to server. Make sure Flask server is running on port 5000.');
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
            
            if (i === retries - 1) {
                throw error;
            }
        }
    }
}

// User registration
async function registerUser(userData) {
    return await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// User login with better error handling
async function loginUser(credentials) {
    try {
        return await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Get user profile
async function getUserProfile(userId) {
    return await apiCall(`/users/${userId}`);
}

// Update user profile
async function updateUserProfile(userId, userData) {
    return await apiCall(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}

// Test server connection
async function testConnection() {
    try {
        const response = await apiCall('/test');
        console.log('Server connection test:', response);
        return response;
    } catch (error) {
        console.error('Server connection failed:', error);
        throw error;
    }
}