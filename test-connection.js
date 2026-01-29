// Test backend connection
const API_URL = 'http://ec2-3-110-178-223.ap-south-1.compute.amazonaws.com:5000';

async function testConnection() {
    console.log('Testing backend connection...');
    
    try {
        // Test basic connection
        const response = await fetch(`${API_URL}/api/test`);
        console.log('Status:', response.status);
        
        if (response.ok) {
            const data = await response.text();
            console.log('✅ Backend is working:', data);
        } else {
            console.log('❌ Backend error:', response.statusText);
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
    }
    
    // Test jobs endpoint
    try {
        const jobsResponse = await fetch(`${API_URL}/api/jobs`);
        console.log('Jobs endpoint status:', jobsResponse.status);
        
        if (jobsResponse.ok) {
            const jobs = await jobsResponse.json();
            console.log('✅ Jobs endpoint working, found', jobs.length, 'jobs');
        }
    } catch (error) {
        console.log('❌ Jobs endpoint failed:', error.message);
    }
}

testConnection();