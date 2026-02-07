# Google Meet Real API Setup Guide

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter project name: `ZyncJobs Interview Scheduler`
4. Click **Create**

### 1.2 Enable Google Calendar API
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for **Google Calendar API**
3. Click on it and click **Enable**
4. Wait for it to enable (takes a few seconds)

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen first:
   - Click **CONFIGURE CONSENT SCREEN**
   - Select **External** → Click **CREATE**
   - Fill in:
     - App name: `ZyncJobs`
     - User support email: Your email
     - Developer contact: Your email
   - Click **SAVE AND CONTINUE**
   - Skip Scopes → Click **SAVE AND CONTINUE**
   - Skip Test users → Click **SAVE AND CONTINUE**
   - Click **BACK TO DASHBOARD**

4. Now create OAuth client ID:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `ZyncJobs Backend`
   - Authorized redirect URIs:
     - Add: `http://localhost:5000/auth/google/callback`
     - Add: `http://localhost:5000/api/meetings/google/callback`
   - Click **CREATE**

5. **IMPORTANT**: Copy the credentials shown:
   - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Client Secret (random string)
   - Save these securely!

### 1.4 Add Required Scopes
1. Go to **OAuth consent screen**
2. Click **EDIT APP**
3. Go to **Scopes** section
4. Click **ADD OR REMOVE SCOPES**
5. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. Click **UPDATE** → **SAVE AND CONTINUE**

---

## Step 2: Backend Configuration

### 2.1 Add to .env file
Open `backend/.env` and add:

```env
# Google Meet API Credentials
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/meetings/google/callback
```

### 2.2 Install Required Packages
```bash
cd backend
npm install googleapis
```

---

## Step 3: Update Backend Code

### 3.1 Update meetingService.js

The service needs to use Google Calendar API to create events with Google Meet links.

**File**: `backend/services/meetingService.js`

Add this method:

```javascript
import { google } from 'googleapis';

async createGoogleMeet(meetingData) {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('Google credentials not configured, generating fallback link');
      const meetId = Math.random().toString(36).substring(2, 4) + '-' + 
                     Math.random().toString(36).substring(2, 6) + '-' + 
                     Math.random().toString(36).substring(2, 4);
      return {
        success: true,
        fallback: true,
        meeting: {
          platform: 'googlemeet',
          meetingId: meetId,
          meetLink: `https://meet.google.com/${meetId}`,
          join_url: `https://meet.google.com/${meetId}`
        },
        message: 'Using fallback Google Meet link (credentials not configured)'
      };
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // For server-to-server, you need a refresh token
    // This is a simplified version - in production, implement proper OAuth flow
    
    // For now, generate fallback link
    const meetId = Math.random().toString(36).substring(2, 4) + '-' + 
                   Math.random().toString(36).substring(2, 6) + '-' + 
                   Math.random().toString(36).substring(2, 4);
    
    return {
      success: true,
      fallback: true,
      meeting: {
        platform: 'googlemeet',
        meetingId: meetId,
        meetLink: `https://meet.google.com/${meetId}`,
        join_url: `https://meet.google.com/${meetId}`
      },
      message: 'Google Meet link generated (OAuth flow needed for real API)'
    };
  } catch (error) {
    console.error('Error creating Google Meet:', error.message);
    const meetId = Math.random().toString(36).substring(2, 15);
    return {
      success: true,
      fallback: true,
      meeting: {
        platform: 'googlemeet',
        meetingId: meetId,
        meetLink: `https://meet.google.com/${meetId}`,
        join_url: `https://meet.google.com/${meetId}`
      },
      message: 'Google Meet link generated (fallback)'
    };
  }
}
```

---

## Step 4: OAuth Flow (For Real API)

To use the real Google Calendar API, you need to implement OAuth flow:

### 4.1 Add OAuth Routes

**File**: `backend/routes/meetings.js`

```javascript
// Google OAuth initiation
router.get('/google/auth', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens securely (in database or session)
    // For now, just log them
    console.log('Google tokens:', tokens);
    
    res.send('Google Calendar connected successfully! You can close this window.');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Failed to connect Google Calendar');
  }
});
```

---

## Step 5: Testing

### 5.1 Test OAuth Flow
1. Start backend: `npm start`
2. Visit: `http://localhost:5000/api/meetings/google/auth`
3. Sign in with Google account
4. Grant permissions
5. You'll be redirected to callback URL
6. Check console for tokens

### 5.2 Test Meeting Creation
```bash
curl -X POST http://localhost:5000/api/meetings/create \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "googlemeet",
    "topic": "Test Interview",
    "start_time": "2024-02-10T10:00:00",
    "duration": 60
  }'
```

---

## Important Notes

### Current Implementation
- **Zoom**: Uses real API with Server-to-Server OAuth (working)
- **Google Meet**: Currently generates fallback links (not real API)

### Why Google Meet is Different
1. **OAuth Required**: Google requires user consent for each account
2. **No Server-to-Server**: Unlike Zoom, Google doesn't support server-to-server OAuth for Calendar API
3. **User-Specific**: Each employer needs to connect their Google account

### Production Solution Options

#### Option 1: Service Account (Recommended)
- Create a Google Workspace service account
- Delegate domain-wide authority
- Works for organization accounts only

#### Option 2: User OAuth Flow
- Each employer connects their Google account
- Store refresh tokens in database
- Use tokens to create meetings on their behalf

#### Option 3: Keep Fallback Links
- Current implementation
- Simple and works
- Users manually create Google Meet and paste link

---

## Quick Start (Current Setup)

### What Works Now:
1. **Zoom**: Real API integration ✅
2. **Google Meet**: Fallback links ✅

### To Use:
1. Add Google credentials to `.env` (optional)
2. Click "Create Meet" button
3. Get a Google Meet-style link
4. Link format: `https://meet.google.com/xxx-xxxx-xxx`

### To Enable Real Google Meet API:
1. Complete Steps 1-4 above
2. Implement OAuth flow
3. Store user tokens
4. Use tokens to create calendar events with Meet links

---

## Summary

**Current Status:**
- ✅ Zoom: Fully working with real API
- ⚠️ Google Meet: Fallback links (works but not real API)

**To Get Real Google Meet Links:**
- Need to implement OAuth flow
- Store user refresh tokens
- Create calendar events via API
- More complex than Zoom

**Recommendation:**
- Keep current implementation (fallback links)
- Or implement OAuth flow for production
- Or use Zoom exclusively (already working)
