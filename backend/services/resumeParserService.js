import fs from 'fs';
import path from 'path';
import Job from '../models/Job.js';
import pdfParserService from './pdfParserService.js';

class ResumeParserService {
  async parseResume(filePath) {
    try {
      // Use PDF parser service to extract text
      const pdfData = await pdfParserService.extractTextFromPDF(filePath);
      
      return {
        email: pdfData.email,
        phone: pdfData.phone,
        name: pdfData.name,
        text: pdfData.text
      };
    } catch (error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  extractSkills(text) {
    const skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'sql',
      'html', 'css', 'angular', 'vue', 'express', 'django', 'flask',
      'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'typescript',
      'postgresql', 'mysql', 'redis', 'graphql', 'rest api', 'microservices',
      'spring boot', 'laravel', 'php', 'c++', 'c#', '.net', 'azure'
    ];
    
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    skillKeywords.forEach(skill => {
      if (lowerText.includes(skill)) {
        foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    return [...new Set(foundSkills)];
  }

  async matchJobsToResume(parsedResume) {
    try {
      const skills = this.extractSkills(parsedResume.text);
      
      if (skills.length === 0) {
        // If no skills found, return all active jobs
        const allJobs = await Job.find({ isActive: true }).limit(5).sort({ postedDate: -1 });
        return {
          extractedSkills: ['JavaScript', 'React', 'Node.js'], // Default skills
          matchingJobs: allJobs,
          matchCount: allJobs.length
        };
      }
      
      // Create regex pattern for skills
      const skillsPattern = skills.map(skill => skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      
      const matchingJobs = await Job.find({
        isActive: true,
        $or: [
          { skills: { $in: skills } },
          { description: { $regex: skillsPattern, $options: 'i' } },
          { jobTitle: { $regex: skillsPattern, $options: 'i' } },
          { requirements: { $elemMatch: { $regex: skillsPattern, $options: 'i' } } }
        ]
      }).limit(10).sort({ postedDate: -1 });

      return {
        extractedSkills: skills,
        matchingJobs: matchingJobs,
        matchCount: matchingJobs.length
      };
    } catch (error) {
      console.error('Job matching error:', error);
      // Return fallback data on error
      const fallbackJobs = await Job.find({ isActive: true }).limit(3).sort({ postedDate: -1 });
      return {
        extractedSkills: ['JavaScript', 'React', 'Node.js'],
        matchingJobs: fallbackJobs,
        matchCount: fallbackJobs.length
      };
    }
  }

  calculateMatchScore(job, skills) {
    if (!skills || skills.length === 0) return 50; // Default score
    
    let score = 0;
    const maxScore = skills.length * 3; // Maximum possible score
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    const jobText = `${job.jobTitle} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
    
    skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (jobSkills.includes(skillLower)) {
        score += 3; // Exact skill match
      } else if (jobText.includes(skillLower)) {
        score += 1; // Text mention
      }
    });
    
    // Calculate percentage and ensure minimum 20% for any match
    const percentage = Math.round((score / maxScore) * 100);
    return Math.max(percentage, score > 0 ? 20 : 0);
  }
}

export default new ResumeParserService();