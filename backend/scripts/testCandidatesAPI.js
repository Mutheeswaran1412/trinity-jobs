import fetch from 'node-fetch';

const testCandidatesAPI = async () => {
  try {
    console.log('🔍 Testing candidates API...');
    
    const response = await fetch('http://localhost:5000/api/candidates');
    const candidates = await response.json();
    
    console.log(`\n📋 Found ${candidates.length} candidates:`);
    
    candidates.forEach((candidate, index) => {
      console.log(`\n--- Candidate ${index + 1} ---`);
      console.log(`ID: ${candidate._id}`);
      console.log(`Name: ${candidate.name || candidate.fullName}`);
      console.log(`Email: ${candidate.email}`);
      console.log(`Location: ${candidate.location}`);
      console.log(`Title: ${candidate.title}`);
      console.log(`Skills: ${JSON.stringify(candidate.skills)}`);
      console.log(`Experience: ${candidate.experience}`);
      console.log(`Salary: ${candidate.salary}`);
      console.log(`Rating: ${candidate.rating}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

testCandidatesAPI();