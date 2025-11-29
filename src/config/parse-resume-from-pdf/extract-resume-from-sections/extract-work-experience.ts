import type { ResumeSectionToLines } from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";

export const extractWorkExperience = (sections: ResumeSectionToLines) => {
  const experienceLines = getSectionLinesByKeywords(sections, ["experience", "work"]);
  const textItems = experienceLines.flat();
  
  const workExperiences = [];
  let currentExp: any = {};
  
  for (const item of textItems) {
    const text = item.text.trim();
    
    if (isJobTitle(text)) {
      if (currentExp.jobTitle) {
        workExperiences.push(currentExp);
        currentExp = {};
      }
      currentExp.jobTitle = text;
    } else if (isCompany(text)) {
      currentExp.company = text;
    } else if (isDate(text)) {
      currentExp.date = text;
    } else if (text.length > 15) {
      currentExp.descriptions = currentExp.descriptions || [];
      currentExp.descriptions.push(text);
    }
  }
  
  if (currentExp.jobTitle) {
    workExperiences.push(currentExp);
  }
  
  return { workExperiences };
};

const isJobTitle = (text: string): boolean => {
  const keywords = ['developer', 'engineer', 'manager', 'analyst', 'intern'];
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
};

const isCompany = (text: string): boolean => {
  return text.length > 2 && text.length < 50 && !/\d{4}/.test(text);
};

const isDate = (text: string): boolean => {
  return /\d{4}/.test(text) || text.toLowerCase().includes('present');
};