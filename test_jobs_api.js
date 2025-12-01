// Test jobs API
async function testJobsAPI() {
  try {
    console.log('Testing jobs API...');
    
    // Test jobs endpoint
    const response = await fetch('http://localhost:5000/api/jobs');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const jobs = await response.json();
      console.log('Jobs found:', jobs.length);
      console.log('Jobs data:', JSON.stringify(jobs, null, 2));
    } else {
      console.log('API Error:', response.statusText);
    }
  } catch (error) {
    console.log('Connection Error:', error.message);
  }
}

testJobsAPI();