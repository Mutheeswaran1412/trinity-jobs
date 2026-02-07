# Troubleshooting: Interview Scheduling Buttons Not Working

## Step-by-Step Debugging

### Step 1: Open Browser Console
1. Open your application in the browser
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Keep it open while testing

### Step 2: Test the Buttons
1. Go to Employee Dashboard → Applications tab
2. Click "Schedule Interview" on any application
3. Select a date and time
4. Click "Open Zoom" button

### Step 3: Check Console Logs

You should see these logs in order:

```
📋 ScheduleInterviewModal mounted with application: {...}
🔵 Zoom button clicked!
📅 Scheduled date: 2024-01-20T10:00
📤 Sending request to: http://localhost:5000/api/meetings/create
📦 Payload: {...}
📥 Response status: 200
✅ Zoom result: {...}
```

### What Each Log Means:

**If you see:**
- ✅ `📋 ScheduleInterviewModal mounted` → Modal loaded correctly
- ✅ `🔵 Zoom button clicked!` → Button click is working
- ✅ `📅 Scheduled date` → Date is set correctly
- ✅ `📤 Sending request` → API call is being made
- ✅ `📥 Response status: 200` → Backend responded successfully
- ✅ `✅ Zoom result` → Link generated successfully

**If you DON'T see:**
- ❌ `📋 ScheduleInterviewModal mounted` → Modal not loading
- ❌ `🔵 Zoom button clicked!` → Button not responding
- ❌ `📤 Sending request` → Function not executing
- ❌ `📥 Response status` → Network error

### Common Issues and Solutions

#### Issue 1: No logs at all
**Problem:** Modal not loading
**Solution:** 
- Check if ScheduleInterviewModal is imported correctly
- Verify the modal is being rendered

#### Issue 2: Button clicked but no request sent
**Problem:** Date validation failing
**Solution:**
- Make sure you selected a date and time
- Check console for "Please select a date and time first" alert

#### Issue 3: Network Error / Failed to fetch
**Problem:** Backend not running or CORS issue
**Solution:**
```bash
# Check if backend is running
cd backend
npm start

# Should see: Server running on port 5000
```

#### Issue 4: Response status 404
**Problem:** API endpoint not found
**Solution:**
- Verify backend has `/api/meetings/create` route
- Check server.js has `app.use('/api/meetings', meetingRoutes)`

#### Issue 5: Response status 500
**Problem:** Backend error
**Solution:**
- Check backend console for error messages
- Verify Zoom credentials in .env file

#### Issue 6: Link not appearing in input field
**Problem:** State update issue
**Solution:**
- Check console for "✅ Zoom result"
- Verify result.meeting.join_url exists
- Should see alert with the link

### Quick Test Commands

**Test Backend Directly:**
```bash
curl -X POST http://localhost:5000/api/meetings/create ^
  -H "Content-Type: application/json" ^
  -d "{\"platform\":\"zoom\",\"topic\":\"Test\",\"start_time\":\"2024-01-20T10:00:00\",\"duration\":60}"
```

**Expected Response:**
```json
{
  "success": true,
  "meeting": {
    "join_url": "https://zoom.us/j/123456789?pwd=abc123"
  }
}
```

### Manual Test in Browser Console

Open browser console and run:

```javascript
// Test Zoom API
fetch('http://localhost:5000/api/meetings/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'zoom',
    topic: 'Test',
    start_time: '2024-01-20T10:00:00',
    duration: 60
  })
})
.then(r => r.json())
.then(d => console.log('✅ Result:', d))
.catch(e => console.error('❌ Error:', e));
```

### What to Report

If still not working, provide:

1. **Console Logs:** Copy all logs from console
2. **Network Tab:** Check if request was made
3. **Backend Logs:** Check backend console output
4. **Error Messages:** Any alerts or error messages shown

### Next Steps

1. ✅ Open browser console (F12)
2. ✅ Click the button
3. ✅ Check what logs appear
4. ✅ Share the console output

The extensive logging will show exactly where the issue is!
