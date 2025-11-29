import type { ResumeKey } from "../../lib/redux/types";
import type {
  Line,
  Lines,
  ResumeSectionToLines,
} from "./types";

export const PROFILE_SECTION: ResumeKey = "profile";

export const groupLinesIntoSections = (lines: Lines) => {
  let sections: ResumeSectionToLines = {};
  let sectionName: string = PROFILE_SECTION;
  let sectionLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = line[0]?.text.trim();
    if (isSectionTitle(line, i)) {
      sections[sectionName] = [...sectionLines];
      sectionName = text;
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }
  if (sectionLines.length > 0) {
    sections[sectionName] = [...sectionLines];
  }
  return sections;
};

const SECTION_TITLE_KEYWORDS = [
  "experience", "education", "project", "skill",
  "job", "course", "objective", "summary", "award"
];

const isSectionTitle = (line: Line, lineNumber: number) => {
  if (lineNumber < 2 || line.length !== 1) return false;
  
  const textItem = line[0];
  const text = textItem.text.trim();
  
  // Check if bold and uppercase
  const isBold = textItem.fontName?.includes('Bold') || false;
  const isUpperCase = text === text.toUpperCase();
  
  if (isBold && isUpperCase) return true;
  
  // Fallback: keyword matching
  return SECTION_TITLE_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
};