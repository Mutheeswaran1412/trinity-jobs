import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  filePath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationFlags: {
    hasSpam: { type: Boolean, default: false },
    hasInappropriateContent: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },
    isFake: { type: Boolean, default: false },
    profileMismatch: { type: Boolean, default: false }
  },
  extractedText: {
    type: String
  },
  extractedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: String
  },
  moderationNotes: {
    type: String
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

resumeSchema.index({ userId: 1 });
resumeSchema.index({ status: 1 });
resumeSchema.index({ createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);