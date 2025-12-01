import mongoose from 'mongoose';
import dotenv from 'dotenv';
import resumeParserService from './services/resumeParserService.js';

dotenv.config();

async function testResumeParser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mock resume data
    const mockResume = {
      text: `John Doe
             Software Developer
             john.doe@email.com
             +1 (555) 123-4567
             
             SKILLS
             JavaScript, React, Node.js, Python, MongoDB, AWS, Docker, Git
             
             EXPERIENCE
             Full Stack Developer at Tech Corp
             - Developed web applications using React and Node.js
             - Worked with MongoDB and PostgreSQL databases
             - Deployed applications on AWS cloud platform`
    };

    console.log('Testing skill extraction...');
    const skills = resumeParserService.extractSkills(mockResume.text);
    console.log('Extracted skills:', skills);

    console.log('\nTesting job matching...');
    const jobMatches = await resumeParserService.matchJobsToResume(mockResume);
    console.log(`Found ${jobMatches.matchCount} matching jobs`);
    
    jobMatches.matchingJobs.forEach((job, index) => {
      const score = resumeParserService.calculateMatchScore(job, jobMatches.extractedSkills);
      console.log(`\n${index + 1}. ${job.jobTitle} at ${job.company}`);
      console.log(`   Match Score: ${score}%`);
      console.log(`   Skills: ${job.skills?.join(', ') || 'N/A'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testResumeParser();