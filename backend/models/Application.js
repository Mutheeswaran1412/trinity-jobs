import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  candidatePhone: String,
  coverLetter: String,
  status: {
    type: String,
    default: 'pending'
  }
}, {
  timestamps: true,
  strict: false
});

applicationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ status: 1 });

export default mongoose.model('Application', applicationSchema);
