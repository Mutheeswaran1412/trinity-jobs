# PostgreSQL Setup Guide

## Step 1: Download & Install
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15+ installer
3. Run installer with these settings:
   - Port: 5432 (default)
   - Username: postgres
   - Password: admin123 (remember this!)
   - Install pgAdmin (GUI tool)

## Step 2: Create Database
Open Command Prompt as Admin:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jobportal;

# Create user
CREATE USER jobuser WITH PASSWORD 'jobpass123';
GRANT ALL PRIVILEGES ON DATABASE jobportal TO jobuser;

# Exit
\q
```

## Step 3: Test Connection
```bash
psql -U postgres -d jobportal
\dt  # List tables (should be empty)
\q   # Exit
```

## Next Steps:
After installation, run: npm install pg sequelize sequelize-cli