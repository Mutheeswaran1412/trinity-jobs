import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(status, message) {
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

async function checkEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(url, { ...options, timeout: 5000 });
    const data = await response.json();
    
    if (response.ok) {
      log('pass', `${name}: Working ✓`);
      return { success: true, data };
    } else {
      log('fail', `${name}: Failed (${response.status})`);
      return { success: false, error: data };
    }
  } catch (error) {
    log('fail', `${name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runHealthCheck() {
  console.log(`\n${colors.blue}=== ZyncJobs Health Check ===${colors.reset}\n`);
  
  const results = {
    backend: false,
    database: false,
    auth: false,
    jobs: false,
    users: false,
    companies: false,
    chat: false,
    resume: false
  };

  // 1. Backend Server
  console.log(`${colors.yellow}1. Backend Server${colors.reset}`);
  const health = await checkEndpoint('Server Health', `${API_URL}/api/health`);
  results.backend = health.success;

  // 2. Database Connection
  console.log(`\n${colors.yellow}2. Database Connection${colors.reset}`);
  const db = await checkEndpoint('MongoDB Atlas', `${API_URL}/api/test`);
  results.database = db.success;

  // 3. Authentication
  console.log(`\n${colors.yellow}3. Authentication${colors.reset}`);
  const login = await checkEndpoint('Login Endpoint', `${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@candidate.com', password: '123456' })
  });
  results.auth = login.success;

  // 4. Jobs API
  console.log(`\n${colors.yellow}4. Jobs API${colors.reset}`);
  const jobs = await checkEndpoint('Get Jobs', `${API_URL}/api/jobs`);
  results.jobs = jobs.success;
  
  if (jobs.success && jobs.data.jobs) {
    log('pass', `Found ${jobs.data.jobs.length} jobs in database`);
  }

  // 5. Users API
  console.log(`\n${colors.yellow}5. Users API${colors.reset}`);
  const users = await checkEndpoint('Users Endpoint', `${API_URL}/api/users`);
  results.users = users.success;

  // 6. Companies API
  console.log(`\n${colors.yellow}6. Companies API${colors.reset}`);
  const companies = await checkEndpoint('Companies Endpoint', `${API_URL}/api/companies`);
  results.companies = companies.success;

  // 7. Chat/AI
  console.log(`\n${colors.yellow}7. AI Chat${colors.reset}`);
  const chat = await checkEndpoint('Chat Endpoint', `${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'hello' })
  });
  results.chat = chat.success;

  // 8. Resume Parser
  console.log(`\n${colors.yellow}8. Resume Parser${colors.reset}`);
  const resume = await checkEndpoint('Resume Parser Test', `${API_URL}/api/resume-parser/test`);
  results.resume = resume.success;

  // Summary
  console.log(`\n${colors.blue}=== Summary ===${colors.reset}\n`);
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(v => v).length;
  const failed = total - passed;

  console.log(`Total Tests: ${total}`);
  log('pass', `Passed: ${passed}`);
  if (failed > 0) log('fail', `Failed: ${failed}`);

  console.log(`\n${colors.blue}=== Detailed Status ===${colors.reset}\n`);
  Object.entries(results).forEach(([key, value]) => {
    const status = value ? 'pass' : 'fail';
    log(status, `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value ? 'Working' : 'Not Working'}`);
  });

  // Recommendations
  if (failed > 0) {
    console.log(`\n${colors.yellow}=== Recommendations ===${colors.reset}\n`);
    
    if (!results.backend) {
      console.log('• Start backend server: cd backend && npm start');
    }
    if (!results.database) {
      console.log('• Check MongoDB Atlas connection in backend/.env');
    }
    if (!results.auth) {
      console.log('• Check authentication routes in backend/server.js');
    }
    if (!results.jobs) {
      console.log('• Check jobs routes and database collections');
    }
  }

  console.log('\n');
  process.exit(failed > 0 ? 1 : 0);
}

runHealthCheck();
