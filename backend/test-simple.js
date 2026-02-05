const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:5000';
  const testEmail = 'mutheeswaran124@gmail.com';
  
  try {
    console.log('Testing Applications API...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData.message);
    
    // Test applications endpoint
    console.log(`\n2. Testing applications for ${testEmail}...`);
    const appsResponse = await fetch(`${baseURL}/api/applications/candidate/${encodeURIComponent(testEmail)}`);
    
    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log(`Found ${appsData.length} applications`);
      
      if (appsData.length > 0) {
        console.log('\nApplications:');
        appsData.forEach((app, index) => {
          console.log(`${index + 1}. ${app.jobId?.jobTitle || 'Unknown Job'} - Status: ${app.status}`);
        });
      }
    } else {
      console.log('Failed to fetch applications:', appsResponse.status);
    }
    
  } catch (error) {
    console.error('API Test Error:', error.message);
    console.log('\nMake sure the backend server is running on http://localhost:5000');
  }
}

testAPI();