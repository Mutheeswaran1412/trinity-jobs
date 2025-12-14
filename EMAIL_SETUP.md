# Job Application Email Notification Setup

## Features Added ✅

1. **Email Service** - Sends confirmation emails to candidates when they apply for jobs
2. **Application Model** - Stores job applications in MongoDB
3. **Application API** - Handles job application submissions

## API Endpoint

### Submit Job Application
```
POST /api/applications
```

**Request Body:**
```json
{
  "jobId": "job_id_here",
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "candidatePhone": "+1234567890",
  "resumeUrl": "https://...",
  "coverLetter": "I am interested in this position...",
  "candidateId": "user_id_here" (optional)
}
```

**Response:**
```json
{
  "message": "Application submitted successfully! Check your email for confirmation.",
  "application": { ... }
}
```

## Email Configuration

Your `.env` file already has email settings:
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=muthees@trinitetech.com
SMTP_PASSWORD=bqqf cqxp incl fzrc
```

## Testing

1. **Start the backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Test email sending:**
   ```bash
   node test_application_email.js
   ```

3. **Test API with curl or Postman:**
   ```bash
   curl -X POST http://localhost:5000/api/applications \
     -H "Content-Type: application/json" \
     -d '{
       "jobId": "YOUR_JOB_ID",
       "candidateName": "Test User",
       "candidateEmail": "test@example.com",
       "candidatePhone": "1234567890"
     }'
   ```

## Frontend Integration

Add this to your job application form:

```javascript
const submitApplication = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: jobId,
        candidateName: formData.name,
        candidateEmail: formData.email,
        candidatePhone: formData.phone,
        resumeUrl: formData.resumeUrl,
        coverLetter: formData.coverLetter
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('Application submitted successfully! Check your email.');
    } else {
      alert(data.error || 'Application failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit application');
  }
};
```

## Email Template

The confirmation email includes:
- ✅ Success message
- Job title and company name
- Next steps information
- Professional HTML formatting

## Additional Endpoints

### Get candidate's applications
```
GET /api/applications/candidate/:email
```

### Get applications for a job
```
GET /api/applications/job/:jobId
```

## Notes

- Duplicate applications are prevented (same email + job)
- Email is sent asynchronously
- Application is saved even if email fails
- All applications are stored in MongoDB `applications` collection
