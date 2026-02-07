import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const sampleCandidates = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    userType: 'candidate',
    phone: '+1-555-0101',
    location: 'San Francisco, CA',
    profile: {
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'MongoDB'],
      experience: 4,
      bio: 'Full-stack developer with 4+ years of experience building scalable web applications.'
    },
    title: 'Senior Full Stack Developer',
    salary: '$120,000 - $140,000',
    availability: 'Available',
    rating: 4.8
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    userType: 'candidate',
    phone: '+1-555-0102',
    location: 'Seattle, WA',
    profile: {
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
      experience: 6,
      bio: 'Backend engineer specializing in scalable microservices and cloud architecture.'
    },
    title: 'Senior Backend Engineer',
    salary: '$130,000 - $150,000',
    availability: 'Available',
    rating: 4.9
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    userType: 'candidate',
    phone: '+1-555-0103',
    location: 'New York, NY',
    profile: {
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch', 'SQL'],
      experience: 3,
      bio: 'Data scientist with expertise in ML model development and deployment.'
    },
    title: 'Data Scientist',
    salary: '$110,000 - $130,000',
    availability: 'Available',
    rating: 4.7
  },
  {
    name: 'David Kim',
    email: 'david.kim@email.com',
    userType: 'candidate',
    phone: '+1-555-0104',
    location: 'Austin, TX',
    profile: {
      skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma', 'UX Design'],
      experience: 5,
      bio: 'Frontend developer with strong design skills and user experience focus.'
    },
    title: 'Senior Frontend Developer',
    salary: '$100,000 - $120,000',
    availability: 'Available',
    rating: 4.6
  },
  {
    name: 'Jessica Thompson',
    email: 'jessica.thompson@email.com',
    userType: 'candidate',
    phone: '+1-555-0105',
    location: 'Remote',
    profile: {
      skills: ['DevOps', 'AWS', 'Terraform', 'Jenkins', 'Monitoring'],
      experience: 7,
      bio: 'DevOps engineer with extensive experience in cloud infrastructure and automation.'
    },
    title: 'Senior DevOps Engineer',
    salary: '$140,000 - $160,000',
    availability: 'Available',
    rating: 4.9
  },
  {
    name: 'Alex Martinez',
    email: 'alex.martinez@email.com',
    userType: 'candidate',
    phone: '+1-555-0106',
    location: 'Los Angeles, CA',
    profile: {
      skills: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'GraphQL'],
      experience: 4,
      bio: 'Mobile developer with expertise in cross-platform and native app development.'
    },
    title: 'Mobile App Developer',
    salary: '$105,000 - $125,000',
    availability: 'Available',
    rating: 4.5
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    userType: 'candidate',
    phone: '+1-555-0107',
    location: 'Chicago, IL',
    profile: {
      skills: ['Cybersecurity', 'Penetration Testing', 'CISSP', 'Network Security'],
      experience: 8,
      bio: 'Cybersecurity specialist with extensive experience in threat assessment and security auditing.'
    },
    title: 'Senior Security Engineer',
    salary: '$150,000 - $170,000',
    availability: 'Available',
    rating: 4.8
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    userType: 'candidate',
    phone: '+1-555-0108',
    location: 'Boston, MA',
    profile: {
      skills: ['Java', 'Spring Boot', 'Microservices', 'Apache Kafka', 'Redis'],
      experience: 6,
      bio: 'Java developer with strong background in enterprise applications and distributed systems.'
    },
    title: 'Senior Java Developer',
    salary: '$125,000 - $145,000',
    availability: 'Available',
    rating: 4.7
  }
];

async function addSampleCandidates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('candidate123', 10);

    for (const candidateData of sampleCandidates) {
      const existing = await User.findOne({ email: candidateData.email });
      if (existing) {
        console.log(`Candidate ${candidateData.email} already exists, updating...`);
        await User.updateOne({ email: candidateData.email }, {
          ...candidateData,
          password: hashedPassword
        });
      } else {
        await User.create({
          ...candidateData,
          password: hashedPassword
        });
        console.log(`Created candidate: ${candidateData.name} (${candidateData.email})`);
      }
    }

    console.log('\n✅ Sample candidates added successfully!');
    console.log('\nCandidate login credentials (password for all: candidate123):');
    sampleCandidates.forEach(candidate => {
      console.log(`- ${candidate.email} (${candidate.name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleCandidates();