// Simple health check for backend
const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    const response = await fetch('https://trinity-jobs.onrender.com/api/status');
    const data = await response.json();
    
    console.log('✅ Backend Status:', data);
    
    // Test analytics endpoint
    const analyticsResponse = await fetch('https://trinity-jobs.onrender.com/api/analytics/profile/test@example.com?userType=employer');
    const analyticsData = await analyticsResponse.json();
    
    console.log('✅ Analytics Test:', analyticsData);
    
  } catch (error) {
    console.error('❌ Backend Error:', error.message);
  }
};

testBackend();