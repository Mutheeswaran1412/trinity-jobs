import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './models/Company.js';

dotenv.config();

const companies = [
  {
    name: 'Trinity Technologies',
    industry: 'Information Technology',
    location: 'Hyderabad, India',
    description: 'Leading technology solutions provider',
    website: 'https://trinity-tech.com',
    employees: '201-1000',
    workSetting: 'Hybrid',
    isHiring: true,
    rating: 4.2
  },
  {
    name: 'Infosys',
    industry: 'Information Technology',
    location: 'Bangalore, India',
    description: 'Global leader in next-generation digital services',
    website: 'https://infosys.com',
    employees: '1000+',
    workSetting: 'Hybrid',
    isHiring: true,
    rating: 4.1
  },
  {
    name: 'TCS',
    industry: 'Information Technology',
    location: 'Mumbai, India',
    description: 'IT services, consulting and business solutions',
    website: 'https://tcs.com',
    employees: '1000+',
    workSetting: 'Hybrid',
    isHiring: true,
    rating: 4.0
  },
  {
    name: 'Wipro',
    industry: 'Information Technology',
    location: 'Bangalore, India',
    description: 'Global information technology company',
    website: 'https://wipro.com',
    employees: '1000+',
    workSetting: 'Remote',
    isHiring: true,
    rating: 3.9
  }
];

async function addCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing companies
    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Add new companies
    const result = await Company.insertMany(companies);
    console.log(`Added ${result.length} companies`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCompanies();