import { TextItem } from './types';

export const extractSkills = (textItems: TextItem[]): string[] => {
  const skillsItems = findSkillsSection(textItems);
  return parseSkillsItems(skillsItems);
};

const findSkillsSection = (textItems: TextItem[]): TextItem[] => {
  const skillsKeywords = ['skills', 'technologies', 'competencies'];
  let startIndex = -1;
  let endIndex = textItems.length;

  for (let i = 0; i < textItems.length; i++) {
    const text = textItems[i].text.toLowerCase();
    if (skillsKeywords.some(keyword => text.includes(keyword)) && textItems[i].bold) {
      startIndex = i + 1;
      break;
    }
  }

  if (startIndex > -1) {
    const nextSectionKeywords = ['experience', 'education', 'projects'];
    for (let i = startIndex; i < textItems.length; i++) {
      const text = textItems[i].text.toLowerCase();
      if (nextSectionKeywords.some(keyword => text.includes(keyword)) && textItems[i].bold) {
        endIndex = i;
        break;
      }
    }
  }

  return startIndex > -1 ? textItems.slice(startIndex, endIndex) : [];
};

const parseSkillsItems = (items: TextItem[]): string[] => {
  const skills: string[] = [];
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql',
    'git', 'docker', 'aws', 'azure', 'mongodb', 'postgresql', 'typescript',
    'angular', 'vue', 'express', 'django', 'flask', 'spring', 'kubernetes'
  ];

  for (const item of items) {
    const text = item.text.toLowerCase();
    
    // Check for comma-separated skills
    if (text.includes(',')) {
      const skillList = text.split(',').map(s => s.trim());
      skills.push(...skillList.filter(skill => skill.length > 1));
    } else {
      // Check against common skills
      const foundSkill = commonSkills.find(skill => text.includes(skill));
      if (foundSkill) {
        skills.push(foundSkill);
      } else if (text.length > 2 && text.length < 20) {
        skills.push(text);
      }
    }
  }

  return [...new Set(skills)]; // Remove duplicates
};