import mongoose from 'mongoose';
import Company from './models/Company.js';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function clearCompanies() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Delete all companies
    const result = await Company.deleteMany({});
    console.log(`Deleted ${result.deletedCount} companies from database`);
    
    console.log('All companies cleared. Only real registered companies will show now.');
    
  } catch (error) {
    console.error('Error clearing companies:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

clearCompanies();