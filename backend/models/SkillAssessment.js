import mongoose from 'mongoose';

const skillAssessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: Number,
    timeSpent: Number
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'in-progress', 'expired'], default: 'in-progress' },
  completedAt: Date,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }
}, { timestamps: true });

export default mongoose.model('SkillAssessment', skillAssessmentSchema);