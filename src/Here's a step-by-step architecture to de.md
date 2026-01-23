Here's a step-by-step architecture to deploy your project:

Architecture Overview
Frontend (Hostinger) → Backend (AWS EC2) → Database (MongoDB Atlas)

Copy
Step 1: Prepare Backend for EC2
1.1 Update Backend Configuration
// backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://jobportal_user:YOUR_PASSWORD@jobportal.pnp4szn.mongodb.net/?retryWrites=true&w=majority&appName=Jobportal
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production

Copy
javascript
1.2 Update CORS Settings
// backend/server.js or app.js
const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:3000'], // Add your Hostinger domain
  credentials: true
}));

Copy
javascript
Step 2: Create EC2 Instance
2.1 Launch EC2 Instance
Go to AWS Console → EC2

Click "Launch Instance"

Choose Ubuntu Server 22.04 LTS

Instance type: t2.micro (free tier)

Create new key pair (download .pem file)

Security Group settings:

SSH (22) - Your IP

HTTP (80) - Anywhere

HTTPS (443) - Anywhere

Custom TCP (5000) - Anywhere

2.2 Connect to EC2
# Windows (use Git Bash or WSL)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Make key file secure
chmod 400 your-key.pem

Copy
bash
Step 3: Setup EC2 Environment
3.1 Install Node.js
# Update system
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

Copy
bash
3.2 Install PM2 (Process Manager)
sudo npm install -g pm2

Copy
bash
3.3 Install Git
sudo apt install git

Copy
bash
Step 4: Deploy Backend to EC2
4.1 Clone Your Backend
# Clone your backend repository
git clone https://github.com/yourusername/your-backend-repo.git
cd your-backend-repo

# Install dependencies
npm install

Copy
bash
4.2 Create Production Environment File
# Create .env file
nano .env

# Add your production environment variables
PORT=5000
MONGODB_URI=mongodb+srv://jobportal_user:YOUR_PASSWORD@jobportal.pnp4szn.mongodb.net/?retryWrites=true&w=majority&appName=Jobportal
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production

Copy
bash
4.3 Start Backend with PM2
# Start your backend
pm2 start server.js --name "zync-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

Copy
bash
4.4 Check Backend Status
# Check if backend is running
pm2 status
pm2 logs zync-backend

# Test backend
curl http://localhost:5000/api/test

Copy
bash
Step 5: Configure Nginx (Optional but Recommended)
5.1 Install Nginx
sudo apt install nginx

Copy
bash
5.2 Configure Nginx
sudo nano /etc/nginx/sites-available/zync-backend

Copy
bash
server {
    listen 80;
    server_name your-ec2-public-ip;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

Copy
nginx
5.3 Enable Nginx Configuration
sudo ln -s /etc/nginx/sites-available/zync-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

Copy
bash
Step 6: Update Frontend Configuration
6.1 Update API Endpoints
// src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://your-ec2-public-ip' 
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  JOBS: `${API_BASE_URL}/api/jobs`,
  USERS: `${API_BASE_URL}/api/users`,
  // ... other endpoints
};

Copy
javascript
6.2 Build Frontend
# In your frontend directory
npm run build

Copy
bash
Step 7: Deploy Frontend to Hostinger
7.1 Upload to Hostinger
Compress your dist or build folder

Upload via Hostinger File Manager

Extract files to public_html directory

7.2 Configure Hostinger
Set up custom domain (if needed)

Enable HTTPS in Hostinger panel

Update CORS_ORIGIN in backend with your domain

Step 8: Security & Monitoring
8.1 Setup Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000

Copy
bash
8.2 Monitor Backend
# Check PM2 status
pm2 monit

# View logs
pm2 logs zync-backend

# Restart if needed
pm2 restart zync-backend

Copy
bash
Step 9: Domain & SSL (Optional)
9.1 Point Domain to EC2
Get Elastic IP for EC2 instance

Update DNS A record to point to Elastic IP

9.2 Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

Copy
bash
Final Architecture
User → Hostinger (Frontend) → EC2 (Backend + Nginx) → MongoDB Atlas

Copy
Your backend will be accessible at: http://your-ec2-public-ip:5000
Your frontend will be at: https://yourdomain.com

Quick Commands Reference
# Check backend status
pm2 status

# Restart backend
pm2 restart zync-backend

# View logs
pm2 logs zync-backend

# Update code
git pull
npm install
pm2 restart zync-backend

Copy
bash