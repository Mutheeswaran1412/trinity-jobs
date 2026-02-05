import { DataTypes } from 'sequelize';
import { sequelize } from '../config/postgresql.js';

const UserSQL = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('candidate', 'employer', 'admin'),
    defaultValue: 'candidate'
  },
  phone: DataTypes.STRING,
  location: DataTypes.STRING,
  skills: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience: DataTypes.INTEGER,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  profilePicture: DataTypes.STRING,
  bio: DataTypes.TEXT,
  linkedinUrl: DataTypes.STRING,
  githubUrl: DataTypes.STRING,
  portfolioUrl: DataTypes.STRING
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['location'] },
    { fields: ['skills'] }
  ]
});

export default UserSQL;