import { TextItem, WorkExperience } from './types';

export const extractExperience = (textItems: TextItem[]): WorkExperience[] => {
  const experienceItems = findExperienceSection(textItems);
  return parseExperienceItems(experienceItems);
};

const findExperienceSection = (textItems: TextItem[]): TextItem[] => {
  const experienceKeywords = ['experience', 'work', 'employment', 'career'];
  let startIndex = -1;
  let endIndex = textItems.length;

  // Find experience section start
  for (let i = 0; i < textItems.length; i++) {
    const text = textItems[i].text.toLowerCase();
    if (experienceKeywords.some(keyword => text.includes(keyword)) && textItems[i].bold) {
      startIndex = i + 1;
      break;
    }
  }

  // Find next section (education, skills, etc.)
  if (startIndex > -1) {
    const nextSectionKeywords = ['education', 'skills', 'projects'];
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

const parseExperienceItems = (items: TextItem[]): WorkExperience[] => {
  const experiences: WorkExperience[] = [];
  let currentExp: Partial<WorkExperience> = {};

  for (const item of items) {
    const text = item.text.trim();
    
    if (isJobTitle(text)) {
      if (currentExp.title) {
        experiences.push(currentExp as WorkExperience);
        currentExp = {};
      }
      currentExp.title = text;
    } else if (isCompany(text)) {
      currentExp.company = text;
    } else if (isDate(text)) {
      currentExp.duration = text;
    } else if (text.length > 20) {
      currentExp.description = text;
    }
  }

  if (currentExp.title) {
    experiences.push(currentExp as WorkExperience);
  }

  return experiences;
};

const isJobTitle = (text: string): boolean => {
  const jobTitleKeywords = ['developer', 'engineer', 'manager', 'analyst', 'intern', 'specialist'];
  return jobTitleKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isCompany = (text: string): boolean => {
  return text.length > 2 && text.length < 50 && !/\d{4}/.test(text);
};

const isDate = (text: string): boolean => {
  return /\d{4}/.test(text) || text.toLowerCase().includes('present');
};