// Test all critical backend endpoints
const testAllEndpoints = async () => {
  const baseUrl = 'https://trinity-jobs.onrender.com';
  
  const endpoints = [
    '/api/test',
    '/api/jobs',
    '/api/applications',
    '/api/analytics/profile/muthees@trinitetech.com?userType=employer',
    '/api/companies',
    '/api/users'
  ];
  
  console.log('🧪 Testing backend endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${baseUrl}${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`Status: ${response.status}, Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ JSON Response:`, typeof data === 'object' ? 'Valid JSON' : 'Invalid');
      } else {
        const text = await response.text();
        console.log(`❌ Non-JSON Response:`, text.substring(0, 100) + '...');
      }
      
      console.log('---');
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
      console.log('---');
    }
  }
};

testAllEndpoints();