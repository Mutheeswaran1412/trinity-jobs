// Test updated API endpoint
const testUpdatedAPI = async () => {
  const endpoints = [
    'http://api-staging.zyncjobs.com:5000/api/test',
    'https://api-staging.zyncjobs.com/api/test'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('✅ Success:', data);
      break;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
};

testUpdatedAPI();