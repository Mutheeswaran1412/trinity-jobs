import type { ResumeSectionToLines, Lines } from "../../types";

export const getSectionLinesByKeywords = (
  sections: ResumeSectionToLines,
  keywords: string[]
): Lines => {
  const lines: Lines = [];
  
  for (const [sectionName, sectionLines] of Object.entries(sections)) {
    const matchesKeyword = keywords.some(keyword => 
      sectionName.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (matchesKeyword && sectionLines) {
      lines.push(...sectionLines);
    }
  }
  
  return lines;
};