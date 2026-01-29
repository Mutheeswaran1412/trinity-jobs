// Test script to verify API endpoint accessibility
const testApiEndpoint = async () => {
  try {
    console.log('🔍 Testing API endpoint: https://api-staging.zyncjobs.com/api/test');
    
    const response = await fetch('https://api-staging.zyncjobs.com/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Test Successful!');
      console.log('Response:', data);
      
      if (data.status === 'success' && data.message === 'Connected to MongoDB Atlas') {
        console.log('🔥 Backend is 100% publicly accessible!');
      }
    } else {
      console.log('❌ API Test Failed');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testApiEndpoint();