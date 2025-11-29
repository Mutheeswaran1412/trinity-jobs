import { TextItem, Education } from './types';

export const extractEducation = (textItems: TextItem[]): Education[] => {
  const educationItems = findEducationSection(textItems);
  return parseEducationItems(educationItems);
};

const findEducationSection = (textItems: TextItem[]): TextItem[] => {
  const educationKeywords = ['education', 'academic', 'qualification'];
  let startIndex = -1;
  let endIndex = textItems.length;

  for (let i = 0; i < textItems.length; i++) {
    const text = textItems[i].text.toLowerCase();
    if (educationKeywords.some(keyword => text.includes(keyword)) && textItems[i].bold) {
      startIndex = i + 1;
      break;
    }
  }

  if (startIndex > -1) {
    const nextSectionKeywords = ['experience', 'skills', 'projects'];
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

const parseEducationItems = (items: TextItem[]): Education[] => {
  const educations: Education[] = [];
  let currentEdu: Partial<Education> = {};

  for (const item of items) {
    const text = item.text.trim();
    
    if (isSchool(text)) {
      if (currentEdu.school) {
        educations.push(currentEdu as Education);
        currentEdu = {};
      }
      currentEdu.school = text;
    } else if (isDegree(text)) {
      currentEdu.degree = text;
    } else if (isYear(text)) {
      currentEdu.year = text;
    }
  }

  if (currentEdu.school) {
    educations.push(currentEdu as Education);
  }

  return educations;
};

const isSchool = (text: string): boolean => {
  const schoolKeywords = ['university', 'college', 'institute', 'school'];
  return schoolKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isDegree = (text: string): boolean => {
  const degreeKeywords = ['bachelor', 'master', 'phd', 'associate', 'diploma', 'b.s', 'm.s', 'b.a', 'm.a'];
  return degreeKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isYear = (text: string): boolean => {
  return /\b(19|20)\d{2}\b/.test(text);
};