import { TextItem, ParsedResume } from './types';
import { extractProfile } from './extractProfile';
import { extractExperience } from './extractExperience';
import { extractEducation } from './extractEducation';
import { extractSkills } from './extractSkills';

export const parseResume = (textItems: TextItem[]): ParsedResume => {
  const profile = extractProfile(textItems);
  const experience = extractExperience(textItems);
  const education = extractEducation(textItems);
  const skills = extractSkills(textItems);

  return {
    ...profile,
    experience,
    education,
    skills
  };
};

export const mockParseResume = (): ParsedResume => {
  return {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    summary: 'Experienced software developer with 5+ years in full-stack development',
    experience: [
      {
        title: 'Senior Developer',
        company: 'Tech Corp',
        duration: '2020 - Present',
        description: 'Led development of web applications using React and Node.js'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        school: 'University of California',
        year: '2018'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
  };
};

export * from './types';