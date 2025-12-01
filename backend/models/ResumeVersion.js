import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

resumeVersionSchema.index({ userId: 1, resumeId: 1, version: 1 });

export default mongoose.model('ResumeVersion', resumeVersionSchema);