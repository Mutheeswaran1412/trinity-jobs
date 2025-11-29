import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';

dotenv.config();

const sampleJobs = [
  {
    jobTitle: 'Full Stack Developer',
    company: 'Trinity Technologies',
    location: 'Hyderabad, India',
    jobType: 'Full-time',
    workSetting: 'Hybrid',
    salaryRange: '₹8-15 LPA',
    description: 'We are looking for a skilled Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: [
      '3+ years of experience in web development',
      'Proficiency in JavaScript, React, Node.js',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Knowledge of cloud platforms (AWS, Azure)',
      'Strong problem-solving skills'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Git'],
    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work', 'Learning Budget'],
    isActive: true,
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    jobTitle: 'Senior React Developer',
    company: 'Tech Innovations',
    location: 'Bangalore, India',
    jobType: 'Full-time',
    workSetting: 'Remote',
    salaryRange: '₹12-20 LPA',
    description: 'Join our frontend team as a Senior React Developer. You will lead the development of user interfaces and mentor junior developers.',
    requirements: [
      '5+ years of React development experience',
      'Expert knowledge of JavaScript, TypeScript',
      'Experience with state management (Redux, Context API)',
      'Knowledge of testing frameworks (Jest, React Testing Library)',
      'Leadership and mentoring experience'
    ],
    skills: ['React', 'TypeScript', 'Redux', 'Jest', 'HTML5', 'CSS3'],
    benefits: ['Stock Options', 'Health Insurance', 'Flexible Hours', 'Professional Development'],
    isActive: true,
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    jobTitle: 'Python Backend Developer',
    company: 'DataTech Solutions',
    location: 'Chennai, India',
    jobType: 'Full-time',
    workSetting: 'Hybrid',
    salaryRange: '₹10-18 LPA',
    description: 'We need a Python Backend Developer to build scalable APIs and microservices. Experience with Django/Flask and cloud technologies required.',
    requirements: [
      '4+ years of Python development experience',
      'Proficiency in Django or Flask',
      'Experience with REST APIs and microservices',
      'Knowledge of databases (PostgreSQL, MongoDB)',
      'Familiarity with Docker and Kubernetes'
    ],
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
    benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget', 'Team Outings'],
    isActive: true,
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  },
  {
    jobTitle: 'DevOps Engineer',
    company: 'CloudFirst Inc',
    location: 'Pune, India',
    jobType: 'Full-time',
    workSetting: 'Hybrid',
    salaryRange: '₹15-25 LPA',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. AWS and Kubernetes experience essential.',
    requirements: [
      '3+ years of DevOps experience',
      'Strong knowledge of AWS services',
      'Experience with Kubernetes and Docker',
      'Proficiency in Infrastructure as Code (Terraform)',
      'Knowledge of CI/CD tools (Jenkins, GitLab CI)'
    ],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Git', 'Linux'],
    benefits: ['Stock Options', 'Health Insurance', 'Flexible Hours', 'Certification Support'],
    isActive: true,
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
  },
  {
    jobTitle: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'Mumbai, India',
    jobType: 'Full-time',
    workSetting: 'Remote',
    salaryRange: '₹6-12 LPA',
    description: 'Join our startup as a Frontend Developer. You will work on building modern web applications using React and other cutting-edge technologies.',
    requirements: [
      '2+ years of frontend development experience',
      'Proficiency in React and JavaScript',
      'Knowledge of HTML5, CSS3, and responsive design',
      'Experience with version control (Git)',
      'Understanding of web performance optimization'
    ],
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Webpack'],
    benefits: ['Equity', 'Health Insurance', 'Flexible Hours', 'Learning Opportunities'],
    isActive: true,
    postedDate: new Date(),
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  }
];

async function addSampleJobs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Add sample jobs
    const result = await Job.insertMany(sampleJobs);
    console.log(`Added ${result.length} sample jobs`);

    console.log('Sample jobs added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample jobs:', error);
    process.exit(1);
  }
}

addSampleJobs();