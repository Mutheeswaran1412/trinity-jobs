import type { ResumeSectionToLines } from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";

export const extractProject = (sections: ResumeSectionToLines) => {
  const projectLines = getSectionLinesByKeywords(sections, ["projects", "project"]);
  const textItems = projectLines.flat();
  
  const projects = [];
  let currentProject: any = {};
  
  for (const item of textItems) {
    const text = item.text.trim();
    
    if (isProjectName(text)) {
      if (currentProject.project) {
        projects.push(currentProject);
        currentProject = {};
      }
      currentProject.project = text;
    } else if (isDate(text)) {
      currentProject.date = text;
    } else if (text.length > 10) {
      currentProject.descriptions = currentProject.descriptions || [];
      currentProject.descriptions.push(text);
    }
  }
  
  if (currentProject.project) {
    projects.push(currentProject);
  }
  
  return { projects };
};

const isProjectName = (text: string): boolean => {
  return text.length > 3 && text.length < 100 && !/^\d+$/.test(text);
};

const isDate = (text: string): boolean => {
  return /\b(19|20)\d{2}\b/.test(text);
};