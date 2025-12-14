# Applications Not Showing - Debug Guide

## Problem Found! ✅

Applications irukku but email mismatch:

**Applications in DB:**
- `mutheeswaran124@gmail.com` - 2 applications
- `test@candidate.com` - 1 application

**Issue:** Login email != Application email

## Quick Fix:

### Browser Console-la check pannunga:

```javascript
// 1. Check current user email
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current user email:', user.email);

// 2. Check applications for that email
fetch(`http://localhost:5000/api/applications/candidate/${user.email}`)
  .then(r => r.json())
  .then(data => console.log('Applications:', data));
```

## Solution Options:

### Option 1: Login with correct email
```
Email: mutheeswaran124@gmail.com
Password: 123456
```

### Option 2: Update user email in localStorage
```javascript
const user = JSON.parse(localStorage.getItem('user'));
user.email = 'mutheeswaran124@gmail.com';
localStorage.setItem('user', JSON.stringify(user));
location.reload();
```

### Option 3: Fix application email when applying

JobApplicationPage.tsx-la:
```typescript
// Use logged-in user email
candidateEmail: user.email  // Not form email
```

## Test:

1. Logout
2. Login with: `mutheeswaran124@gmail.com` / `123456`
3. Go to Dashboard → My Applications
4. Should see 2 applications!

## Root Cause:

Application submit pannumbothu form-la enter panna email use aaguthu.
But dashboard-la localStorage user email use aaguthu.

Rendu match aaganum!
