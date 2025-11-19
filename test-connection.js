// Connection Test Script
console.log('🔍 Testing Trinity Jobs API Connection...\n');

const API_BASE = 'http://localhost:5000/api';

async function testConnection() {
  const tests = [
    { name: 'Health Check', url: `${API_BASE}/health` },
    { name: 'Test Endpoint', url: `${API_BASE}/test` },
    { name: 'Jobs Endpoint', url: `${API_BASE}/jobs` }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url);
      const data = await response.text();
      
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      console.log(`Response: ${data.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}\n`);
    }
  }

  // Test login
  try {
    console.log('Testing Login...');
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@candidate.com',
        password: '123456'
      })
    });
    
    const data = await response.json();
    console.log(`✅ Login Test: ${response.status} ${response.statusText}`);
    console.log(`Response:`, data);
  } catch (error) {
    console.log(`❌ Login Test: ${error.message}`);
  }
}

testConnection();