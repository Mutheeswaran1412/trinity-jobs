# Trinity Jobs - Intern Task Modules

## Overview
This document contains 4 modules for intern development. Each module is independent and includes clear requirements, API endpoints, and acceptance criteria.

---

## Module 1: Job Bookmarking/Save Jobs Feature
**Difficulty:** Easy  
**Estimated Time:** 3-4 days  
**Technologies:** React, Node.js, MongoDB

### Description
Allow candidates to bookmark/save jobs they're interested in for later viewing.

### Requirements
1. Add "Save Job" button on job cards and job detail pages
2. Create a "Saved Jobs" page to view all bookmarked jobs
3. Allow users to remove jobs from saved list
4. Show visual indicator if a job is already saved

### Backend Tasks
**File:** `backend/routes/savedJobs.js`
```javascript
// Create these endpoints:
// POST /api/saved-jobs - Save a job
// GET /api/saved-jobs/:userId - Get all saved jobs for a user
// DELETE /api/saved-jobs/:userId/:jobId - Remove a saved job
```

**File:** `backend/models/SavedJob.js`
```javascript
// Create schema with:
// - userId (reference to User)
// - jobId (reference to Job)
// - savedAt (timestamp)
```

### Frontend Tasks
**File:** `src/components/SaveJobButton.tsx`
- Create reusable save/unsave button component
- Show heart icon (filled if saved, outline if not)
- Handle click events

**File:** `src/pages/SavedJobsPage.tsx`
- Display all saved jobs in a grid/list
- Add filter and search functionality
- Show "No saved jobs" message when empty

### Acceptance Criteria
- [ ] User can save/unsave jobs
- [ ] Saved jobs persist after page refresh
- [ ] Saved jobs page shows all bookmarked jobs
- [ ] Visual feedback when saving/unsaving
- [ ] Handle errors gracefully

---

## Module 2: Job Application Status Tracker
**Difficulty:** Medium  
**Estimated Time:** 4-5 days  
**Technologies:** React, Node.js, MongoDB

### Description
Create a visual tracker for candidates to see their application status (Applied → Under Review → Interview → Rejected/Accepted).

### Requirements
1. Display application status with visual progress indicator
2. Allow employers to update application status
3. Send notifications when status changes
4. Show application timeline/history

### Backend Tasks
**File:** `backend/routes/applicationStatus.js`
```javascript
// Create these endpoints:
// PUT /api/applications/:id/status - Update application status
// GET /api/applications/:id/history - Get status change history
// POST /api/applications/:id/notes - Add notes to application
```

**File:** `backend/models/ApplicationHistory.js`
```javascript
// Create schema with:
// - applicationId
// - status (Applied, Under Review, Interview Scheduled, Rejected, Accepted)
// - changedBy (userId)
// - changedAt (timestamp)
// - notes
```

### Frontend Tasks
**File:** `src/components/ApplicationStatusTracker.tsx`
- Create visual stepper/progress bar component
- Show current status with different colors
- Display status change dates

**File:** `src/components/ApplicationTimeline.tsx`
- Show chronological history of status changes
- Display notes added by employer
- Show who made the changes

### Acceptance Criteria
- [ ] Visual status tracker shows current stage
- [ ] Employers can update application status
- [ ] Candidates receive notifications on status change
- [ ] Timeline shows complete application history
- [ ] Status updates are logged with timestamp

---

## Module 3: Company Reviews & Ratings
**Difficulty:** Medium  
**Estimated Time:** 5-6 days  
**Technologies:** React, Node.js, MongoDB

### Description
Allow candidates to rate and review companies they've worked with or interviewed at.

### Requirements
1. Add rating system (1-5 stars) for companies
2. Allow text reviews with categories (Work Culture, Salary, Interview Process)
3. Display average rating on company profile
4. Implement review moderation (flag inappropriate reviews)

### Backend Tasks
**File:** `backend/routes/companyReviews.js`
```javascript
// Create these endpoints:
// POST /api/companies/:id/reviews - Submit a review
// GET /api/companies/:id/reviews - Get all reviews for a company
// PUT /api/reviews/:id/flag - Flag a review
// DELETE /api/reviews/:id - Delete own review
```

**File:** `backend/models/CompanyReview.js`
```javascript
// Create schema with:
// - companyId
// - userId
// - rating (1-5)
// - workCultureRating
// - salaryRating
// - interviewProcessRating
// - reviewText
// - pros
// - cons
// - isVerified (worked there or interviewed)
// - isFlagged
// - createdAt
```

### Frontend Tasks
**File:** `src/components/CompanyReviewForm.tsx`
- Create form with star ratings for different categories
- Add text areas for pros, cons, and detailed review
- Validate that user has applied/interviewed at company

**File:** `src/components/CompanyReviewsList.tsx`
- Display all reviews with ratings
- Show average rating at the top
- Add sorting (Most Recent, Highest Rated, Lowest Rated)
- Implement pagination

**File:** `src/components/ReviewCard.tsx`
- Display individual review with star ratings
- Show verified badge if applicable
- Add "Helpful" button and flag option

