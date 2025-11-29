import type { TextItem } from "../../types";

export const isBold = (item: TextItem): boolean => {
  return item.fontName.toLowerCase().includes('bold');
};

export const hasNumber = (item: TextItem): boolean => {
  return /\d/.test(item.text);
};

export const hasComma = (item: TextItem): boolean => {
  return item.text.includes(',');
};

export const hasLetter = (item: TextItem): boolean => {
  return /[a-zA-Z]/.test(item.text);
};

export const hasLetterAndIsAllUpperCase = (item: TextItem): boolean => {
  return hasLetter(item) && item.text === item.text.toUpperCase();
};

export const hasOnlyLettersSpacesAmpersands = (item: TextItem): boolean => {
  return /^[a-zA-Z\s&]+$/.test(item.text);
};