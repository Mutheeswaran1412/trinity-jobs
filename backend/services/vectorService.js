import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

class VectorService {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.indexName = process.env.PINECONE_INDEX || 'trinity-jobs';
  }

  async getIndex() {
    return this.pinecone.index(this.indexName);
  }

  async createEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  async upsertJobEmbedding(jobId, jobData) {
    try {
      const text = `${jobData.title} ${jobData.description} ${jobData.requirements} ${jobData.location}`;
      const embedding = await this.createEmbedding(text);
      
      const index = await this.getIndex();
      await index.upsert([{
        id: `job_${jobId}`,
        values: embedding,
        metadata: {
          type: 'job',
          jobId,
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
        }
      }]);
    } catch (error) {
      console.error('Error upserting job embedding:', error);
    }
  }

  async upsertResumeEmbedding(userId, resumeData) {
    try {
      const text = `${resumeData.skills?.join(' ')} ${resumeData.experience} ${resumeData.education}`;
      const embedding = await this.createEmbedding(text);
      
      const index = await this.getIndex();
      await index.upsert([{
        id: `resume_${userId}`,
        values: embedding,
        metadata: {
          type: 'resume',
          userId,
          skills: resumeData.skills,
        }
      }]);
    } catch (error) {
      console.error('Error upserting resume embedding:', error);
    }
  }

  async findSimilarJobs(resumeText, topK = 10) {
    try {
      const embedding = await this.createEmbedding(resumeText);
      const index = await this.getIndex();
      
      const queryResponse = await index.query({
        vector: embedding,
        topK,
        filter: { type: 'job' },
        includeMetadata: true,
      });

      return queryResponse.matches.map(match => ({
        jobId: match.metadata.jobId,
        score: match.score,
        title: match.metadata.title,
        company: match.metadata.company,
        location: match.metadata.location,
      }));
    } catch (error) {
      console.error('Error finding similar jobs:', error);
      return [];
    }
  }

  async findSimilarCandidates(jobText, topK = 10) {
    try {
      const embedding = await this.createEmbedding(jobText);
      const index = await this.getIndex();
      
      const queryResponse = await index.query({
        vector: embedding,
        topK,
        filter: { type: 'resume' },
        includeMetadata: true,
      });

      return queryResponse.matches.map(match => ({
        userId: match.metadata.userId,
        score: match.score,
        skills: match.metadata.skills,
      }));
    } catch (error) {
      console.error('Error finding similar candidates:', error);
      return [];
    }
  }
}

export default new VectorService();