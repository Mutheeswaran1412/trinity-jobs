#!/usr/bin/env python3
"""
Trinity Jobs Knowledge Base Ingestion Script
Usage: python ingest.py
"""

import asyncio
import os
from app.rag.simple_retriever import SimpleRAGRetriever

async def main():
    print("Starting Trinity Jobs Knowledge Base Ingestion...")
    
    # Create knowledge base directory if it doesn't exist
    kb_path = "./kb"
    if not os.path.exists(kb_path):
        os.makedirs(kb_path)
        print(f"Created knowledge base directory: {kb_path}")
    
    # Create sample knowledge base files
    sample_files = {
        "job_openings.txt": """Trinity Jobs - Current Job Openings

Software Engineer - Full Stack
Location: Chennai, Tamil Nadu
Experience: 2-5 years
Skills: React, Node.js, MongoDB, Python
Salary: ₹8-15 LPA

Data Scientist
Location: Bangalore, Karnataka  
Experience: 3-6 years
Skills: Python, Machine Learning, SQL, TensorFlow
Salary: ₹12-20 LPA

DevOps Engineer
Location: Hyderabad, Telangana
Experience: 2-4 years
Skills: AWS, Docker, Kubernetes, Jenkins
Salary: ₹10-18 LPA""",

        "company_info.txt": """About Trinity Jobs

Trinity Jobs is a leading job portal connecting talented professionals with top companies across India. 

Our Services:
- Job Search and Matching
- Resume Building and Enhancement
- Career Guidance and Coaching
- Interview Preparation
- Skill Assessment

Contact Information:
Email: support@trinityjobs.com
Phone: +91-9876543210
Address: Chennai, Tamil Nadu, India

How to Apply:
1. Create your profile on Trinity Jobs
2. Upload your resume
3. Browse job listings
4. Apply to relevant positions
5. Track your applications""",

        "faq.txt": """Trinity Jobs - Frequently Asked Questions

Q: How do I create an account?
A: Visit our website and click 'Register'. Fill in your details and verify your email.

Q: Is Trinity Jobs free to use?
A: Yes, job seekers can use Trinity Jobs completely free of charge.

Q: How do I upload my resume?
A: Go to your profile page and click 'Upload Resume'. We support PDF and DOC formats.

Q: How long does it take to hear back from employers?
A: Typically 3-7 business days, depending on the company's hiring process.

Q: Can I apply for multiple jobs?
A: Yes, you can apply for as many relevant positions as you like.

Q: Do you provide interview preparation?
A: Yes, we offer AI-powered interview coaching and practice sessions."""
    }
    
    # Create sample files
    for filename, content in sample_files.items():
        filepath = os.path.join(kb_path, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Created sample file: {filename}")
    
    # Initialize RAG retriever and ingest documents
    retriever = SimpleRAGRetriever()
    
    print("Processing documents...")
    doc_count = await retriever.ingest_documents()
    
    print(f"Successfully ingested {doc_count} document chunks")
    print("Knowledge base ingestion completed!")
    
    # Test retrieval
    print("\nTesting retrieval...")
    test_queries = [
        "What job openings are available?",
        "How do I upload my resume?",
        "What is Trinity Jobs?"
    ]
    
    for query in test_queries:
        context, sources = await retriever.retrieve(query)
        print(f"\nQuery: {query}")
        print(f"Retrieved context: {context[:100]}...")
        print(f"Sources: {sources}")

if __name__ == "__main__":
    asyncio.run(main())