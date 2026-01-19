import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const addTestData = async () => {
  try {
    await connectDB();
    
    console.log('Adding test jobs for Mutheeswaran...');
    
    // Sample jobs for Mutheeswaran
    const testJobs = [
      {
        jobTitle: 'Senior React Developer',
        company: 'TrinityTech',
        location: 'Remote',
        jobType: 'Full-time',
        salary: {
          min: 80000,
          max: 120000,
          currency: 'USD',
          period: 'yearly'
        },
        description: 'We are looking for a Senior React Developer to join our team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
        requirements: [
          '5+ years of experience with React.js',
          'Strong proficiency in JavaScript',
          'Experience with Redux or Context API',
          'Knowledge of RESTful APIs'
        ],
        skills: ['React', 'JavaScript', 'Redux', 'HTML', 'CSS'],
        status: 'approved',
        isActive: true,
        postedBy: 'Mutheeswaran',
        employerEmail: 'mutheeswaran124@gmail.com',
        employerCompany: 'TrinityTech'
      },
      {
        jobTitle: 'Full Stack Developer',
        company: 'TrinityTech',
        location: 'Chennai, India',
        jobType: 'Full-time',
        salary: {
          min: 60000,
          max: 90000,
          currency: 'USD',
          period: 'yearly'
        },
        description: 'Join our team as a Full Stack Developer. You will work on both frontend and backend development using modern technologies.',
        requirements: [
          '3+ years of full-stack development experience',
          'Proficiency in Node.js and React',
          'Experience with MongoDB or PostgreSQL',
          'Knowledge of cloud platforms'
        ],
        skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript'],
        status: 'approved',
        isActive: true,
        postedBy: 'Mutheeswaran',
        employerEmail: 'mutheeswaran124@gmail.com',
        employerCompany: 'TrinityTech'
      },
      {
        jobTitle: 'DevOps Engineer',
        company: 'TrinityTech',
        location: 'Bangalore, India',
        jobType: 'Full-time',
        salary: {
          min: 70000,
          max: 100000,
          currency: 'USD',
          period: 'yearly'
        },
        description: 'We need a DevOps Engineer to help us streamline our deployment processes and maintain our cloud infrastructure.',
        requirements: [
          '4+ years of DevOps experience',
          'Experience with AWS or Azure',
          'Knowledge of Docker and Kubernetes',
          'CI/CD pipeline experience'
        ],
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
        status: 'approved',
        isActive: true,
        postedBy: 'Mutheeswaran',
        employerEmail: 'mutheeswaran124@gmail.com',
        employerCompany: 'TrinityTech'
      }
    ];
    
    // Clear existing jobs for this user first
    await Job.deleteMany({ 
      $or: [
        { postedBy: 'Mutheeswaran' },
        { employerEmail: 'mutheeswaran124@gmail.com' }
      ]
    });
    
    // Insert new test jobs
    const insertedJobs = await Job.insertMany(testJobs);
    console.log(`✅ Added ${insertedJobs.length} test jobs`);
    
    // Add some sample applications
    console.log('Adding test applications...');
    
    const testApplications = [
      {
        jobId: insertedJobs[0]._id,
        candidateName: 'John Doe',
        candidateEmail: 'john.doe@example.com',
        coverLetter: 'I am very interested in this React Developer position and believe my 6 years of experience makes me a great fit.',
        status: 'pending',
        employerEmail: 'mutheeswaran124@gmail.com'
      },
      {
        jobId: insertedJobs[1]._id,
        candidateName: 'Jane Smith',
        candidateEmail: 'jane.smith@example.com',
        coverLetter: 'I have extensive full-stack development experience and would love to contribute to your team.',
        status: 'reviewed',
        employerEmail: 'mutheeswaran124@gmail.com'
      },
      {
        jobId: insertedJobs[0]._id,
        candidateName: 'Mike Johnson',
        candidateEmail: 'mike.johnson@example.com',
        coverLetter: 'React has been my primary technology for the past 4 years. I am excited about this opportunity.',
        status: 'shortlisted',
        employerEmail: 'mutheeswaran124@gmail.com'
      }
    ];
    
    // Clear existing applications for this user first
    await Application.deleteMany({ employerEmail: 'mutheeswaran124@gmail.com' });
    
    // Insert new test applications
    const insertedApps = await Application.insertMany(testApplications);
    console.log(`✅ Added ${insertedApps.length} test applications`);
    
    console.log('✅ Test data added successfully!');
    console.log('Dashboard should now show:');
    console.log(`- ${insertedJobs.length} active jobs`);
    console.log(`- ${insertedApps.length} applications`);
    console.log('- Recent activity from jobs and applications');
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addTestData();