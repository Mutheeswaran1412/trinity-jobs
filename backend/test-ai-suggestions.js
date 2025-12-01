import mistralService from './services/mistralService.js';

async function testAISuggestions() {
  console.log('🧪 Testing AI Suggestions...\n');

  try {
    // Test job title suggestions
    console.log('1. Testing Job Title Suggestions:');
    const jobTitles = await mistralService.generateJobTitleSuggestions('account');
    console.log('Input: "account"');
    console.log('Suggestions:', jobTitles);
    console.log('');

    // Test location suggestions
    console.log('2. Testing Location Suggestions:');
    const locations = await mistralService.generateLocationSuggestions('chen');
    console.log('Input: "chen"');
    console.log('Suggestions:', locations);
    console.log('');

    // Test skill suggestions
    console.log('3. Testing Skill Suggestions:');
    const skills = await mistralService.generateSkillSuggestions('py');
    console.log('Input: "py"');
    console.log('Suggestions:', skills);
    console.log('');

    // Test job description generation
    console.log('4. Testing Job Description Generation:');
    const description = await mistralService.generateJobDescription('Software Engineer', 'Trinity Technologies', 'Chennai');
    console.log('Job Title: Software Engineer');
    console.log('Company: Trinity Technologies');
    console.log('Location: Chennai');
    console.log('Description:', description.substring(0, 200) + '...');
    console.log('');

    console.log('✅ All AI suggestion tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAISuggestions();