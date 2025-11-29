# Trinity Jobs AI Chatbot - Setup Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env
OPENAI_API_KEY=your_actual_api_key_here
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies (if not already installed)
cd ..
npm install
```

### 3. Initialize Knowledge Base
```bash
cd backend
python ingest.py
```

### 4. Start Services

#### Option A: Manual Start
```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
npm run dev
```

#### Option B: Docker (Recommended)
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 5. Test the Chatbot
```bash
cd backend
python test_chatbot.py
```

## 🏗️ Architecture

```
Frontend (React) → FastAPI Backend → AI Services
                                   ├── ChromaDB (Vector Storage)
                                   ├── OpenAI (LLM)
                                   ├── SentenceTransformers (Embeddings)
                                   └── Redis (Session Memory)
```

## 📁 Project Structure

```
trinity-jobs-ai-chatbot/
├── backend/
│   ├── app/
│   │   ├── chat/          # Chat API endpoints
│   │   ├── rag/           # RAG retrieval system
│   │   └── memory/        # Session management
│   ├── ingest.py          # Knowledge base ingestion
│   └── requirements.txt   # Python dependencies
├── kb/                    # Knowledge base files
├── src/components/
│   └── ChatWidget.tsx     # Updated chat UI
└── docker-compose.yml     # Container orchestration
```

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `REDIS_URL`: Redis connection string (optional)
- `API_HOST`: Backend host (default: 0.0.0.0)
- `API_PORT`: Backend port (default: 8000)

### Knowledge Base
Add your documents to the `kb/` directory:
- `.txt` files for text content
- `.pdf` files for PDF documents
- `.docx` files for Word documents

## 🧪 Testing

### Manual Testing
1. Open your website with the updated ChatWidget
2. Click the chat button
3. Ask questions like:
   - "What job openings do you have?"
   - "How do I upload my resume?"
   - "Tell me about Trinity Jobs"

### API Testing
```bash
# Test ingestion
curl -X POST http://localhost:8000/api/ingest

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What jobs are available?", "session_id": "test"}'
```

## 🔍 Features

### ✅ Implemented
- **RAG Pipeline**: Context-aware responses using your knowledge base
- **Session Memory**: Maintains conversation context
- **Multi-language Support**: English and Tamil responses
- **Source Attribution**: Shows which documents were used
- **Fallback Handling**: Graceful error handling
- **Real-time Chat**: Instant responses with loading indicators

### 🚧 Customization Options
- **System Prompts**: Modify prompts in `chat/service.py`
- **Embedding Model**: Change model in `rag/retriever.py`
- **Chunk Size**: Adjust text chunking parameters
- **Response Length**: Modify max_tokens in OpenAI calls

## 🛠️ Troubleshooting

### Common Issues

1. **"No module named 'app'"**
   ```bash
   cd backend
   export PYTHONPATH=$PYTHONPATH:$(pwd)
   python -m uvicorn app.main:app --reload
   ```

2. **OpenAI API errors**
   - Verify your API key in `.env`
   - Check your OpenAI account has credits

3. **ChromaDB permission errors**
   ```bash
   sudo chown -R $USER:$USER ./chroma_db
   ```

4. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check CORS settings in `main.py`

### Performance Optimization
- Use Redis for production (better than in-memory storage)
- Consider using a more powerful embedding model
- Implement caching for frequent queries
- Add rate limiting for production use

## 🔐 Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables in production
- Implement proper authentication for production
- Consider adding input sanitization
- Monitor API usage and costs

## 📈 Monitoring

### Logs
```bash
# Backend logs
docker-compose logs backend

# All services
docker-compose logs -f
```

### Metrics to Track
- Response time per query
- Knowledge base hit rate
- User session duration
- API error rates

## 🚀 Production Deployment

### Environment Setup
1. Set up proper environment variables
2. Use a production Redis instance
3. Configure proper logging
4. Set up monitoring and alerts
5. Implement backup for ChromaDB

### Scaling Considerations
- Use multiple backend instances behind a load balancer
- Implement database connection pooling
- Consider using a managed vector database
- Add caching layers for better performance

---

**Need Help?** Check the logs or create an issue in the repository.