### Acceptance Criteria
- [ ] Users can submit reviews with multiple ratings
- [ ] Company profile shows average rating
- [ ] Reviews can be sorted and filtered
- [ ] Inappropriate reviews can be flagged
- [ ] Only users who applied can review
- [ ] Display review statistics (total reviews, rating breakdown)

---

## Module 4: Job Alerts & Email Notifications
**Difficulty:** Medium-Hard  
**Estimated Time:** 5-7 days  
**Technologies:** React, Node.js, MongoDB, NodeMailer

### Requirements
1. Allow users to create custom job alerts based on criteria
2. Send email notifications when matching jobs are posted
3. Manage alert preferences (frequency, categories)
4. Show alert management dashboard

### Backend Tasks
**File:** `backend/routes/jobAlerts.js`
```javascript
// Create these endpoints:
// POST /api/job-alerts - Create new alert
// GET /api/job-alerts/:userId - Get user's alerts
// PUT /api/job-alerts/:id - Update alert
// DELETE /api/job-alerts/:id - Delete alert
// POST /api/job-alerts/check - Check for matching jobs (cron job)
```

**File:** `backend/models/JobAlert.js`
```javascript
// Create schema with:
// - userId
// - alertName
// - keywords (array)
// - location
// - jobType (Full-time, Part-time, etc.)
// - salaryRange
// - frequency (Instant, Daily, Weekly)
// - isActive
// - lastSent
// - createdAt
```

**File:** `backend/services/jobAlertService.js`
```javascript
// Create functions:
// - findMatchingJobs(alertCriteria)
// - sendAlertEmail(user, jobs)
// - processAlerts() - Run periodically
```

**File:** `backend/utils/emailTemplates.js`
```javascript
// Create email templates:
// - Job alert email with matching jobs
// - Alert confirmation email
```

### Frontend Tasks
**File:** `src/pages/JobAlertsPage.tsx`
- Display all user's job alerts
- Show active/inactive status
- Add edit and delete options
- Show statistics (jobs matched, last sent)

**File:** `src/components/CreateJobAlertModal.tsx`
- Form to create new alert
- Select criteria (keywords, location, salary, etc.)
- Choose notification frequency
- Preview alert criteria

**File:** `src/components/JobAlertCard.tsx`
- Display individual alert with criteria
- Toggle active/inactive
- Show match count
- Edit and delete buttons

### Acceptance Criteria
- [ ] Users can create multiple job alerts
- [ ] Alerts match jobs based on criteria
- [ ] Email notifications sent based on frequency
- [ ] Users can manage (edit/delete/pause) alerts
- [ ] Dashboard shows alert statistics
- [ ] Email template is professional and mobile-responsive
- [ ] Unsubscribe option in emails

---

## Getting Started for Interns

### Setup Steps
1. Clone the repository
2. Follow README.md for backend and frontend setup
3. Create a new branch: `git checkout -b feature/module-name`
4. Read the module requirements carefully
5. Start with backend (models → routes → test with Postman)
6. Then implement frontend components
7. Test thoroughly before submitting

### Development Guidelines
1. **Code Quality:**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing code style

2. **Testing:**
   - Test all API endpoints with Postman
   - Test UI on different screen sizes
   - Handle error cases

3. **Git Commits:**
   - Make small, frequent commits
   - Write clear commit messages
   - Example: "Add SavedJob model and routes"

4. **Documentation:**
   - Update API documentation
   - Add comments in code
   - Document any setup steps

### Resources
- MongoDB Documentation: https://docs.mongodb.com/
- React Documentation: https://react.dev/
- Express.js Guide: https://expressjs.com/
- Tailwind CSS: https://tailwindcss.com/

### Need Help?
- Check existing similar features in the codebase
- Review models in `backend/models/`
- Look at existing routes in `backend/routes/`
- Check existing components in `src/components/`

### Submission Checklist
- [ ] Code runs without errors
- [ ] All endpoints tested with Postman
- [ ] UI is responsive
- [ ] Error handling implemented
- [ ] Code is commented
- [ ] Git commits are clean
- [ ] Feature works end-to-end

---

## Bonus Challenges (Optional)

### Module 1 Bonus:
- Add "Save for Later" vs "Highly Interested" categories
- Export saved jobs as PDF

### Module 2 Bonus:
- Add interview scheduling feature
- Send calendar invites for interviews

### Module 3 Bonus:
- Add photo upload for company reviews
- Implement review response from companies

### Module 4 Bonus:
- Add SMS notifications option
- Create weekly digest email with job market insights
- Add AI-powered job recommendations

---

## Evaluation Criteria

Each module will be evaluated on:
1. **Functionality (40%)** - Does it work as specified?
2. **Code Quality (25%)** - Is the code clean and maintainable?
3. **UI/UX (20%)** - Is it user-friendly and visually appealing?
4. **Error Handling (10%)** - Are errors handled gracefully?
5. **Documentation (5%)** - Is the code well-documented?

Good luck! 🚀
