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
  companyLogo: {
    type: String,
    trim: true
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
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderationFlags: {
    isSpam: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    isFake: { type: Boolean, default: false },
    hasComplianceIssues: { type: Boolean, default: false }
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  postedBy: {
    type: String,
    default: 'Admin'
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employerEmail: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ jobTitle: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ salary: 1 });

export default mongoose.model('Job', jobSchema);