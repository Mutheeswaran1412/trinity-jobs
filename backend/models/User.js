import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minlength: [6, 'Password must be at least 6 characters']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['candidate', 'employer', 'admin', 'moderator', 'jobseeker']
  },
  role: {
    type: String,
    enum: ['candidate', 'employer', 'admin', 'moderator', 'jobseeker'],
    default: function() { return this.userType; }
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  companyLogo: {
    type: String,
    trim: true
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Not Available', 'Available in 2 weeks', 'Available in 1 month'],
    default: 'Available'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    skills: [String],
    experience: Number,
    resume: String,
    bio: String
  },
  savedJobs: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Job',
    default: []
  },
  appliedJobs: {
    type: [{
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
      appliedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'interviewed', 'hired'], default: 'pending' },
      shortlistedAt: { type: Date },
      employerNotes: { type: String },
      updatedAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  refreshTokens: [{
    token: String,
    tokenId: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
  }],
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpiry: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ userType: 1 });
userSchema.index({ status: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'refreshTokens.tokenId': 1 });
userSchema.index({ 'refreshTokens.expiresAt': 1 }, { expireAfterSeconds: 0 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ resetPasswordExpiry: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('User', userSchema);