import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [50, 'Company name cannot exceed 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  salary: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ jobTitle: 'text', company: 'text', description: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model('Job', jobSchema);