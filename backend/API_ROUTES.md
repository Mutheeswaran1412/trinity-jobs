# Trinity Jobs - Complete API Routes

## ✅ ALL ROUTES INTEGRATED IN SERVER.JS

### 1. Job Routes (`/api/jobs`)
- GET /api/jobs - Get all jobs
- POST /api/jobs - Create new job
- GET /api/jobs/:id - Get specific job
- PUT /api/jobs/:id - Update job
- DELETE /api/jobs/:id - Delete job

### 2. User Routes (`/api/users`)
- POST /api/users/register - Register new user
- POST /api/users/login - User login
- GET /api/users/:id - Get user profile
- PUT /api/users/:id - Update user profile

### 3. Application Routes (`/api/applications`)
- POST /api/applications - Submit job application
- GET /api/applications - Get all applications
- GET /api/applications/:id - Get specific application
- PUT /api/applications/:id - Update application status

### 4. Company Routes (`/api/companies`)
- GET /api/companies - Get all companies (with search)
- POST /api/companies - Create new company
- GET /api/companies/:id - Get company details

### 5. Company Search (`/api/company`)
- GET /api/company/search - Search companies

### 6. Company Autocomplete (`/api/companies/autocomplete`)
- GET /api/companies/autocomplete - Company name suggestions

### 7. Resume Routes (`/api/resume`)
- POST /api/resume/generate-pdf - Generate resume PDF
- POST /api/resume/enhance - AI resume enhancement
- POST /api/resume/parse-profile - Parse resume text
- POST /api/resume/upload-and-parse - Upload & parse resume
- POST /api/resume/upload - Upload with moderation
- GET /api/resume/moderation - Get resumes for moderation
- POST /api/resume/:id/moderate - Moderate resume
- GET /api/resume/:userId/status - Get resume status

### 8. Resume Versions (`/api/resume-versions`)
- GET /api/resume-versions - Get all versions
- POST /api/resume-versions - Create new version
- GET /api/resume-versions/:id - Get specific version

### 9. PDF Routes (`/api/pdf`)
- POST /api/pdf/generate - Generate PDF from data

### 10. Moderation Routes (`/api/moderation`)
- GET /api/moderation/jobs - Get jobs for moderation
- POST /api/moderation/jobs/:id - Moderate job

### 11. AI Routes (`/api/ai`)
- POST /api/ai/score - AI scoring for candidates
- POST /api/ai/analyze - AI analysis

### 12. AI Flow Routes (`/api/ai-flow`)
- POST /api/ai-flow/process - Process AI workflow

### 13. AI Suggestions (`/api/ai-suggestions`)
- POST /api/ai-suggestions/generate - Generate AI suggestions

### 14. Autocomplete (`/api/autocomplete`)
- GET /api/autocomplete/skills - Skill suggestions
- GET /api/autocomplete/locations - Location suggestions
- GET /api/autocomplete/titles - Job title suggestions

### 15. Notifications (`/api/notifications`)
- GET /api/notifications - Get user notifications
- PUT /api/notifications/:id/read - Mark as read
- DELETE /api/notifications/:id - Delete notification

### 16. Messages (`/api/messages`)
- GET /api/messages - Get conversations
- POST /api/messages - Send message
- GET /api/messages/:conversationId - Get conversation messages

### 17. Profile Routes (`/api/profile`)
- GET /api/profile/:userId - Get user profile
- PUT /api/profile/:userId - Update profile

### 18. LinkedIn Parser (`/api/linkedin-parser`)
- POST /api/linkedin-parser/parse - Parse LinkedIn profile

### 19. Suggest Routes (`/api/suggest`)
- GET /api/suggest/jobs - Job suggestions
- GET /api/suggest/skills - Skill suggestions

### 20. Admin - Jobs (`/api/admin/jobs`)
- GET /api/admin/jobs - Get all jobs (admin)
- PUT /api/admin/jobs/:id - Update job (admin)
- DELETE /api/admin/jobs/:id - Delete job (admin)

### 21. Admin - Users (`/api/admin/users`)
- GET /api/admin/users - Get all users
- PUT /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user

### 22. Admin - Analytics (`/api/admin/analytics`)
- GET /api/admin/analytics/dashboard - Dashboard stats
- GET /api/admin/analytics/users - User analytics
- GET /api/admin/analytics/jobs - Job analytics

### 23. Admin - Settings (`/api/admin/settings`)
- GET /api/admin/settings - Get settings
- PUT /api/admin/settings - Update settings

### 24. Admin - Bulk Operations (`/api/admin/bulk`)
- POST /api/admin/bulk/import - Bulk import
- POST /api/admin/bulk/export - Bulk export

### 25. Admin - Audit (`/api/admin/audit`)
- GET /api/admin/audit/logs - Get audit logs

### 26. Admin - System (`/api/admin/system`)
- GET /api/admin/system/health - System health check
- GET /api/admin/system/stats - System statistics

### 27. Admin - Notifications (`/api/admin/notifications`)
- POST /api/admin/notifications/broadcast - Send broadcast notification

### 28. Employer - Candidates (`/api/employer`)
- GET /api/employer/candidates - Get candidate list
- GET /api/employer/candidates/:id - Get candidate details

### 29. Resume Parser (`/api/resume-parser`)
- POST /api/resume-parser/parse - Parse resume with AI

### 30. Utility Routes
- POST /api/forgot-password - Request password reset
- GET /api/verify-reset-token/:token - Verify reset token
- POST /api/reset-password - Reset password
- POST /api/chat - AI chat assistant
- POST /api/generate-content - Generate content
- POST /api/generate-job-description - Generate job description
- GET /api/health - Health check
- GET /api/test - MongoDB connection test

## 🔌 Socket.io Events
- `connection` - User connects
- `register` - Register user socket
- `send_message` - Send real-time message
- `new_message` - Receive new message
- `new_notification` - Receive notification
- `disconnect` - User disconnects

## 📦 Data Loading
- Companies from JSON (201 companies)
- Sample jobs generation
- Skills, locations, job titles data

## 🔐 Authentication
- JWT token-based authentication
- Role-based access control (admin, moderator, employer, candidate)
- Cookie-based session management

## 🚀 Server Configuration
- Port: 5000
- CORS enabled for frontend (http://localhost:5173)
- Socket.io for real-time features
- File upload support (multer)
- PDF generation support
- AI integration (Mistral AI)
