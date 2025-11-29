export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bold?: boolean;
  fontSize?: number;
}

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary?: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface FeatureScore {
  text: string;
  score: number;
}