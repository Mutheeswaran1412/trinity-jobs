// Test EC2 to Cloudflare Domain Connection
import https from 'https';
import http from 'http';
import dns from 'dns';

const CLOUDFLARE_DOMAIN = 'https://api-staging.zyncjobs.com';
const EC2_ENDPOINT = 'http://3.110.178.223:5000';

async function testConnection(url, name) {
    return new Promise((resolve) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;
        
        console.log(`\n🔍 Testing ${name}: ${url}`);
        
        const req = client.get(`${url}/api/test`, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`✅ ${name} - Status: ${res.statusCode}`);
                console.log(`   Response: ${data}`);
                resolve({ success: true, status: res.statusCode, data });
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${name} - Error: ${error.message}`);
            resolve({ success: false, error: error.message });
        });
        
        req.on('timeout', () => {
            console.log(`⏰ ${name} - Timeout`);
            req.destroy();
            resolve({ success: false, error: 'Timeout' });
        });
    });
}

async function testDNSResolution() {
    return new Promise((resolve) => {
        console.log('\n🌐 Testing DNS Resolution for api-staging.zyncjobs.com');
        dns.lookup('api-staging.zyncjobs.com', (err, address) => {
            if (err) {
                console.log(`❌ DNS Error: ${err.message}`);
                resolve({ success: false, error: err.message });
            } else {
                console.log(`✅ DNS Resolved to: ${address}`);
                resolve({ success: true, address });
            }
        });
    });
}

async function runTests() {
    console.log('=== EC2 to Cloudflare Connection Test ===');
    
    // Test DNS resolution
    await testDNSResolution();
    
    // Test direct EC2 connection
    await testConnection(EC2_ENDPOINT, 'Direct EC2');
    
    // Test Cloudflare domain
    await testConnection(CLOUDFLARE_DOMAIN, 'Cloudflare Domain');
    
    console.log('\n=== Test Complete ===');
}

runTests().catch(console.error);