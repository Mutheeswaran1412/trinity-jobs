import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresql.js';

const JobSQL = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jobType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT
  },
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  salaryMin: {
    type: DataTypes.INTEGER
  },
  salaryMax: {
    type: DataTypes.INTEGER
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD'
  },
  experienceLevel: {
    type: DataTypes.ENUM('Entry', 'Mid', 'Senior', 'Lead'),
    defaultValue: 'Mid'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  employerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  applicationDeadline: {
    type: DataTypes.DATE
  },
  jobCode: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    { fields: ['jobTitle'] },
    { fields: ['company'] },
    { fields: ['location'] },
    { fields: ['jobType'] },
    { fields: ['status'] },
    { fields: ['employerEmail'] },
    { fields: ['isActive'] },
    { fields: ['createdAt'] }
  ]
});

export default JobSQL;