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
  // Enhanced location fields for radius search
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  locationType: {
    type: String,
    required: [true, 'Location type is required'],
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'On-site'
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
  experience: {
    type: String,
    trim: true
  },
  experienceLevel: {
    type: String,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  // Enhanced fields for advanced search
  industry: {
    type: String,
    trim: true,
    enum: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Media', 'Government', 'Non-profit', 'Other']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    trim: true
  },
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date
  },
  // Tracking fields
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  trending: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
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
  },
  // New fields for recruitment agency functionality
  employerCompany: {
    type: String,
    trim: true // The actual company of the person posting (e.g., Trinity Technology)
  },
  postedFor: {
    type: String,
    trim: true // The company the job is posted for (e.g., Google)
  },
  isThirdPartyPosting: {
    type: Boolean,
    default: false // True if posting for a different company
  }
}, {
  timestamps: true
});

// Indexes for better query performance
jobSchema.index({ jobTitle: 'text', company: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1, jobType: 1 });
jobSchema.index({ coordinates: '2dsphere' }); // For location-based queries
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ employerId: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ industry: 1 });
jobSchema.index({ companySize: 1 });
jobSchema.index({ trending: 1, views: -1 });
jobSchema.index({ featured: 1, createdAt: -1 });

export default mongoose.model('Job', jobSchema);