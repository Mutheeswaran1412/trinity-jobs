import fetch from 'node-fetch';

// Zoom API Integration with Server-to-Server OAuth
export const createZoomMeeting = async (meetingData) => {
  try {
    const { scheduledDate, duration, topic = 'Interview Meeting' } = meetingData;
    
    // Get access token first
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get Zoom access token');
    }

    // Create meeting
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic,
        type: 2,
        start_time: new Date(scheduledDate).toISOString(),
        duration,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true
        }
      })
    });

    const meeting = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        meetingUrl: meeting.join_url,
        meetingId: meeting.id,
        password: meeting.password
      };
    } else {
      throw new Error(meeting.message || 'Failed to create Zoom meeting');
    }
  } catch (error) {
    console.error('Zoom meeting creation error:', error);
    return { success: false, error: error.message };
  }
};

// Google Meet API Integration (via Google Calendar)
export const createGoogleMeet = async (meetingData) => {
  try {
    const { scheduledDate, duration, summary = 'Interview Meeting' } = meetingData;
    
    const googleToken = process.env.GOOGLE_ACCESS_TOKEN;
    
    if (!googleToken) {
      throw new Error('Google API token not configured');
    }

    const startTime = new Date(scheduledDate);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      })
    });

    const event = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        meetingUrl: event.conferenceData?.entryPoints?.[0]?.uri,
        eventId: event.id
      };
    } else {
      throw new Error(event.error?.message || 'Failed to create Google Meet');
    }
  } catch (error) {
    console.error('Google Meet creation error:', error);
    return { success: false, error: error.message };
  }
};