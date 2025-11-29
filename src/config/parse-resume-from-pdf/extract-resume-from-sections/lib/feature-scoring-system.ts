import type { TextItem, FeatureSet, TextScores } from "../../types";

export const getTextWithHighestFeatureScore = (
  textItems: TextItem[],
  featureSets: FeatureSet[],
  returnFirstNMatches?: number,
  returnAllMatches?: boolean
): [string, TextScores] => {
  const textScores: TextScores = textItems.map(item => {
    let score = 0;
    let match = false;
    
    for (const featureSet of featureSets) {
      const [matcher, points, returnMatchingTextOnly] = featureSet;
      
      if (typeof matcher === 'function') {
        const result = matcher(item);
        if (result) {
          score += points;
          match = true;
        }
      }
    }
    
    return {
      text: item.text,
      score,
      match
    };
  });
  
  // Sort by score descending
  textScores.sort((a, b) => b.score - a.score);
  
  const bestMatch = textScores[0];
  const bestText = bestMatch?.text || '';
  
  return [bestText, textScores];
};