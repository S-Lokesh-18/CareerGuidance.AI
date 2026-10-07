import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves'
]);

/**
 * Tokenize, filter stopwords, and stem text
 */
export function preprocessText(text = '') {
  if (!text) return { rawTokens: [], stems: [], normalizedText: '' };

  const rawTokens = tokenizer.tokenize(text.toLowerCase()) || [];
  const filteredTokens = rawTokens.filter(
    (token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token)
  );
  const stems = filteredTokens.map((token) => stemmer.stem(token));

  return {
    rawTokens: filteredTokens,
    stems,
    normalizedText: stems.join(' ')
  };
}

/**
 * Compute TF-IDF Cosine Similarity between Resume text and Target description
 */
export function calculateCosineSimilarity(resumeText, targetText) {
  const resumePrep = preprocessText(resumeText);
  const targetPrep = preprocessText(targetText);

  if (!resumePrep.stems.length || !targetPrep.stems.length) {
    return 0;
  }

  const tfidf = new natural.TfIdf();
  tfidf.addDocument(resumePrep.stems.join(' '));
  tfidf.addDocument(targetPrep.stems.join(' '));

  const allTerms = new Set([...resumePrep.stems, ...targetPrep.stems]);

  let dotProduct = 0;
  let normResume = 0;
  let normTarget = 0;

  for (const term of allTerms) {
    let weightResume = 0;
    let weightTarget = 0;

    tfidf.tfidfs(term, (i, measure) => {
      if (i === 0) weightResume = measure;
      if (i === 1) weightTarget = measure;
    });

    dotProduct += weightResume * weightTarget;
    normResume += weightResume * weightResume;
    normTarget += weightTarget * weightTarget;
  }

  if (normResume === 0 || normTarget === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normResume) * Math.sqrt(normTarget));
  return Math.min(1, Math.max(0, similarity));
}

/**
 * Find matching and missing keywords between resume and target skills/text
 */
export function analyzeKeywords(resumeText, expectedSkills = [], jobDescription = '') {
  const resumeLower = (resumeText || '').toLowerCase();
  const resumeTokens = new Set(tokenizer.tokenize(resumeLower) || []);
  const resumeStems = new Set(Array.from(resumeTokens).map((t) => stemmer.stem(t)));

  const matchedKeywords = [];
  const missingKeywords = [];

  // 1. Check required explicit skills
  expectedSkills.forEach((skill) => {
    const skillName = typeof skill === 'string' ? skill : skill.skill;
    const skillTokens = tokenizer.tokenize(skillName.toLowerCase()) || [];
    const skillStems = skillTokens.map((t) => stemmer.stem(t));

    // Direct substring or stem match
    const hasDirect = resumeLower.includes(skillName.toLowerCase());
    const hasStems = skillStems.every((s) => resumeStems.has(s));

    if (hasDirect || hasStems) {
      matchedKeywords.push(skillName);
    } else {
      missingKeywords.push(skillName);
    }
  });

  // 2. If a custom job description was also provided, extract salient words
  if (jobDescription && jobDescription.trim().length > 0) {
    const jobPrep = preprocessText(jobDescription);
    const jobUniqueTerms = [...new Set(jobPrep.rawTokens)].slice(0, 30);

    jobUniqueTerms.forEach((word) => {
      const stemmed = stemmer.stem(word);
      const matched = resumeStems.has(stemmed) || resumeLower.includes(word);
      if (!matched && !missingKeywords.includes(word) && !matchedKeywords.includes(word)) {
        if (word.length >= 4) {
          missingKeywords.push(word);
        }
      } else if (matched && !matchedKeywords.includes(word)) {
        matchedKeywords.push(word);
      }
    });
  }

  return {
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 15),
  };
}

export default {
  preprocessText,
  calculateCosineSimilarity,
  analyzeKeywords,
};
