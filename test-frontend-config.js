// Frontend API Configuration Test
import { config, API_ENDPOINTS } from './src/config/env.ts';
import { API_CONFIG, API_ENDPOINTS as CONST_ENDPOINTS } from './src/config/constants.ts';

console.log('=== FRONTEND API CONFIGURATION TEST ===\n');

// Test 1: Environment Variables
console.log('1. Environment Variables:');
console.log('   VITE_API_URL:', process.env.VITE_API_URL || 'NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test 2: Config Files
console.log('\n2. Config Files:');
console.log('   env.ts API_URL:', config?.API_URL || 'NOT LOADED');
console.log('   constants.ts BASE_URL:', API_CONFIG?.BASE_URL || 'NOT LOADED');

// Test 3: API Endpoints
console.log('\n3. API Endpoints:');
console.log('   Jobs endpoint (env.ts):', API_ENDPOINTS?.JOBS || 'NOT SET');
console.log('   Jobs endpoint (constants.ts):', CONST_ENDPOINTS?.JOBS || 'NOT SET');

// Test 4: Test actual API calls
console.log('\n4. Testing API Connectivity:');

async function testAPI() {
    const testURL = 'http://ec2-3-110-178-223.ap-south-1.compute.amazonaws.com:5000/api/test';
    
    try {
        const response = await fetch(testURL);
        const data = await response.text();
        console.log('   ✅ Direct API test:', response.status, data);
    } catch (error) {
        console.log('   ❌ Direct API test failed:', error.message);
    }
    
    // Test with configured endpoints
    try {
        const configuredURL = API_ENDPOINTS?.BASE_URL + '/api/test' || testURL;
        const response = await fetch(configuredURL);
        const data = await response.text();
        console.log('   ✅ Configured API test:', response.status, data);
    } catch (error) {
        console.log('   ❌ Configured API test failed:', error.message);
    }
}

testAPI();