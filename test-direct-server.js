// Test direct server URL
const testDirectServer = async () => {
  const directUrl = 'http://ec2-3-110-178-223.ap-south-1.compute.amazonaws.com:5000/api/test';
  
  try {
    console.log('🔍 Testing direct server:', directUrl);
    
    const response = await fetch(directUrl);
    const data = await response.json();
    
    console.log('✅ Direct server works!');
    console.log('Response:', data);
  } catch (error) {
    console.error('❌ Direct server failed:', error.message);
  }
};

testDirectServer();