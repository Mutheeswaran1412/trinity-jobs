import mongoose from 'mongoose';
import Job from './models/Job.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://Jopportal:Jopportal_Trinity2025@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0';

async function restoreTrinitechJobs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find trinitetech user
    const trinitechUser = await User.findOne({ 
      email: 'muthees@trinitetech.com' 
    });
    
    if (!trinitechUser) {
      console.log('Trinitetech user not found');
      return;
    }
    
    console.log('Found trinitetech user:', trinitechUser.email);
    
    // Clear existing jobs and add proper ones
    await Job.deleteMany({});
    console.log('Cleared existing jobs');
    
    const trinitechJobs = [
      {
        jobTitle: "Senior Software Engineer",
        company: "Trinity Technology Solutions",
        location: "Chennai, India",
        jobType: "Full-time",
        salary: { min: 800000, max: 1500000, currency: "INR", period: "yearly" },
        description: "We are looking for a Senior Software Engineer to join our growing team at Trinity Technology Solutions. You will work on cutting-edge projects and help build scalable web applications.",
        requirements: ["5+ years experience", "React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
        skills: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
        employerEmail: "muthees@trinitetech.com",
        employerId: trinitechUser._id,
        postedBy: trinitechUser._id,
        isActive: true,
        status: "approved"
      },
      {
        jobTitle: "Frontend Developer",
        company: "Trinity Technology Solutions", 
        location: "Chennai, India",
        jobType: "Full-time",
        salary: { min: 500000, max: 1000000, currency: "INR", period: "yearly" },
        description: "Join our frontend team to create amazing user experiences. Work with modern technologies and contribute to innovative projects.",
        requirements: ["3+ years experience", "React", "JavaScript", "CSS", "HTML", "responsive design"],
        skills: ["React", "JavaScript", "CSS", "HTML"],
        employerEmail: "muthees@trinitetech.com",
        employerId: trinitechUser._id,
        postedBy: trinitechUser._id,
        isActive: true,
        status: "approved"
      },
      {
        jobTitle: "Full Stack Developer",
        company: "Trinity Technology Solutions",
        location: "Chennai, India", 
        jobType: "Full-time",
        salary: { min: 600000, max: 1200000, currency: "INR", period: "yearly" },
        description: "Looking for a versatile Full Stack Developer to work on both frontend and backend development. Great opportunity for career growth.",
        requirements: ["4+ years experience", "MERN stack", "React", "Node.js", "Express", "MongoDB"],
        skills: ["React", "Node.js", "Express", "MongoDB", "MERN"],
        employerEmail: "muthees@trinitetech.com",
        employerId: trinitechUser._id,
        postedBy: trinitechUser._id,
        isActive: true,
        status: "approved"
      },
      {
        jobTitle: "React Developer",
        company: "Trinity Technology Solutions",
        location: "Chennai, India",
        jobType: "Full-time", 
        salary: { min: 450000, max: 900000, currency: "INR", period: "yearly" },
        description: "Seeking a skilled React Developer to build dynamic and responsive web applications. Work in a collaborative environment with latest technologies.",
        requirements: ["2+ years experience", "React", "Redux", "JavaScript", "Git", "Agile methodology"],
        skills: ["React", "Redux", "JavaScript", "Git"],
        employerEmail: "muthees@trinitetech.com",
        employerId: trinitechUser._id,
        postedBy: trinitechUser._id,
        isActive: true,
        status: "approved"
      },
      {
        jobTitle: "Backend Developer",
        company: "Trinity Technology Solutions",
        location: "Chennai, India",
        jobType: "Full-time",
        salary: { min: 550000, max: 1100000, currency: "INR", period: "yearly" }, 
        description: "Join our backend team to develop robust APIs and server-side applications. Work with modern backend technologies and databases.",
        requirements: ["3+ years experience", "Node.js", "Express", "MongoDB", "REST APIs", "microservices"],
        skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
        employerEmail: "muthees@trinitetech.com",
        employerId: trinitechUser._id,
        postedBy: trinitechUser._id,
        isActive: true,
        status: "approved"
      }
    ];
    
    await Job.insertMany(trinitechJobs);
    console.log(`Added ${trinitechJobs.length} Trinity Technology Solutions jobs`);
    
    const finalCount = await Job.countDocuments();
    console.log(`Total jobs now: ${finalCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

restoreTrinitechJobs();