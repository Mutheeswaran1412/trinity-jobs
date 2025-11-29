import type { ResumeProfile } from "../../../lib/redux/types";
import type { ResumeSectionToLines } from "../types";
import { getSectionLinesByKeywords } from "./lib/get-section-lines";

export const extractProfile = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["profile", "summary", "objective"]);
  
  let name = "";
  let email = "";
  let phone = "";
  let url = "";
  let summary = "";
  let location = "";

  for (const line of lines) {
    const text = line.text;
    
    if (text.includes("@") && text.includes(".")) {
      email = text.trim();
    } else if (text.match(/[\+]?[1-9]?[\d\s\-\(\)]{10,}/)) {
      phone = text.trim();
    } else if (text.includes("http") || text.includes("www.")) {
      url = text.trim();
    } else if (text.length > 50) {
      summary = text.trim();
    } else if (!name && text.length > 2 && text.length < 50) {
      name = text.trim();
    } else if (text.includes(",") && text.length < 100) {
      location = text.trim();
    }
  }

  const profile: ResumeProfile = {
    name,
    email,
    phone,
    url,
    summary,
    location,
  };

  return { profile };
};