import type { ResumeSectionToLines } from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";

export const extractSkills = (sections: ResumeSectionToLines) => {
  const skillsLines = getSectionLinesByKeywords(sections, ["skills", "technologies"]);
  const textItems = skillsLines.flat();
  
  const descriptions: string[] = [];
  const featuredSkills: Array<{ skill: string }> = [];
  
  for (const item of textItems) {
    const text = item.text.trim();
    
    if (text.includes(',')) {
      const skillList = text.split(',').map(s => s.trim());
      descriptions.push(...skillList);
      skillList.forEach(skill => {
        if (skill.length > 1) {
          featuredSkills.push({ skill });
        }
      });
    } else if (text.length > 2 && text.length < 30) {
      descriptions.push(text);
      featuredSkills.push({ skill: text });
    }
  }
  
  return {
    skills: {
      descriptions: [...new Set(descriptions)],
      featuredSkills: featuredSkills.slice(0, 6)
    }
  };
};