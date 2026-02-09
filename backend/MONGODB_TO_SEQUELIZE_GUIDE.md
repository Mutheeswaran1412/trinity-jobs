# MongoDB to PostgreSQL/Sequelize Conversion Guide

## Files Fixed:
✅ applications.js - COMPLETE
✅ jobs.js - COMPLETE  
✅ analytics.js - COMPLETE

## Remaining Files to Fix:

### Quick Reference - MongoDB → Sequelize Conversions:

```javascript
// FIND OPERATIONS
Model.findById(id) → Model.findByPk(id)
Model.findOne({ field: value }) → Model.findOne({ where: { field: value } })
Model.find({ field: value }) → Model.findAll({ where: { field: value } })

// CREATE OPERATIONS
new Model(data); await model.save() → await Model.create(data)

// UPDATE OPERATIONS
model.field = value; await model.save() → await model.update({ field: value })
Model.findByIdAndUpdate(id, data) → await Model.update(data, { where: { id } })

// DELETE OPERATIONS
Model.findByIdAndDelete(id) → await Model.destroy({ where: { id } })

// POPULATE (JOIN)
.populate('field') → Remove (fetch separately or use Sequelize associations)

// REGEX SEARCH
{ field: { $regex: value, $options: 'i' } } → { field: { [Op.iLike]: `%${value}%` } }

// ARRAY OPERATIONS
{ field: { $in: [values] } } → { field: { [Op.in]: [values] } }
```

## Critical Files Status:

### 1. users.js - HIGH PRIORITY
- Multiple findById, findByIdAndUpdate, save() calls
- Used for authentication and user management
- **Impact**: Login, registration, profile updates will fail

### 2. interviews.js - MEDIUM PRIORITY  
- Uses findById, populate, save()
- **Impact**: Interview scheduling features will fail

### 3. adminJobs.js - LOW PRIORITY
- Admin-only features
- **Impact**: Admin job moderation will fail

### 4. employerCandidates.js - LOW PRIORITY
- Employer candidate management
- **Impact**: Employer viewing candidates will fail

## Recommendation:
Focus on fixing **users.js** next as it's critical for authentication and core functionality.
