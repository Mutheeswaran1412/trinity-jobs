# AI Stack Setup Guide (OpenAI + Vector DB)

## Overview
Your Trinity Jobs project now includes an enhanced AI stack with:
- **OpenAI GPT-3.5-turbo** for advanced text generation
- **Pinecone Vector Database** for semantic search and matching
- **Semantic job matching** using embeddings
- **Resume enhancement** with AI
- **Career advice** powered by AI

## Setup Instructions

### 1. Install AI Dependencies

```bash
cd backend
npm install openai@^4.20.1 @pinecone-database/pinecone@^1.1.2
```

### 2. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### Pinecone API Key
1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a free account
3. Create a new index named `trinity-jobs`
4. Set dimensions to `1536` (for OpenAI embeddings)
5. Copy your API key

### 3. Update Environment Variables

Update your `backend/.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your_actual_openai_key_here

# Pinecone Vector Database Configuration
PINECONE_API_KEY=your_actual_pinecone_key_here
PINECONE_INDEX=trinity-jobs
```

### 4. Create Pinecone Index

In Pinecone console:
- Index name: `trinity-jobs`
- Dimensions: `1536`
- Metric: `cosine`
- Pod type: `s1.x1` (free tier)

## New API Endpoints

### Semantic Matching
- `POST /api/ai/semantic-job-match` - Find jobs matching a resume using vectors
- `POST /api/ai/semantic-candidate-match` - Find candidates matching a job using vectors

### Indexing
- `POST /api/ai/index-job` - Index a job for semantic search
- `POST /api/ai/index-resume` - Index a resume for semantic search

### Enhanced AI Features
- `POST /api/ai/enhance-resume` - AI-powered resume enhancement
- `POST /api/ai/generate-job-description` - Generate job descriptions
- `POST /api/ai/career-advice` - Get personalized career advice

## Usage Examples

### Frontend Integration

```typescript
import aiVectorService from '../services/aiVectorService';

// Semantic job matching
const matches = await aiVectorService.semanticJobMatch(resumeData);

// Index resume for search
await aiVectorService.indexResume(resumeData);

// Enhance resume with AI
const enhancement = await aiVectorService.enhanceResumeWithAI(resumeData);
```

### Backend Integration

```javascript
import aiService from '../services/aiService.js';

// Index a new job
await aiService.indexJobForSearch(jobId, jobData);

// Find similar jobs
const matches = await aiService.semanticJobMatch(resumeData);
```

## Features

### 1. Semantic Job Matching
- Uses OpenAI embeddings to understand job requirements
- Matches candidates based on skills, experience, and education
- Provides similarity scores and AI analysis

### 2. Vector Search
- Fast semantic search across jobs and resumes
- Handles synonyms and related concepts
- Scalable to thousands of jobs/resumes

### 3. AI-Powered Enhancements
- Resume optimization suggestions
- Job description generation
- Personalized career advice

## Architecture

```
Frontend (React/TypeScript)
    ↓
AI Vector Service (TypeScript)
    ↓
Backend API Routes (/api/ai/*)
    ↓
AI Service (Node.js)
    ↓
┌─────────────────┬─────────────────┐
│   OpenAI API    │  Pinecone DB    │
│  (Embeddings &  │  (Vector Store) │
│   Completions)  │                 │
└─────────────────┴─────────────────┘
```

## Cost Considerations

### OpenAI Pricing (approximate)
- Embeddings: $0.0001 per 1K tokens
- GPT-3.5-turbo: $0.0015 per 1K tokens

### Pinecone Pricing
- Free tier: 1 index, 5M vectors
- Paid: $70/month for starter pod

## Next Steps

1. Set up your API keys
2. Test the semantic matching endpoints
3. Integrate with your job posting and resume upload flows
4. Monitor usage and costs
5. Consider upgrading to GPT-4 for better results

## Troubleshooting

- **401 Unauthorized**: Check your API keys
- **Index not found**: Ensure Pinecone index is created
- **Embedding errors**: Verify OpenAI API key and quota
- **Vector dimension mismatch**: Use 1536 dimensions for OpenAI embeddings