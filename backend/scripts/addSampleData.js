import mongoose from 'mongoose';
import Job from '../models/Job.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleJobs = [
  {
    jobTitle: 'Senior React Developer',
    company: 'TechCorp Inc',
    location: 'San Francisco, CA',
    coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    jobType: 'Full-time',
    locationType: 'Remote',
    industry: 'Technology',
    companySize: '201-500',
    description: 'We are looking for a Senior React Developer to join our team.',
    requirements: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    salary: { min: 120000, max: 160000 },
    employerEmail: 'hr@techcorp.com',
    status: 'approved',
    isActive: true,
    views: 150,
    applications: 25,
    trending: true,
    featured: true,
    createdAt: new Date()
  },
  {
    jobTitle: 'Python Backend Developer',
    company: 'DataFlow Solutions',
    location: 'New York, NY',
    coordinates: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    jobType: 'Full-time',
    locationType: 'Hybrid',
    industry: 'Technology',
    companySize: '51-200',
    description: 'Join our backend team to build scalable Python applications.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    salary: { min: 100000, max: 140000 },
    employerEmail: 'careers@dataflow.com',
    status: 'approved',
    isActive: true,
    views: 120,
    applications: 18,
    trending: true,
    createdAt: new Date()
  },
  {
    jobTitle: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    coordinates: { type: 'Point', coordinates: [-97.7431, 30.2672] },
    jobType: 'Full-time',
    locationType: 'On-site',
    industry: 'Technology',
    companySize: '11-50',
    description: 'Looking for a versatile full stack engineer to work on our product.',
    requirements: ['React', 'Node.js', 'MongoDB', 'Express'],
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    salary: { min: 90000, max: 120000 },
    employerEmail: 'jobs@startupxyz.com',
    status: 'approved',
    isActive: true,
    views: 80,
    applications: 12,
    createdAt: new Date()
  },
  {
    jobTitle: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    coordinates: { type: 'Point', coordinates: [-122.3321, 47.6062] },
    jobType: 'Full-time',
    locationType: 'Remote',
    industry: 'Technology',
    companySize: '1000+',
    description: 'DevOps engineer to manage our cloud infrastructure.',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
    salary: { min: 130000, max: 170000 },
    employerEmail: 'hr@cloudtech.com',
    status: 'approved',
    isActive: true,
    views: 200,
    applications: 30,
    trending: true,
    featured: true,
    createdAt: new Date()
  },
  {
    jobTitle: 'UI/UX Designer',
    company: 'DesignStudio',
    location: 'Los Angeles, CA',
    coordinates: { type: 'Point', coordinates: [-118.2437, 34.0522] },
    jobType: 'Contract',
    locationType: 'Hybrid',
    industry: 'Media',
    companySize: '11-50',
    description: 'Creative UI/UX designer for mobile and web applications.',
    requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping'],
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
    salary: { min: 80000, max: 110000 },
    employerEmail: 'hello@designstudio.com',
    status: 'approved',
    isActive: true,
    views: 95,
    applications: 15,
    createdAt: new Date()
  }
];

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Add sample jobs
    await Job.insertMany(sampleJobs);
    console.log('Added sample jobs');

    console.log('Sample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();