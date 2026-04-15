// Smart ATS Score Calculator & Skill Analyzer

const calculateATSScore = (resumeSkills, jobSkills, resumeText = '', jobDescription = '') => {
  const normalizeSkill = (skill) => skill.toLowerCase().trim();
  
  const normalizedResumeSkills = resumeSkills.map(normalizeSkill);
  const normalizedJobSkills = jobSkills.map(normalizeSkill);

  // 1. Direct Skill Matching (40% weight)
  const matchingSkills = normalizedJobSkills.filter(skill => 
    normalizedResumeSkills.some(rs => 
      rs === skill || rs.includes(skill) || skill.includes(rs)
    )
  );
  const missingSkills = normalizedJobSkills.filter(skill => !matchingSkills.includes(skill));
  const skillMatchScore = normalizedJobSkills.length > 0 
    ? (matchingSkills.length / normalizedJobSkills.length) * 100 
    : 0;

  // 2. Keyword Matching from descriptions (25% weight)
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const keywordMatches = jobKeywords.filter(kw => 
    resumeKeywords.some(rk => rk === kw || rk.includes(kw) || kw.includes(rk))
  );
  const keywordScore = jobKeywords.length > 0 
    ? (keywordMatches.length / jobKeywords.length) * 100 
    : 50;

  // 3. Resume Structure Score (20% weight)
  const structureScore = calculateStructureScore(resumeText);

  // 4. Experience Relevance (15% weight)
  const experienceScore = calculateExperienceRelevance(resumeText, jobDescription);

  // Weighted total
  const totalScore = Math.round(
    (skillMatchScore * 0.40) +
    (keywordScore * 0.25) +
    (structureScore * 0.20) +
    (experienceScore * 0.15)
  );

  const matchPercentage = Math.round(
    normalizedJobSkills.length > 0 
      ? (matchingSkills.length / normalizedJobSkills.length) * 100 
      : 0
  );

  return {
    atsScore: Math.min(totalScore, 100),
    matchPercentage,
    matchingSkills: [...new Set(matchingSkills)],
    missingSkills: [...new Set(missingSkills)],
    breakdown: {
      skillMatch: Math.round(skillMatchScore),
      keywordMatch: Math.round(keywordScore),
      structureScore: Math.round(structureScore),
      experienceRelevance: Math.round(experienceScore)
    },
    suggestions: generateSuggestions(missingSkills, structureScore, keywordScore)
  };
};

const extractKeywords = (text) => {
  if (!text) return [];
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'this', 'that', 'these',
    'those', 'it', 'its', 'we', 'you', 'they', 'he', 'she', 'i', 'me',
    'my', 'your', 'our', 'their', 'his', 'her', 'from', 'as', 'not',
    'also', 'than', 'more', 'most', 'very', 'just', 'about', 'such',
    'into', 'over', 'after', 'before', 'between', 'under', 'above'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
};

const calculateStructureScore = (text) => {
  if (!text) return 40;
  let score = 50;
  
  const sections = ['education', 'experience', 'skills', 'projects', 'certification', 'summary', 'objective'];
  sections.forEach(section => {
    if (text.toLowerCase().includes(section)) score += 7;
  });
  
  // Check for contact info patterns
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) score += 5;
  if (/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text)) score += 3;
  if (/linkedin|github/i.test(text)) score += 5;
  
  return Math.min(score, 100);
};

const calculateExperienceRelevance = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) return 40;
  
  const resumeWords = new Set(extractKeywords(resumeText));
  const jobWords = extractKeywords(jobDescription);
  
  let matches = 0;
  jobWords.forEach(word => {
    if (resumeWords.has(word)) matches++;
  });
  
  return jobWords.length > 0 ? Math.min((matches / jobWords.length) * 120, 100) : 50;
};

const generateSuggestions = (missingSkills, structureScore, keywordScore) => {
  const suggestions = [];
  
  if (missingSkills.length > 0) {
    suggestions.push(`Add these missing skills to your resume: ${missingSkills.slice(0, 5).join(', ')}`);
  }
  if (missingSkills.length > 3) {
    suggestions.push('Consider taking online courses to fill major skill gaps');
  }
  if (structureScore < 60) {
    suggestions.push('Improve resume structure: add clear section headers (Education, Experience, Skills, Projects)');
  }
  if (keywordScore < 50) {
    suggestions.push('Include more relevant keywords from the job description in your resume');
  }
  if (structureScore < 70) {
    suggestions.push('Add contact information, LinkedIn/GitHub links to improve ATS parsing');
  }
  
  suggestions.push('Use action verbs to describe your achievements');
  suggestions.push('Quantify your accomplishments where possible (e.g., "Improved performance by 40%")');
  
  return suggestions;
};

// Analyze job description to extract structured info
const analyzeJobDescription = (jobDescriptionText) => {
  const text = jobDescriptionText.toLowerCase();
  
  // Common tech skills to detect
  const techSkillsDb = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'php', 'scala', 'r', 'matlab', 'sql', 'nosql', 'html', 'css', 'sass', 'less',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'gatsby', 'express', 'nest.js',
    'django', 'flask', 'fastapi', 'spring boot', 'rails', 'laravel', '.net', 'asp.net',
    'node.js', 'deno', 'bun', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'firebase', 'supabase', 'graphql', 'rest api', 'grpc',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'jenkins',
    'ci/cd', 'git', 'github', 'gitlab', 'bitbucket', 'linux', 'nginx', 'apache',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'nlp',
    'computer vision', 'data science', 'data analysis', 'pandas', 'numpy', 'spark',
    'hadoop', 'airflow', 'kafka', 'rabbitmq', 'microservices', 'serverless',
    'agile', 'scrum', 'jira', 'figma', 'sketch', 'adobe xd', 'photoshop',
    'tailwind', 'bootstrap', 'material ui', 'chakra ui', 'storybook',
    'jest', 'cypress', 'selenium', 'playwright', 'mocha', 'pytest',
    'redux', 'mobx', 'zustand', 'webpack', 'vite', 'rollup', 'babel',
    'oauth', 'jwt', 'blockchain', 'solidity', 'web3', 'three.js', 'd3.js',
    'power bi', 'tableau', 'excel', 'sap', 'salesforce', 'hubspot'
  ];

  const detectedSkills = techSkillsDb.filter(skill => text.includes(skill));

  // Experience detection
  let experienceRequired = 'Not specified';
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/);
  if (expMatch) {
    experienceRequired = `${expMatch[1]}+ years`;
  } else if (text.includes('entry level') || text.includes('junior') || text.includes('fresher')) {
    experienceRequired = '0-1 years (Entry Level)';
  } else if (text.includes('mid level') || text.includes('intermediate')) {
    experienceRequired = '2-5 years (Mid Level)';
  } else if (text.includes('senior') || text.includes('lead')) {
    experienceRequired = '5+ years (Senior Level)';
  }

  // Job type detection
  let jobType = 'full-time';
  if (text.includes('part-time') || text.includes('part time')) jobType = 'part-time';
  if (text.includes('contract')) jobType = 'contract';
  if (text.includes('internship') || text.includes('intern')) jobType = 'internship';
  if (text.includes('remote') || text.includes('work from home')) jobType = 'remote';

  return {
    extractedSkills: [...new Set(detectedSkills)],
    experienceRequired,
    jobType,
    keyTerms: extractKeywords(jobDescriptionText).slice(0, 20)
  };
};

module.exports = { calculateATSScore, analyzeJobDescription, extractKeywords };
