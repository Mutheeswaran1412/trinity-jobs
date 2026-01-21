// Quick backend test
const testBackend = async () => {
  try {
    console.log('Testing backend...');
    
    // Test health endpoint
    const healthResponse = await fetch('https://trinity-jobs.onrender.com/api/health');
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);
    }
    
    // Test applications endpoint
    const appsResponse = await fetch('https://trinity-jobs.onrender.com/api/applications/test');
    console.log('Apps test status:', appsResponse.status);
    
    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log('✅ Applications test:', appsData);
    }
    
    // Test actual applications endpoint
    const realAppsResponse = await fetch('https://trinity-jobs.onrender.com/api/applications');
    console.log('Real apps status:', realAppsResponse.status);
    console.log('Real apps content-type:', realAppsResponse.headers.get('content-type'));
    
    if (realAppsResponse.ok) {
      const realAppsData = await realAppsResponse.json();
      console.log('✅ Real applications:', typeof realAppsData);
    } else {
      const errorText = await realAppsResponse.text();
      console.log('❌ Error response:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testBackend();