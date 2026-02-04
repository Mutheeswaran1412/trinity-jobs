import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'jobportal',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectPostgreSQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');
    
    // Sync all models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    throw error;
  }
};

export { sequelize };
export default connectPostgreSQL;