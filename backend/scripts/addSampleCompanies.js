import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const sampleCompanies = [
  {
    name: 'Google',
    domain: 'google.com',
    industry: 'Technology',
    location: 'Mountain View, CA',
    description: 'Search engine and technology company',
    website: 'https://google.com',
    employees: '1000+',
    followers: 15000000,
    rating: 4.5
  },
  {
    name: 'Microsoft',
    domain: 'microsoft.com',
    industry: 'Technology',
    location: 'Redmond, WA',
    description: 'Software and cloud computing company',
    website: 'https://microsoft.com',
    employees: '1000+',
    followers: 12000000,
    rating: 4.4
  },
  {
    name: 'Apple',
    domain: 'apple.com',
    industry: 'Technology',
    location: 'Cupertino, CA',
    description: 'Consumer electronics and software company',
    website: 'https://apple.com',
    employees: '1000+',
    followers: 18000000,
    rating: 4.6
  },
  {
    name: 'Amazon',
    domain: 'amazon.com',
    industry: 'E-commerce',
    location: 'Seattle, WA',
    description: 'E-commerce and cloud computing company',
    website: 'https://amazon.com',
    employees: '1000+',
    followers: 20000000,
    rating: 4.2
  },
  {
    name: 'Meta',
    domain: 'meta.com',
    industry: 'Social Media',
    location: 'Menlo Park, CA',
    description: 'Social media and virtual reality company',
    website: 'https://meta.com',
    employees: '1000+',
    followers: 8000000,
    rating: 4.1
  }
];

async function addSampleCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Company.deleteMany({});
    console.log('Cleared existing companies');

    await Company.insertMany(sampleCompanies);
    console.log('Added sample companies');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleCompanies();