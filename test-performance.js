const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEndpoint(endpoint, description) {
  const start = Date.now();
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 5000 });
    const duration = Date.now() - start;
    console.log(`✅ ${description}: ${duration}ms - Status: ${response.status}`);
    return { success: true, duration, status: response.status };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ ${description}: ${duration}ms - Error: ${error.message}`);
    return { success: false, duration, error: error.message };
  }
}

async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test...\n');
  
  const tests = [
    ['/api/health', 'Health Check'],
    ['/api/test', 'Database Connection'],
    ['/api/jobs', 'Jobs API'],
    ['/api/companies', 'Companies API'],
    ['/', 'Root Endpoint']
  ];
  
  const results = [];
  
  for (const [endpoint, description] of tests) {
    const result = await testEndpoint(endpoint, description);
    results.push({ endpoint, description, ...result });
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
  }
  
  console.log('\n📊 Performance Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    console.log(`✅ Successful requests: ${successful.length}/${results.length}`);
    console.log(`⏱️  Average response time: ${avgDuration.toFixed(0)}ms`);
    
    const slowest = successful.reduce((max, r) => r.duration > max.duration ? r : max);
    const fastest = successful.reduce((min, r) => r.duration < min.duration ? r : min);
    
    console.log(`🐌 Slowest: ${slowest.description} (${slowest.duration}ms)`);
    console.log(`⚡ Fastest: ${fastest.description} (${fastest.duration}ms)`);
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed requests: ${failed.length}`);
    failed.forEach(f => console.log(`   - ${f.description}: ${f.error}`));
  }
  
  // Performance recommendations
  console.log('\n💡 Performance Tips:');
  if (successful.some(r => r.duration > 1000)) {
    console.log('   - Some requests are taking >1s. Check database connection.');
  }
  if (successful.some(r => r.duration > 500)) {
    console.log('   - Consider optimizing slow endpoints.');
  }
  if (failed.length > 0) {
    console.log('   - Fix failed endpoints first.');
  }
  console.log('   - Disable unnecessary middleware in development.');
  console.log('   - Use MongoDB indexes for faster queries.');
}

// Run the test
runPerformanceTest().catch(console.error);