# Get Google Meet API Credentials - Step by Step

## Step 1: Go to Google Cloud Console
1. Open browser and go to: **https://console.cloud.google.com**
2. Sign in with your Google account

## Step 2: Create New Project
1. Click **Select a project** (top left, next to "Google Cloud")
2. Click **NEW PROJECT** (top right)
3. Enter Project name: `ZyncJobs`
4. Click **CREATE**
5. Wait 10 seconds for project to be created

## Step 3: Enable Google Calendar API
1. Make sure your new project is selected (check top left)
2. Click **☰** menu (hamburger icon) → **APIs & Services** → **Library**
3. In search box, type: `Google Calendar API`
4. Click on **Google Calendar API**
5. Click **ENABLE** button
6. Wait for it to enable

## Step 4: Configure OAuth Consent Screen
1. Click **☰** menu → **APIs & Services** → **OAuth consent screen**
2. Select **External** radio button
3. Click **CREATE**
4. Fill in required fields:
   - **App name**: `ZyncJobs`
   - **User support email**: Select your email from dropdown
   - **Developer contact information**: Enter your email
5. Click **SAVE AND CONTINUE**
6. On Scopes page, click **SAVE AND CONTINUE** (skip this)
7. On Test users page, click **SAVE AND CONTINUE** (skip this)
8. Click **BACK TO DASHBOARD**

## Step 5: Create OAuth 2.0 Credentials
1. Click **☰** menu → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** (top)
3. Select **OAuth client ID**
4. Application type: Select **Web application**
5. Name: `ZyncJobs Backend`
6. Under **Authorized redirect URIs**:
   - Click **+ ADD URI**
   - Enter: `http://localhost:5000/auth/google/callback`
   - Click **+ ADD URI** again
   - Enter: `http://localhost:5000/api/meetings/google/callback`
7. Click **CREATE**

## Step 6: Copy Your Credentials
A popup will appear with your credentials:

1. **Client ID**: Copy this (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
2. **Client secret**: Copy this (looks like: `GOCSPX-abc123xyz`)
3. Click **OK**

**IMPORTANT**: Save these somewhere safe! You'll need them in the next step.

## Step 7: Add to .env File
1. Open `backend/.env` file
2. Add these lines (replace with your actual values):

```env
# Google Meet API
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
GOOGLE_REDIRECT_URI=http://localhost:5000/api/meetings/google/callback
```

3. Save the file

## Step 8: Restart Backend
```bash
cd backend
npm start
```

## Done! ✅

Your Google Meet API is now configured. The system will generate Google Meet links when you click "Create Meet" button.

---

## Quick Reference

**Where to find credentials later:**
1. Go to: https://console.cloud.google.com
2. Select your project
3. **☰** menu → **APIs & Services** → **Credentials**
4. Your OAuth 2.0 Client ID will be listed
5. Click on it to see Client ID and Client Secret

---

## Troubleshooting

**Can't find OAuth consent screen?**
- Make sure you selected the correct project (top left)

**"Access blocked" error?**
- Go to OAuth consent screen
- Click **PUBLISH APP**
- Confirm

**Lost credentials?**
- Go to Credentials page
- Click on your OAuth client
- You can see Client ID and create new Client Secret

---

## Visual Guide

```
console.cloud.google.com
    ↓
Select/Create Project
    ↓
Enable Google Calendar API
    ↓
Configure OAuth Consent Screen
    ↓
Create OAuth 2.0 Client ID
    ↓
Copy Client ID & Secret
    ↓
Add to .env file
    ↓
Restart backend
    ↓
Done!
```
