# Real-time Features - Setup & Usage Guide

## 🚀 What's Added

### 1. **Real-time Notifications** ✅
- Notification bell icon with unread count
- Instant notifications for:
  - New job applications
  - Application status updates
  - New messages
  - Job matches
- Mark as read/unread
- Notification history

### 2. **Messaging System** ✅
- Direct chat between Employer ↔ Candidate
- Real-time message delivery
- Message history
- Read receipts
- Floating chat widget
- Conversation threads

---

## 📦 Installation

### Step 1: Install Dependencies
```bash
# Run the installation script
install-realtime-features.bat

# OR manually:
cd backend
npm install socket.io@^4.7.2

cd ..
npm install socket.io-client@^4.7.2
```

### Step 2: Restart Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

---

## 🔧 How to Use

### Adding Notification Bell to Header

In your `Header.tsx` or navigation component:

```tsx
import NotificationBell from './components/NotificationBell';

// Inside your component
const user = JSON.parse(localStorage.getItem('user') || '{}');

<NotificationBell userId={user.id} />
```

### Adding Messaging Widget

In any page where you want chat (e.g., Job Details, Candidate Profile):

```tsx
import MessagingWidget from './components/MessagingWidget';

// Inside your component
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const recipientId = '123'; // Employer or Candidate ID
const recipientName = 'John Doe';

<MessagingWidget 
  currentUserId={currentUser.id}
  recipientId={recipientId}
  recipientName={recipientName}
/>
```

---

## 📡 API Endpoints

### Notifications
```
GET    /api/notifications/:userId          - Get user notifications
PUT    /api/notifications/:id/read         - Mark as read
PUT    /api/notifications/user/:userId/read-all - Mark all as read
DELETE /api/notifications/:id              - Delete notification
```

### Messages
```
GET  /api/messages/conversations/:userId   - Get all conversations
GET  /api/messages/:conversationId         - Get messages in conversation
POST /api/messages                         - Send message
PUT  /api/messages/:conversationId/read/:userId - Mark as read
```

---

## 💡 Sending Notifications (Backend)

In your backend routes, import and use:

```javascript
import { sendNotification } from '../server.js';

// Example: When someone applies for a job
await sendNotification(
  employerId,                    // User ID to notify
  'application',                 // Type
  'New Application',             // Title
  'Someone applied for your job', // Message
  '/applications/123'            // Link (optional)
);
```

### Notification Types:
- `application` - Job applications
- `message` - New messages
- `job_match` - Job recommendations
- `status_update` - Application status changes
- `system` - System notifications

---

## 🎨 Customization

### Notification Bell Styling
Edit `src/components/NotificationBell.tsx`:
- Change colors
- Adjust dropdown size
- Modify notification layout

### Messaging Widget Styling
Edit `src/components/MessagingWidget.tsx`:
- Change position (bottom-right by default)
- Adjust size
- Modify colors

---

## 🔥 Real-time Features

### Socket.io Events

**Client → Server:**
- `register` - Register user for real-time updates
- `send_message` - Send a message

**Server → Client:**
- `new_notification` - Receive notification
- `new_message` - Receive message
- `message_sent` - Confirmation

---

## 📊 Database Collections

### Notifications Collection
```javascript
{
  userId: String,
  type: String,
  title: String,
  message: String,
  link: String,
  read: Boolean,
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  conversationId: String,
  senderId: String,
  receiverId: String,
  message: String,
  read: Boolean,
  createdAt: Date
}
```

---

## 🧪 Testing

### Test Notifications:
1. Login as Employer (`test@employer.com` / `123456`)
2. Check notification bell
3. Apply for a job as Candidate
4. Employer should see notification instantly

### Test Messaging:
1. Login as Candidate
2. Go to Job Details page
3. Click message button
4. Send message to Employer
5. Login as Employer
6. Check messages

---

## 🐛 Troubleshooting

### Notifications not showing?
- Check if backend is running
- Verify userId is correct
- Check browser console for errors

### Messages not sending?
- Ensure Socket.io is installed
- Check backend logs
- Verify both users are registered

### Real-time not working?
- Restart both servers
- Clear browser cache
- Check CORS settings

---

## 🎯 Next Steps

### Optional Enhancements:
1. Add typing indicators
2. File sharing in chat
3. Push notifications (browser)
4. Email notifications
5. Message search
6. Group chat
7. Voice messages

---

## ✅ Features Completed

- ✅ Notification bell with count
- ✅ Real-time notifications
- ✅ Direct messaging
- ✅ Message history
- ✅ Read receipts
- ✅ Conversation threads
- ✅ Socket.io integration
- ✅ Database models
- ✅ API endpoints

---

## 📝 Summary

You now have:
1. **Real-time Notifications** - Instant alerts for important events
2. **Messaging System** - Direct chat between users
3. **Socket.io Integration** - Real-time communication
4. **Clean UI Components** - Ready to use

**Total Implementation Time:** ~30 minutes
**Code Added:** ~500 lines
**New Features:** 2 major features

Enjoy your real-time features! 🎉
