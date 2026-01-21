import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['candidate', 'employer', 'admin'], default: 'candidate' },
  phone: String,
  company: String,
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' }
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  salary: mongoose.Schema.Types.Mixed,
  jobDescription: { type: String, required: true },
  requirements: [String],
  skills: [String],
  employerEmail: { type: String, required: true },
  postedBy: String,
  isActive: { type: Boolean, default: true },
  experience: String,
  benefits: [String]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Job = mongoose.model('Job', jobSchema);

async function restoreData() {
  try {
    await mongoose.connect('mongodb+srv://Jopportal:Trinity123@cluster0.aoubgsj.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create sample users
    const hashedPassword = await bcrypt.hash('Trinity123', 8);
    
    const users = [
      {
        name: 'Mutheeswaran',
        email: 'mutheeswaran128@gmail.com',
        password: hashedPassword,
        userType: 'candidate',
        phone: '+91 9876543210'
      },
      {
        name: 'John Employer',
        email: 'employer@trinity.com',
        password: hashedPassword,
        userType: 'employer',
        company: 'Trinity Technology Solutions LLC',
        phone: '+91 9876543211'
      },
      {
        name: 'Sarah Manager',
        email: 'sarah@google.com',
        password: hashedPassword,
        userType: 'employer',
        company: 'Google',
        phone: '+91 9876543212'
      },
      {
        name: 'Mike Recruiter',
        email: 'mike@microsoft.com',
        password: hashedPassword,
        userType: 'employer',
        company: 'Microsoft',
        phone: '+91 9876543213'
      }
    ];

    await User.insertMany(users);
    console.log('👥 Created sample users');

    // Create sample jobs
    const jobs = [
      {
        jobTitle: 'Senior React Developer',
        company: 'Trinity Technology Solutions LLC',
        location: 'Chennai, India',
        type: 'Full-time',
        salary: { min: 800000, max: 1200000, currency: '₹', period: 'per year' },
        jobDescription: 'We are looking for a skilled React Developer to join our dynamic team. You will be responsible for developing user interface components and implementing them following well-known React.js workflows.',
        requirements: [
          '3+ years of experience with React.js',
          'Strong proficiency in JavaScript, HTML, CSS',
          'Experience with Redux or Context API',
          'Knowledge of RESTful APIs',
          'Bachelor\'s degree in Computer Science'
        ],
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux', 'Node.js'],
        employerEmail: 'employer@trinity.com',
        postedBy: 'John Employer',
        experience: '3-5 years',
        benefits: [
          'Competitive salary package',
          'Health insurance',
          'Flexible working hours',
          'Professional development opportunities'
        ]
      },
      {
        jobTitle: 'Full Stack Developer',
        company: 'Google',
        location: 'Bangalore, India',
        type: 'Full-time',
        salary: { min: 1500000, max: 2500000, currency: '₹', period: 'per year' },
        jobDescription: 'Join Google as a Full Stack Developer and work on cutting-edge technologies. You will be responsible for both front-end and back-end development.',
        requirements: [
          '5+ years of full-stack development experience',
          'Proficiency in JavaScript, Python, or Java',
          'Experience with cloud platforms (GCP preferred)',
          'Strong problem-solving skills',
          'Master\'s degree preferred'
        ],
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'GCP', 'Docker'],
        employerEmail: 'sarah@google.com',
        postedBy: 'Sarah Manager',
        experience: '5+ years',
        benefits: [
          'Excellent compensation package',
          'Stock options',
          'World-class benefits',
          'Learning and development budget'
        ]
      },
      {
        jobTitle: 'Software Engineer',
        company: 'Microsoft',
        location: 'Hyderabad, India',
        type: 'Full-time',
        salary: { min: 1200000, max: 1800000, currency: '₹', period: 'per year' },
        jobDescription: 'Microsoft is seeking a talented Software Engineer to join our team. You will work on innovative projects and contribute to products used by millions worldwide.',
        requirements: [
          '2+ years of software development experience',
          'Proficiency in C#, .NET, or similar technologies',
          'Experience with Azure cloud services',
          'Strong analytical and problem-solving skills',
          'Bachelor\'s degree in Engineering or Computer Science'
        ],
        skills: ['C#', '.NET', 'Azure', 'SQL Server', 'JavaScript', 'React'],
        employerEmail: 'mike@microsoft.com',
        postedBy: 'Mike Recruiter',
        experience: '2-4 years',
        benefits: [
          'Competitive salary and bonuses',
          'Comprehensive health benefits',
          'Retirement savings plan',
          'Professional development opportunities'
        ]
      },
      {
        jobTitle: 'Frontend Developer',
        company: 'Trinity Technology Solutions LLC',
        location: 'Remote',
        type: 'Contract',
        salary: { min: 50000, max: 80000, currency: '₹', period: 'per month' },
        jobDescription: 'We are looking for a creative Frontend Developer to join our team on a contract basis. You will be responsible for creating engaging user interfaces.',
        requirements: [
          '2+ years of frontend development experience',
          'Strong skills in HTML, CSS, JavaScript',
          'Experience with modern frameworks (React, Vue, or Angular)',
          'Understanding of responsive design',
          'Portfolio of previous work'
        ],
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Sass'],
        employerEmail: 'employer@trinity.com',
        postedBy: 'John Employer',
        experience: '2-3 years',
        benefits: [
          'Flexible working hours',
          'Remote work opportunity',
          'Competitive hourly rates',
          'Opportunity for full-time conversion'
        ]
      },
      {
        jobTitle: 'DevOps Engineer',
        company: 'Google',
        location: 'Mumbai, India',
        type: 'Full-time',
        salary: { min: 1800000, max: 2800000, currency: '₹', period: 'per year' },
        jobDescription: 'Join Google\'s DevOps team and help build and maintain scalable infrastructure. You will work with cutting-edge technologies and best practices.',
        requirements: [
          '4+ years of DevOps experience',
          'Strong knowledge of Kubernetes and Docker',
          'Experience with CI/CD pipelines',
          'Proficiency in scripting languages (Python, Bash)',
          'Experience with cloud platforms (GCP, AWS, Azure)'
        ],
        skills: ['Kubernetes', 'Docker', 'GCP', 'Python', 'Terraform', 'Jenkins'],
        employerEmail: 'sarah@google.com',
        postedBy: 'Sarah Manager',
        experience: '4-6 years',
        benefits: [
          'Top-tier compensation',
          'Stock options',
          'Comprehensive benefits package',
          'Learning and development opportunities'
        ]
      }
    ];

    await Job.insertMany(jobs);
    console.log('💼 Created sample jobs');

    console.log('\n✅ Database restored successfully!');
    console.log('\n👤 Sample Users Created:');
    console.log('📧 Candidate: mutheeswaran128@gmail.com (password: Trinity123)');
    console.log('📧 Employer: employer@trinity.com (password: Trinity123)');
    console.log('📧 Google HR: sarah@google.com (password: Trinity123)');
    console.log('📧 Microsoft HR: mike@microsoft.com (password: Trinity123)');
    console.log('\n💼 Sample Jobs Created: 5 jobs from different companies');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restoreData();