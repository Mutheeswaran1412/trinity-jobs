const API_BASE_URL = 'http://localhost:5000';
const SUGGEST_API_URL = 'http://localhost:5000/api/suggest';

class MistralAIService {
  private async callBackendAPI(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-suggestions/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend API call failed:', error);
      throw error;
    }
  }

  async getJobTitleSuggestions(input: string): Promise<string[]> {
    try {
      const response = await fetch(`${SUGGEST_API_URL}?q=${encodeURIComponent(input)}&type=job`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      return this.getFallbackJobTitles(input);
    }
  }

  async getSkillSuggestions(input: string): Promise<string[]> {
    try {
      const response = await fetch(`${SUGGEST_API_URL}?q=${encodeURIComponent(input)}&type=skill`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      return this.getFallbackSkills(input);
    }
  }

  async getLocationSuggestions(input: string): Promise<string[]> {
    try {
      const response = await fetch(`${SUGGEST_API_URL}?q=${encodeURIComponent(input)}&type=location`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      return this.getFallbackLocations(input);
    }
  }

  async generateJobDescription(jobTitle: string, company?: string, location?: string): Promise<string> {
    try {
      const response = await this.callBackendAPI('job-description', { jobTitle, company, location });
      return response.description || '';
    } catch (error) {
      return this.getFallbackJobDescription(jobTitle);
    }
  }

  // Fallback methods for when API fails
  private getFallbackJobTitles(input: string): string[] {
    const fallbacks: { [key: string]: string[] } = {
      'software': ['Software Developer', 'Software Engineer', 'Software Tester', 'Software Architect'],
      'data': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'Data Architect'],
      'frontend': ['Frontend Developer', 'Frontend Engineer', 'UI Developer', 'React Developer'],
      'backend': ['Backend Developer', 'Backend Engineer', 'API Developer', 'Server Engineer'],
      'full': ['Full Stack Developer', 'Full Stack Engineer', 'Fullstack Developer'],
      'senior': ['Senior Developer', 'Senior Engineer', 'Senior Architect', 'Senior Consultant']
    };

    const key = input.toLowerCase();
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (prefix.startsWith(key) || key.includes(prefix)) {
        return suggestions;
      }
    }
    return ['Software Developer', 'Software Engineer', 'Data Scientist', 'Product Manager'];
  }

  private getFallbackSkills(input: string): string[] {
    const fallbacks: { [key: string]: string[] } = {
      'py': ['Python', 'PyTorch', 'PySpark', 'Pytest'],
      'java': ['JavaScript', 'Java', 'jQuery', 'JSON'],
      'react': ['React', 'React Native', 'Redux', 'React Router'],
      'node': ['Node.js', 'Express.js', 'npm', 'Nodemon'],
      'aws': ['AWS', 'AWS Lambda', 'AWS S3', 'AWS EC2'],
      'azure': ['Azure', 'Azure Functions', 'Azure DevOps', 'Azure SQL'],
      'sql': ['SQL', 'MySQL', 'PostgreSQL', 'SQLite'],
      'git': ['Git', 'GitHub', 'GitLab', 'Bitbucket'],
      'docker': ['Docker', 'Docker Compose', 'Kubernetes', 'Container Orchestration'],
      'angular': ['Angular', 'AngularJS', 'TypeScript', 'RxJS'],
      'vue': ['Vue.js', 'Vuex', 'Vue Router', 'Nuxt.js'],
      'css': ['CSS', 'CSS3', 'Sass', 'SCSS'],
      'html': ['HTML', 'HTML5', 'Semantic HTML', 'Web Standards']
    };

    const key = input.toLowerCase();
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (prefix.startsWith(key)) {
        return suggestions;
      }
    }
    return ['JavaScript', 'Python', 'React', 'Node.js'];
  }

  private getFallbackLocations(input: string): string[] {
    const fallbacks: { [key: string]: string[] } = {
      'ch': ['Chennai', 'Chicago', 'Charlotte', 'Chandigarh'],
      'san': ['San Francisco', 'San Diego', 'San Jose', 'Santa Clara'],
      'new': ['New York', 'New Delhi', 'Newark', 'Newcastle'],
      'ban': ['Bangalore', 'Bangkok', 'Bangladesh', 'Bangor']
    };

    const key = input.toLowerCase();
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (prefix.startsWith(key)) {
        return suggestions;
      }
    }
    return ['New York', 'San Francisco', 'London', 'Bangalore'];
  }

  private getFallbackJobDescription(jobTitle: string): string {
    return `We are seeking a talented ${jobTitle} to join our dynamic team.

Key Responsibilities:
• Develop and maintain high-quality software solutions
• Collaborate with cross-functional teams to deliver projects
• Write clean, efficient, and well-documented code
• Participate in code reviews and technical discussions
• Stay updated with latest industry trends and technologies

Required Qualifications:
• Bachelor's degree in Computer Science or related field
• 3+ years of relevant experience
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

What We Offer:
• Competitive salary and benefits package
• Flexible working arrangements
• Professional development opportunities
• Collaborative and innovative work environment`;
  }
}

export default new MistralAIService();