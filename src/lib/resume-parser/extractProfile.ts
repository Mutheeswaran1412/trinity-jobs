import { TextItem, FeatureScore } from './types';

export const extractProfile = (textItems: TextItem[]) => {
  const profile = {
    name: extractName(textItems),
    email: extractEmail(textItems),
    phone: extractPhone(textItems),
    location: extractLocation(textItems)
  };

  return profile;
};

const extractName = (textItems: TextItem[]): string => {
  const scores: FeatureScore[] = textItems.map(item => ({
    text: item.text,
    score: calculateNameScore(item)
  }));

  const bestMatch = scores.reduce((prev, current) => 
    current.score > prev.score ? current : prev
  );

  return bestMatch.score > 0 ? bestMatch.text : '';
};

const extractEmail = (textItems: TextItem[]): string => {
  const emailRegex = /\S+@\S+\.\S+/;
  const emailItem = textItems.find(item => emailRegex.test(item.text));
  return emailItem ? emailItem.text : '';
};

const extractPhone = (textItems: TextItem[]): string => {
  const phoneRegex = /\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
  const phoneItem = textItems.find(item => phoneRegex.test(item.text));
  return phoneItem ? phoneItem.text : '';
};

const extractLocation = (textItems: TextItem[]): string => {
  const locationRegex = /[A-Z][a-zA-Z\s]+,\s[A-Z]{2}/;
  const locationItem = textItems.find(item => locationRegex.test(item.text));
  return locationItem ? locationItem.text : '';
};

const calculateNameScore = (item: TextItem): number => {
  let score = 0;
  
  // Letters, spaces, periods only
  if (/^[a-zA-Z\s.]+$/.test(item.text)) score += 3;
  
  // Bold text
  if (item.bold) score += 2;
  
  // Position (top of document)
  if (item.y > 700) score += 2;
  
  // Penalties
  if (item.text.includes('@')) score -= 4;
  if (/\d/.test(item.text)) score -= 4;
  if (item.text.includes(',')) score -= 4;
  
  return score;
};