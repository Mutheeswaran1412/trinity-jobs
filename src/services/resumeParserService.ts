interface JobMatch {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  skills?: string[];
  matchScore?: number;
}

export class ResumeParserService {
  async parseAndMatchJobs(file: File) {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Resume parsing failed');
      }
      
      const result = await response.json();
      
      return {
        parsedData: {
          email: result.parsedData?.email || '',
          phone: result.parsedData?.phone || '',
          extractedSkills: result.parsedData?.extractedSkills || []
        },
        jobMatches: result.jobMatches || { count: 0, jobs: [] }
      };
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  private extractSkills(resume: any): string[] {
    const skills: string[] = [];
    
    // Extract from skills section
    if (resume.skills?.descriptions) {
      resume.skills.descriptions.forEach((desc: string) => {
        const skillWords = desc.toLowerCase().split(/[,\s]+/);
        skills.push(...skillWords.filter(word => word.length > 2));
      });
    }
    
    // Extract from work experience
    if (resume.workExperiences) {
      resume.workExperiences.forEach((exp: any) => {
        exp.descriptions?.forEach((desc: string) => {
          const techWords = desc.match(/\b(javascript|python|react|node|sql|aws|docker|git)\b/gi);
          if (techWords) skills.push(...techWords.map(w => w.toLowerCase()));
        });
      });
    }
    
    return [...new Set(skills)];
  }

  private async matchJobs(skills: string[]) {
    try {
      const response = await fetch('/api/resume/match-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      });
      
      if (!response.ok) throw new Error('Job matching failed');
      
      return await response.json();
    } catch (error) {
      return { count: 0, jobs: [] };
    }
  }
}

export default new ResumeParserService();