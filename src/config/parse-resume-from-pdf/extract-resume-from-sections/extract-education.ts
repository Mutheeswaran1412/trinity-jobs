import type { ResumeSectionToLines } from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";

export const extractEducation = (sections: ResumeSectionToLines) => {
  const educationLines = getSectionLinesByKeywords(sections, ["education"]);
  const textItems = educationLines.flat();
  
  const educations = [];
  let currentEducation: any = {};
  
  for (const item of textItems) {
    const text = item.text.trim();
    
    if (isSchool(text)) {
      if (currentEducation.school) {
        educations.push(currentEducation);
        currentEducation = {};
      }
      currentEducation.school = text;
    } else if (isDegree(text)) {
      currentEducation.degree = text;
    } else if (isDate(text)) {
      currentEducation.date = text;
    } else if (text.length > 10) {
      currentEducation.descriptions = currentEducation.descriptions || [];
      currentEducation.descriptions.push(text);
    }
  }
  
  if (currentEducation.school) {
    educations.push(currentEducation);
  }
  
  return { educations };
};

const isSchool = (text: string): boolean => {
  const keywords = ['university', 'college', 'institute', 'school'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isDegree = (text: string): boolean => {
  const keywords = ['bachelor', 'master', 'phd', 'associate', 'diploma'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isDate = (text: string): boolean => {
  return /\b(19|20)\d{2}\b/.test(text);
};