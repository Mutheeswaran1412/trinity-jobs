# Interview Scheduling Buttons - Quick Fix

## What Was Fixed

### Frontend Changes
**File:** `src/components/ScheduleInterviewModal.tsx`

✅ Changed API endpoints to use `http://localhost:5000` directly
✅ Added console logging for debugging
✅ Fixed platform setting when generating links

### Key Changes:
```typescript
// Before
const response = await fetch(`${API_ENDPOINTS.MEETINGS}/create`, ...);

// After
const apiUrl = 'http://localhost:5000/api/meetings/create';
const response = await fetch(apiUrl, ...);
```

## How to Test

### Option 1: Using Test HTML File
1. Open `test-meetings.html` in your browser
2. Select a date and time
3. Click "Test Open Zoom" or "Test Create Meet"
4. Verify links are generated

### Option 2: Using the Application
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Login as employer
4. Go to Applications tab
5. Click "Schedule Interview"
6. Select date/time
7. Click "Open Zoom" or "Create Meet"
8. Verify link appears in the input field

## Expected Results

### Open Zoom Button:
- ✅ Generates real Zoom meeting link
- ✅ Shows meeting ID and password
- ✅ Link format: `https://zoom.us/j/[ID]?pwd=[PASSWORD]`

### Create Meet Button:
- ✅ Generates Google Meet link
- ✅ Link format: `https://meet.google.com/[ID]`

## Backend API Test

Test the API directly:
```bash
curl -X POST http://localhost:5000/api/meetings/create \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "zoom",
    "topic": "Test Interview",
    "start_time": "2024-01-20T10:00:00",
    "duration": 60
  }'
```

Expected response:
```json
{
  "success": true,
  "meeting": {
    "platform": "zoom",
    "meetingId": "123456789",
    "join_url": "https://zoom.us/j/123456789?pwd=abc123",
    "password": "abc123"
  }
}
```

## Troubleshooting

### If buttons still don't work:

1. **Check Backend is Running**
   ```bash
   curl http://localhost:5000/api/test
   ```

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Check CORS**
   - Backend should allow requests from `http://localhost:5173`
   - Look for CORS errors in browser console

4. **Verify API Response**
   - Open test-meetings.html
   - Click buttons and check console logs

### Common Issues:

**Issue:** "Failed to fetch"
- **Solution:** Backend not running. Start with `npm start`

**Issue:** "CORS error"
- **Solution:** Check server.js CORS configuration

**Issue:** "Unexpected end of JSON input"
- **Solution:** Already fixed in backend routes

**Issue:** Link not appearing in input
- **Solution:** Check browser console for errors

## Files Modified

1. ✅ `src/components/ScheduleInterviewModal.tsx` - Fixed API endpoints
2. ✅ `test-meetings.html` - Created test file

## Next Steps

1. Test both buttons work
2. Verify links are valid
3. Test scheduling complete flow
4. Check email notifications are sent

## Notes

- Backend is working correctly (tested with curl)
- Zoom API credentials are configured
- Google Meet generates random links (no API integration)
- All responses return valid JSON
