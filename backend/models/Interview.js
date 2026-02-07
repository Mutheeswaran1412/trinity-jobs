import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  
  // Store emails as backup
  candidateEmail: { type: String, required: true },
  candidateName: String,
  employerEmail: String,
  
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  type: { type: String, enum: ['phone', 'video', 'in-person'], default: 'video' },
  
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed'], 
    default: 'scheduled' 
  },
  
  meetingLink: String,
  location: String,
  notes: String,
  
  candidateConfirmed: { type: Boolean, default: false },
  employerConfirmed: { type: Boolean, default: false },
  
  remindersSent: [{
    type: { type: String, enum: ['24h', '1h', '15m'] },
    sentAt: Date
  }],
  
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String,
    decision: { type: String, enum: ['hire', 'reject', 'next-round'] },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date
  }
}, { timestamps: true });

export default mongoose.model('Interview', interviewSchema);