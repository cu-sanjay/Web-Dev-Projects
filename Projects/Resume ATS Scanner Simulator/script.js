(function () {
  'use strict';

  const state = {
    resume: '',
    jobDescription: '',
    keywordMatch: 0,
    sectionScore: 0,
    formatScore: 0,
    experienceScore: 0,
    atsScore: 0,
    matchedKeywords: [],
    missingKeywords: [],
    sections: [],
    suggestions: [],
    isScanning: false,
    lastScan: null
  };

  const STANDARD_SECTIONS = [
    { id: 'summary', label: 'Professional Summary', patterns: [/summary/i, /profile/i, /about me/i, /objective/i] },
    { id: 'experience', label: 'Work Experience', patterns: [/experience/i, /employment/i, /work history/i, /professional background/i] },
    { id: 'education', label: 'Education', patterns: [/education/i, /academic/i, /degree/i, /university/i, /college/i] },
    { id: 'skills', label: 'Skills', patterns: [/skills/i, /technologies/i, /competencies/i, /expertise/i, /technical skills/i] },
    { id: 'projects', label: 'Projects', patterns: [/projects/i, /portfolio/i, /personal projects/i] },
    { id: 'certifications', label: 'Certifications', patterns: [/certifications/i, /certificates/i, /licenses/i, /accreditations/i] },
    { id: 'languages', label: 'Languages', patterns: [/languages/i, /language proficiency/i] },
    { id: 'publications', label: 'Publications', patterns: [/publications/i, /papers/i, /research/i] }
  ];

  const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'shall', 'we', 'you', 'they', 'he', 'she', 'it', 'this', 'that', 'these', 'those',
    'our', 'your', 'their', 'its', 'his', 'her', 'from', 'as', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
    'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'because', 'about', 'which', 'who', 'whom', 'what', 'if', 'while',
    'also', 'any', 'been', 'being', 'has', 'have', 'having', 'does', 'doing', 'done',
    'get', 'got', 'getting', 'make', 'made', 'making', 'use', 'used', 'using',
    'work', 'worked', 'working', 'works', 'experience', 'including', 'including',
    'etc', 'including', 'per', 'able', 'via', 'well', 'within', 'without', 'yet',
    'amp', 'ndash', 'mdash', 'rsquo', 'lsquo', 'ldquo', 'rdquo'
  ]);

  const COMMON_TECH_KEYWORDS = new Set([
    'javascript', 'python', 'java', 'typescript', 'react', 'node', 'nodejs', 'node.js',
    'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'git', 'api', 'rest', 'graphql',
    'css', 'html', 'vue', 'angular', 'express', 'django', 'flask', 'spring', 'go',
    'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'terraform',
    'jenkins', 'ci/cd', 'linux', 'agile', 'scrum', 'jira', 'machine learning', 'ai',
    'data', 'cloud', 'microservices', 'devops', 'backend', 'frontend', 'fullstack'
  ]);

  const IMPORTANCE_WEIGHTS = {
    'javascript': 2, 'python': 2, 'java': 2, 'react': 2, 'aws': 2,
    'docker': 1.5, 'kubernetes': 1.5, 'sql': 1.5, 'git': 1, 'api': 1.5,
    'cloud': 1.5, 'machine learning': 2, 'data': 1.5, 'devops': 1.5,
    'leadership': 2, 'management': 2, 'strategy': 1.5
  };

  const $ = (id) => document.getElementById(id);

  const dom = {
    resumeInput: $('resume-input'),
    jdInput: $('jd-input'),
    resumeStats: $('resume-stats'),
    jdStats: $('jd-stats'),
    analysisStatus: $('analysis-status'),
    analysisStatusLabel: $('analysis-status-label'),
    analysisTimestamp: $('analysis-timestamp'),
    ringFill: $('ring-fill'),
    ringScore: $('ring-score'),
    sdKeywords: $('sd-keywords'),
    sdSections: $('sd-sections'),
    sdFormat: $('sd-format'),
    sdExperience: $('sd-experience'),
    matchContainer: $('match-container'),
    missingContainer: $('missing-container'),
    matchCountBadge: $('match-count-badge'),
    missingCountBadge: $('missing-count-badge'),
    sectionsContainer: $('sections-container'),
    sectionCountBadge: $('section-count-badge'),
    suggestionsContainer: $('suggestions-container'),
    suggestionCountBadge: $('suggestion-count-badge'),
    btnAnalyze: $('btn-analyze'),
    btnSample: $('btn-sample'),
    btnClear: $('btn-clear')
  };

  function now() {
    return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const SAMPLE_RESUME = `Alex Chen
alex.chen@email.com | (555) 234-5678 | linkedin.com/in/alexchen

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience building scalable web applications and microservices. Proficient in JavaScript, TypeScript, React, Node.js, and cloud infrastructure on AWS. Passionate about clean architecture, test-driven development, and mentoring junior engineers.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | San Francisco, CA
2021 - Present
- Led migration of monolithic application to microservices architecture, reducing deployment time by 70%
- Designed and implemented RESTful APIs handling 10M+ daily requests
- Built real-time data processing pipeline using AWS Lambda, SQS, and DynamoDB
- Mentored 4 junior engineers through code reviews and pair programming
- Reduced system latency by 40% through query optimization and caching strategies

Software Engineer | DataFlow Systems | Austin, TX
2018 - 2021
- Developed React-based dashboard serving 50K+ daily active users
- Implemented CI/CD pipelines using GitHub Actions and Docker
- Collaborated with product team to deliver 15+ features in agile environment
- Wrote comprehensive unit and integration tests achieving 90% code coverage
- Optimized PostgreSQL queries improving report generation speed by 60%

Junior Developer | StartUp Labs | Remote
2016 - 2018
- Built responsive web applications using React and Node.js
- Created automated testing suite reducing regression bugs by 45%
- Participated in daily standups and sprint planning sessions

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2016
GPA: 3.7/4.0 | Dean's List

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks: React, Node.js, Express, Next.js, Jest
Cloud & DevOps: AWS (Lambda, S3, DynamoDB, EC2, SQS), Docker, Kubernetes, Terraform
Tools: Git, GitHub Actions, Jenkins, Jira, Figma, Postman

CERTIFICATIONS
AWS Solutions Architect - Associate (2022)
Certified Kubernetes Administrator (2023)`;

  const SAMPLE_JD = `Senior Software Engineer

We are looking for an experienced Senior Software Engineer to join our growing platform team. You will design and build scalable systems that power our core product.

Requirements:
- 5+ years of professional software development experience
- Strong proficiency in JavaScript, TypeScript, and Node.js
- Experience with React or similar frontend frameworks
- Deep understanding of AWS services (Lambda, DynamoDB, S3)
- Experience with Docker and Kubernetes
- Knowledge of CI/CD pipelines and DevOps practices
- Strong problem-solving and communication skills
- Experience mentoring junior developers

Nice to have:
- Experience with microservices architecture
- Knowledge of GraphQL
- Experience with Terraform or Infrastructure as Code
- Background in real-time data processing

We offer competitive compensation, equity, and a collaborative remote-friendly culture.`;

  function updateStats() {
    const resume = dom.resumeInput.value;
    const jd = dom.jdInput.value;
    const rLines = resume ? resume.split('\n').length : 0;
    const rChars = resume.length;
    const jLines = jd ? jd.split('\n').length : 0;
    const jChars = jd.length;
    dom.resumeStats.textContent = rLines + ' lines | ' + rChars + ' chars';
    dom.jdStats.textContent = jLines + ' lines | ' + jChars + ' chars';
  }

  function setScanning(scanning) {
    state.isScanning = scanning;
    dom.btnAnalyze.disabled = scanning;
    dom.btnAnalyze.textContent = scanning ? 'Scanning...' : 'Scan Resume';
    if (scanning) {
      dom.analysisStatus.dataset.status = 'scanning';
      dom.analysisStatusLabel.textContent = 'Analyzing...';
    }
  }

  function extractKeywords(text) {
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);

    const multiWordTerms = [];
    const techTerms = [];

    const textLower = text.toLowerCase();

    const knownMultiWord = [
      'machine learning', 'artificial intelligence', 'data science', 'data engineering',
      'full stack', 'front end', 'back end', 'ci/cd', 'test driven development',
      'continuous integration', 'continuous deployment', 'software engineering',
      'software development', 'product management', 'project management',
      'agile development', 'deep learning', 'natural language processing',
      'computer science', 'information technology', 'web development',
      'mobile development', 'cloud computing', 'software architecture',
      'system design', 'rest api', 'data analysis', 'business intelligence',
      'quality assurance', 'user experience', 'customer success'
    ];

    for (const term of knownMultiWord) {
      if (textLower.includes(term)) {
        multiWordTerms.push(term);
        const words = term.split(/\s+/);
        for (const w of words) {
          const idx = tokens.indexOf(w);
          if (idx !== -1) tokens.splice(idx, 1);
        }
      }
    }

    for (const t of tokens) {
      if (COMMON_TECH_KEYWORDS.has(t) && !techTerms.includes(t)) {
        techTerms.push(t);
      }
    }

    const wordFreq = {};
    for (const t of tokens) {
      if (!STOP_WORDS.has(t) && !techTerms.includes(t) && t.length > 2 && !/^\d+$/.test(t)) {
        wordFreq[t] = (wordFreq[t] || 0) + 1;
      }
    }

    const sortedWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .filter(([, count]) => count >= 1)
      .slice(0, 60)
      .map(([word]) => word);

    const allTerms = [...multiWordTerms, ...techTerms, ...sortedWords];
    const seen = new Set();
    return allTerms.filter(t => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getKeywordWeight(keyword) {
    return IMPORTANCE_WEIGHTS[keyword.toLowerCase()] || 1;
  }

  function scanResume() {
    const resume = dom.resumeInput.value.trim();
    const jd = dom.jdInput.value.trim();

    if (!resume || !jd) {
      dom.analysisStatus.dataset.status = 'idle';
      dom.analysisStatusLabel.textContent = !resume && !jd ? 'Both resume and job description required' :
        !resume ? 'Resume text is required' : 'Job description is required';
      return;
    }

    setScanning(true);
    state.resume = resume;
    state.jobDescription = jd;

    dom.analysisStatus.dataset.status = 'scanning';
    dom.analysisStatusLabel.textContent = 'Analyzing...';

    setTimeout(() => {
      try {
        const results = performAnalysis(resume, jd);
        Object.assign(state, results);
        state.lastScan = new Date().toISOString();
        renderResults(results);
        dom.analysisStatus.dataset.status = 'complete';
        dom.analysisStatusLabel.textContent = 'Scan Complete';
        dom.analysisTimestamp.textContent = now();
        setScanning(false);
      } catch (err) {
        dom.analysisStatus.dataset.status = 'error';
        dom.analysisStatusLabel.textContent = 'Error: ' + err.message;
        setScanning(false);
      }
    }, 400);
  }

  function performAnalysis(resume, jd) {
    const jdKeywords = extractKeywords(jd);
    const resumeLower = resume.toLowerCase();

    const matched = [];
    const missing = [];

    for (const kw of jdKeywords) {
      if (resumeLower.includes(kw)) {
        matched.push({ keyword: kw, weight: getKeywordWeight(kw) });
      } else {
        missing.push({ keyword: kw, weight: getKeywordWeight(kw) });
      }
    }

    const weightedTotal = matched.reduce((s, m) => s + m.weight, 0) + missing.reduce((s, m) => s + m.weight, 0);
    const weightedMatched = matched.reduce((s, m) => s + m.weight, 0);
    const keywordMatchPct = weightedTotal > 0 ? Math.round((weightedMatched / weightedTotal) * 100) : 0;

    const sections = detectSections(resume);
    const sectionScore = sections.length > 0
      ? Math.round((sections.filter(s => s.found).length / sections.length) * 100)
      : 0;

    const formatScore = calculateFormatScore(resume);
    const experienceScore = calculateExperienceScore(resume, jd);

    const atsScore = Math.round(
      keywordMatchPct * 0.40 +
      sectionScore * 0.20 +
      formatScore * 0.20 +
      experienceScore * 0.20
    );

    const suggestions = generateSuggestions({ matched, missing, sections, formatScore, experienceScore, atsScore, keywordMatchPct, resume, jd });

    return {
      keywordMatch: keywordMatchPct,
      sectionScore,
      formatScore,
      experienceScore,
      atsScore,
      matchedKeywords: matched,
      missingKeywords: missing,
      sections,
      suggestions
    };
  }

  function detectSections(resume) {
    const lines = resume.split('\n');
    const foundSections = [];

    for (const section of STANDARD_SECTIONS) {
      let found = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 3 && trimmed.length < 50) {
          for (const pattern of section.patterns) {
            if (pattern.test(trimmed)) {
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      foundSections.push({ ...section, found });
    }

    return foundSections;
  }

  function calculateFormatScore(resume) {
    let score = 50;

    const lines = resume.split('\n').filter(l => l.trim());
    const wordCount = resume.split(/\s+/).length;

    if (wordCount >= 200 && wordCount <= 800) score += 15;
    else if (wordCount >= 100 && wordCount < 200) score += 8;
    else if (wordCount > 800) score += 5;
    else if (wordCount < 100) score -= 10;

    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resume);
    const hasPhone = /[\+(]?\d{1,3}[)]?[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/.test(resume);
    const hasLinkedIn = /linkedin\.com/i.test(resume);
    const hasBullets = /^[•\-*▶→]|\d+\.\s/m.test(resume);
    const hasLocation = /[A-Z][a-z]+(?:,\s*[A-Z]{2})/.test(resume) || /[A-Z][a-z]+\s*(?:,|–)\s*[A-Z]/.test(resume);

    if (hasEmail) score += 8;
    if (hasPhone) score += 6;
    if (hasLinkedIn) score += 6;
    if (hasBullets) score += 10;
    if (hasLocation) score += 5;

    const charCount = resume.length;
    if (charCount > 500 && charCount < 6000) score += 5;
    else if (charCount > 6000) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  function calculateExperienceScore(resume, jd) {
    let score = 50;

    const resumeLower = resume.toLowerCase();
    const jdLower = jd.toLowerCase();

    const yearPattern = /(\d+)(?:\+)?\s*years?(?:\s+of)?\s+(?:experience|development|engineering|work)/gi;
    const jdYears = [];
    let m;
    while ((m = yearPattern.exec(jdLower)) !== null) {
      jdYears.push(parseInt(m[1]));
    }
    const reqYears = jdYears.length > 0 ? Math.max(...jdYears) : 3;

    const resumeYears = [];
    while ((m = yearPattern.exec(resumeLower)) !== null) {
      resumeYears.push(parseInt(m[1]));
    }
    const hasYears = resumeYears.length > 0;
    const maxResumeYears = hasYears ? Math.max(...resumeYears) : 0;

    if (hasYears) {
      if (maxResumeYears >= reqYears) score += 20;
      else if (maxResumeYears >= reqYears - 1) score += 10;
      else score += 5;
    } else {
      score -= 5;
    }

    const seniorityLevels = ['junior', 'mid', 'senior', 'lead', 'staff', 'principal', 'manager', 'director', 'head', 'architect'];
    const jdSeniority = seniorityLevels.findIndex(l => jdLower.includes(l));
    const resumeSeniority = seniorityLevels.findIndex(l => resumeLower.includes(l));

    if (resumeSeniority >= 0 && jdSeniority >= 0) {
      if (resumeSeniority >= jdSeniority && resumeSeniority - jdSeniority <= 2) score += 10;
      else if (resumeSeniority >= jdSeniority - 1) score += 5;
    }

    const roleIndicators = ['managed', 'led', 'lead', 'mentor', 'architect', 'designed', 'developed', 'built', 'implemented'];
    const hasRoleIndicators = roleIndicators.filter(ind => resumeLower.includes(ind)).length;
    score += Math.min(hasRoleIndicators * 3, 15);

    return Math.max(0, Math.min(100, score));
  }

  function generateSuggestions(data) {
    const suggestions = [];

    if (data.atsScore < 40) {
      suggestions.push({
        type: 'critical',
        icon: 'alert-triangle',
        text: 'ATS score is critically low (' + data.atsScore + '). Significant keyword and content optimization needed to pass automated filters.'
      });
    } else if (data.atsScore < 60) {
      suggestions.push({
        type: 'warning',
        icon: 'alert-circle',
        text: 'ATS score is below average (' + data.atsScore + '). Focus on incorporating missing keywords and improving section completeness.'
      });
    } else if (data.atsScore < 80) {
      suggestions.push({
        type: 'improvement',
        icon: 'info',
        text: 'ATS score is moderate (' + data.atsScore + '). A few targeted improvements can boost compatibility significantly.'
      });
    } else {
      suggestions.push({
        type: 'positive',
        icon: 'check-circle',
        text: 'Excellent ATS score (' + data.atsScore + '). Resume is well-optimized for this position.'
      });
    }

    const criticalMissing = data.missing.filter(m => m.weight >= 2);
    if (criticalMissing.length > 0) {
      const kwList = criticalMissing.slice(0, 5).map(m => m.keyword).join(', ');
      suggestions.push({
        type: 'critical',
        icon: 'alert-triangle',
        text: 'Critical missing keywords: ' + kwList + '. These are highly valued by the ATS for this role.'
      });
    }

    if (data.matched.length < 5) {
      suggestions.push({
        type: 'critical',
        icon: 'alert-triangle',
        text: 'Only ' + data.matched.length + ' keywords matched. Consider tailoring your resume with more role-specific terminology.'
      });
    } else if (data.matched.length < 10) {
      suggestions.push({
        type: 'warning',
        icon: 'alert-circle',
        text: 'Moderate keyword match (' + data.matched.length + ' keywords). Review the job description and incorporate relevant terms.'
      });
    } else {
      suggestions.push({
        type: 'positive',
        icon: 'check-circle',
        text: 'Strong keyword coverage with ' + data.matched.length + ' matched keywords.'
      });
    }

    const missingSections = data.sections.filter(s => !s.found);
    if (missingSections.length > 0) {
      const names = missingSections.map(s => s.label).join(', ');
      suggestions.push({
        type: 'warning',
        icon: 'alert-circle',
        text: 'Missing resume sections: ' + names + '. Adding these sections improves ATS parsing accuracy.'
      });
    }

    if (data.formatScore < 60) {
      suggestions.push({
        type: 'warning',
        icon: 'alert-circle',
        text: 'Format score is low (' + data.formatScore + '). Ensure contact info (email, phone, LinkedIn) and bullet points are present.'
      });
    }

    if (data.experienceScore < 50) {
      suggestions.push({
        type: 'improvement',
        icon: 'info',
        text: 'Experience relevance is low. Quantify achievements with metrics and use action verbs like led, built, implemented.'
      });
    }

    const presentSections = data.sections.filter(s => s.found).map(s => s.label);
    if (presentSections.length >= 5) {
      suggestions.push({
        type: 'positive',
        icon: 'check-circle',
        text: 'Good section coverage (' + presentSections.length + ' sections detected). ATS parsers favor well-structured resumes.'
      });
    }

    if (data.keywordMatchPct < 100 && data.sections.find(s => s.id === 'skills' && s.found)) {
      suggestions.push({
        type: 'improvement',
        icon: 'info',
        text: 'Consider adding a dedicated "Technical Skills" section with the specific technologies mentioned in the job description.'
      });
    }

    return suggestions.slice(0, 10);
  }

  function renderResults(results) {
    const circumference = 534;
    const offset = circumference - (results.atsScore / 100) * circumference;
    dom.ringFill.style.strokeDashoffset = offset;
    dom.ringScore.textContent = results.atsScore;

    dom.sdKeywords.textContent = results.keywordMatch + '%';
    dom.sdKeywords.style.color = results.keywordMatch >= 80 ? 'var(--excellent)' :
      results.keywordMatch >= 60 ? 'var(--good)' :
      results.keywordMatch >= 40 ? 'var(--moderate)' : 'var(--poor)';

    dom.sdSections.textContent = results.sectionScore + '%';
    dom.sdSections.style.color = results.sectionScore >= 80 ? 'var(--excellent)' :
      results.sectionScore >= 60 ? 'var(--good)' : 'var(--moderate)';

    dom.sdFormat.textContent = results.formatScore + '%';
    dom.sdFormat.style.color = results.formatScore >= 80 ? 'var(--excellent)' :
      results.formatScore >= 60 ? 'var(--good)' :
      results.formatScore >= 40 ? 'var(--moderate)' : 'var(--poor)';

    dom.sdExperience.textContent = results.experienceScore + '%';
    dom.sdExperience.style.color = results.experienceScore >= 80 ? 'var(--excellent)' :
      results.experienceScore >= 60 ? 'var(--good)' :
      results.experienceScore >= 40 ? 'var(--moderate)' : 'var(--poor)';

    renderKeywords(results.matchedKeywords, results.missingKeywords);
    renderSections(results.sections);
    renderSuggestions(results.suggestions);
  }

  function renderKeywords(matched, missing) {
    dom.matchCountBadge.textContent = matched.length;
    dom.missingCountBadge.textContent = missing.length;

    if (matched.length === 0) {
      dom.matchContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg><p>No keywords matched</p></div>';
    } else {
      let html = '';
      for (const kw of matched) {
        const weightLabel = kw.weight > 1 ? ' <span class="kw-count">×' + kw.weight + '</span>' : '';
        html += '<span class="keyword-tag matched">' + escHtml(kw.keyword) + weightLabel + '</span>';
      }
      dom.matchContainer.innerHTML = html;
    }

    if (missing.length === 0) {
      dom.missingContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><p>All keywords matched!</p></div>';
    } else {
      let html = '';
      for (const kw of missing) {
        const weightLabel = kw.weight > 1 ? ' <span class="kw-count">×' + kw.weight + '</span>' : '';
        html += '<span class="keyword-tag missing">' + escHtml(kw.keyword) + weightLabel + '</span>';
      }
      dom.missingContainer.innerHTML = html;
    }
  }

  function renderSections(sections) {
    const found = sections.filter(s => s.found).length;
    dom.sectionCountBadge.textContent = found + '/' + sections.length;

    if (sections.length === 0) {
      dom.sectionsContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>No standard sections detected</p></div>';
      return;
    }

    const icons = {
      summary: '📋', experience: '💼', education: '🎓', skills: '⚡',
      projects: '🔧', certifications: '🏅', languages: '🌐', publications: '📄'
    };

    let html = '';
    for (const sec of sections) {
      html += '<div class="section-item">' +
        '<span class="section-icon">' + (icons[sec.id] || '📄') + '</span>' +
        '<div class="section-info">' +
        '<div class="section-name">' + sec.label + '</div>' +
        '<div class="section-status">' + (sec.found ? 'Detected' : 'Not found') + '</div>' +
        '</div>' +
        '<span class="section-check ' + (sec.found ? 'found' : 'missing') + '">' +
        (sec.found ? '✓' : '✗') + '</span>' +
        '</div>';
    }
    dom.sectionsContainer.innerHTML = html;
  }

  function renderSuggestions(suggestions) {
    dom.suggestionCountBadge.textContent = suggestions.length;

    if (suggestions.length === 0) {
      dom.suggestionsContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><p>No suggestions available</p></div>';
      return;
    }

    const icons = {
      'alert-triangle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      'alert-circle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      'check-circle': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      'info': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    let html = '';
    for (const sug of suggestions) {
      html += '<div class="suggestion-item type-' + sug.type + '" role="alert">' +
        '<span class="suggestion-icon">' + (icons[sug.icon] || icons.info) + '</span>' +
        '<span class="suggestion-text">' + escHtml(sug.text) + '</span>' +
        '</div>';
    }
    dom.suggestionsContainer.innerHTML = html;
  }

  function loadSample() {
    dom.resumeInput.value = SAMPLE_RESUME;
    dom.jdInput.value = SAMPLE_JD;
    updateStats();
    resetResults();
    dom.analysisStatus.dataset.status = 'idle';
    dom.analysisStatusLabel.textContent = 'Sample loaded — run scan';
    dom.analysisTimestamp.textContent = '--';
  }

  function clearAll() {
    dom.resumeInput.value = '';
    dom.jdInput.value = '';
    updateStats();
    resetResults();
    dom.analysisStatus.dataset.status = 'idle';
    dom.analysisStatusLabel.textContent = 'Awaiting Scan';
    dom.analysisTimestamp.textContent = '--';
    state.lastScan = null;
  }

  function resetResults() {
    dom.ringFill.style.strokeDashoffset = 534;
    dom.ringScore.textContent = '--';
    dom.sdKeywords.textContent = '--%';
    dom.sdKeywords.style.color = '';
    dom.sdSections.textContent = '--%';
    dom.sdSections.style.color = '';
    dom.sdFormat.textContent = '--%';
    dom.sdFormat.style.color = '';
    dom.sdExperience.textContent = '--%';
    dom.sdExperience.style.color = '';

    dom.matchContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg><p>Run a scan to see matching keywords</p></div>';
    dom.missingContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><p>Run a scan to identify missing keywords</p></div>';
    dom.sectionsContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>Run a scan to analyze resume sections</p></div>';
    dom.suggestionsContainer.innerHTML = '<div class="empty-state"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><p>Run a scan to get optimization suggestions</p></div>';

    dom.matchCountBadge.textContent = '0';
    dom.missingCountBadge.textContent = '0';
    dom.sectionCountBadge.textContent = '0/0';
    dom.suggestionCountBadge.textContent = '0';
  }

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      scanResume();
    }
  }

  function init() {
    dom.resumeInput.addEventListener('input', updateStats);
    dom.jdInput.addEventListener('input', updateStats);
    dom.resumeInput.addEventListener('keydown', handleKeydown);
    dom.jdInput.addEventListener('keydown', handleKeydown);
    dom.btnAnalyze.addEventListener('click', scanResume);
    dom.btnSample.addEventListener('click', loadSample);
    dom.btnClear.addEventListener('click', clearAll);

    clearAll();
    updateStats();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
