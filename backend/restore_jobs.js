import mongoose from 'mongoose';
import Job from './models/Job.js';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function restoreJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check current job count
    const currentJobs = await Job.countDocuments();
    console.log(`Current jobs in database: ${currentJobs}`);
    
    if (currentJobs === 0) {
      console.log('Adding sample jobs...');
      
      const sampleJobs = [
        {
          title: "Senior Software Engineer",
          company: "TechCorp",
          location: "San Francisco, CA",
          type: "Full-time",
          salary: "$120,000 - $160,000",
          description: "We are looking for a Senior Software Engineer to join our team...",
          requirements: "5+ years experience, React, Node.js, MongoDB",
          isActive: true,
          status: "approved"
        },
        {
          title: "Frontend Developer",
          company: "StartupXYZ",
          location: "New York, NY",
          type: "Full-time",
          salary: "$80,000 - $120,000",
          description: "Join our frontend team to build amazing user experiences...",
          requirements: "3+ years experience, React, TypeScript, CSS",
          isActive: true,
          status: "approved"
        },
        {
          title: "Data Scientist",
          company: "DataTech",
          location: "Austin, TX",
          type: "Full-time",
          salary: "$100,000 - $140,000",
          description: "Analyze data and build machine learning models...",
          requirements: "Python, SQL, Machine Learning, Statistics",
          isActive: true,
          status: "approved"
        },
        {
          title: "DevOps Engineer",
          company: "CloudSolutions",
          location: "Seattle, WA",
          type: "Full-time",
          salary: "$110,000 - $150,000",
          description: "Manage cloud infrastructure and deployment pipelines...",
          requirements: "AWS, Docker, Kubernetes, CI/CD",
          isActive: true,
          status: "approved"
        },
        {
          title: "Product Manager",
          company: "InnovateCorp",
          location: "Los Angeles, CA",
          type: "Full-time",
          salary: "$130,000 - $170,000",
          description: "Lead product strategy and development...",
          requirements: "5+ years PM experience, Agile, Analytics",
          isActive: true,
          status: "approved"
        }
      ];
      
      await Job.insertMany(sampleJobs);
      console.log(`Added ${sampleJobs.length} sample jobs`);
    }
    
    const finalCount = await Job.countDocuments();
    console.log(`Total jobs now: ${finalCount}`);
    
  } catch (error) {
    console.error('Error restoring jobs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

restoreJobs();