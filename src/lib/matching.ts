import { MatchBreakdown, ReportItem } from '../types';

// Common English and campus filler words to filter out for keyword extraction
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'near', 'by', 'of', 'and', 'or', 'for', 'to',
  'from', 'with', 'my', 'i', 'lost', 'found', 'please', 'someone', 'item', 'something',
  'color', 'colour', 'has', 'have', 'is', 'was', 'this', 'that', 'there', 'here',
  'around', 'about', 'just', 'some', 'any', 'college', 'campus'
]);

/**
 * Normalise text: remove accents, strip punctuation, lowercase, collapse spaces
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize and extract salient keywords
 */
export function extractKeywords(text: string | null | undefined): string[] {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Normalise college names to group common aliases (e.g., Poona College vs Puna College)
 */
export function canonicalCollege(name: string | null | undefined): string {
  const norm = normalizeText(name);
  if (!norm) return '';
  if (norm.includes('poona') || norm.includes('puna') || norm.includes('pcasc')) {
    return 'poona_college_arts_sci_comm';
  }
  if (norm.includes('fergusson')) return 'fergusson_college';
  if (norm.includes('modern')) return 'modern_college';
  if (norm.includes('wadia') || norm.includes('nowrosjee')) return 'wadia_college';
  if (norm.includes('coep')) return 'coep_tech_university';
  return norm;
}

/**
 * Simple Levenshtein distance for fuzzy substring/word comparison
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= an; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bn; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[an][bn];
}

/**
 * String similarity ratio (0 to 1)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Jaccard token overlap between two keyword lists (0 to 1)
 */
export function tokenOverlap(tokens1: string[], tokens2: string[]): {
  score: number;
  intersection: string[];
} {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  if (set1.size === 0 || set2.size === 0) {
    return { score: 0, intersection: [] };
  }
  const intersection: string[] = [];
  set1.forEach((item) => {
    if (set2.has(item)) {
      intersection.push(item);
    }
  });
  const unionSize = new Set([...tokens1, ...tokens2]).size;
  return {
    score: intersection.length / unionSize,
    intersection,
  };
}

/**
 * Compute smart match breakdown between a target item and a candidate item.
 * Target and candidate must be of opposite types (lost vs found).
 */
export function calculateMatchScore(
  target: ReportItem,
  candidate: ReportItem
): MatchBreakdown | null {
  // Only compare Lost with Found
  if (target.type === candidate.type) return null;
  // Don't compare with self
  if (target.id === candidate.id) return null;

  const reasons: string[] = [];
  let score = 0;

  // 1. College comparison (25 max points)
  const canonTargetCollege = canonicalCollege(target.college);
  const canonCandCollege = canonicalCollege(candidate.college);
  const collegeMatch =
    Boolean(canonTargetCollege && canonCandCollege && canonTargetCollege === canonCandCollege);

  if (collegeMatch) {
    score += 25;
    reasons.push(`Same College (${target.college || 'Campus'})`);
  } else if (canonTargetCollege && canonCandCollege) {
    // Different college penalty
    score -= 10;
  }

  // 2. Item Name comparison (35 max points)
  const itemNameSim = stringSimilarity(target.itemName, candidate.itemName);
  const targetNameTokens = extractKeywords(target.itemName);
  const candNameTokens = extractKeywords(candidate.itemName);
  const nameOverlap = tokenOverlap(targetNameTokens, candNameTokens);

  const bestNameScore = Math.max(itemNameSim, nameOverlap.score);
  if (bestNameScore > 0.3) {
    const itemPoints = Math.round(bestNameScore * 35);
    score += itemPoints;
    if (nameOverlap.intersection.length > 0) {
      reasons.push(`Matching item keywords: "${nameOverlap.intersection.join(', ')}"`);
    } else {
      reasons.push(`Similar item title: "${candidate.itemName}"`);
    }
  }

  // 3. Description keyword overlap (15 max points)
  const targetDescTokens = extractKeywords(target.description);
  const candDescTokens = extractKeywords(candidate.description);
  const descOverlap = tokenOverlap(targetDescTokens, candDescTokens);

  if (descOverlap.score > 0.15) {
    const descPoints = Math.min(15, Math.round(descOverlap.score * 20));
    score += descPoints;
    if (descOverlap.intersection.length > 0) {
      const sample = descOverlap.intersection.slice(0, 3).join(', ');
      reasons.push(`Common description details: ${sample}`);
    }
  }

  // 4. Campus / Building match (15 max points)
  const campusSim = stringSimilarity(target.campus, candidate.campus);
  const targetCampusTokens = extractKeywords(target.campus);
  const candCampusTokens = extractKeywords(candidate.campus);
  const campusOverlap = tokenOverlap(targetCampusTokens, candCampusTokens);
  const bestCampusScore = Math.max(campusSim, campusOverlap.score);
  const campusMatch = bestCampusScore > 0.4;

  if (campusMatch) {
    const campusPoints = Math.round(bestCampusScore * 15);
    score += campusPoints;
    reasons.push(`Campus area match: "${candidate.campus}"`);
  }

  // 5. Specific Location match (10 max points)
  const locationSim = stringSimilarity(target.location, candidate.location);
  const targetLocTokens = extractKeywords(target.location);
  const candLocTokens = extractKeywords(candidate.location);
  const locOverlap = tokenOverlap(targetLocTokens, candLocTokens);
  const bestLocScore = Math.max(locationSim, locOverlap.score);

  if (bestLocScore > 0.3) {
    const locPoints = Math.round(bestLocScore * 10);
    score += locPoints;
    reasons.push(`Spot location overlap: "${candidate.location}"`);
  }

  // 6. Category bonus (5 max points)
  if (
    target.category &&
    candidate.category &&
    normalizeText(target.category) === normalizeText(candidate.category)
  ) {
    score += 5;
    reasons.push(`Same category (${target.category})`);
  }

  // Bound score between 0 and 98 (Never guarantee 100% per instructions)
  const finalScore = Math.min(98, Math.max(0, score));

  // Collect all matched keywords
  const allMatchedKeywords = Array.from(
    new Set([...nameOverlap.intersection, ...descOverlap.intersection])
  );

  return {
    targetReportId: target.id,
    matchedReport: candidate,
    score: finalScore,
    reasons,
    matchedKeywords: allMatchedKeywords,
    collegeMatch,
    campusMatch,
    locationMatchScore: Math.round(bestLocScore * 100),
  };
}

/**
 * Find and rank all possible matches for a given report
 */
export function findPossibleMatches(
  target: ReportItem,
  allReports: ReportItem[],
  threshold = 35
): MatchBreakdown[] {
  const matches: MatchBreakdown[] = [];

  for (const candidate of allReports) {
    const result = calculateMatchScore(target, candidate);
    if (result && result.score >= threshold) {
      matches.push(result);
    }
  }

  // Sort highest match score first
  return matches.sort((a, b) => b.score - a.score);
}
