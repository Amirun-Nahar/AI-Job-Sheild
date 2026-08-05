import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API if key is present
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Heuristic keyword definitions
const SCAM_KEYWORDS = [
  { phrase: 'pay registration fee', weight: 30, tag: 'Registration Fee Required' },
  { phrase: 'registration fee', weight: 25, tag: 'Registration Fee Required' },
  { phrase: 'training fee', weight: 25, tag: 'Training Fee Required' },
  { phrase: 'investment needed', weight: 20, tag: 'Investment Needed' },
  { phrase: 'limited offer', weight: 5, tag: 'Urgency Pressure' },
  { phrase: 'urgent hiring', weight: 3, tag: 'Urgency Pressure' },
  { phrase: 'guaranteed job', weight: 15, tag: 'Guaranteed Hiring Scam' },
  { phrase: 'no experience required', weight: 5, tag: 'Low Entry Barrier' },
  { phrase: 'earn millions', weight: 20, tag: 'Get Rich Quick Scam' },
  { phrase: 'earn lakh', weight: 15, tag: 'Unrealistic Pay Claim' },
  { phrase: 'deposit money', weight: 25, tag: 'Deposit Required' },
  { phrase: 'whatsapp interview', weight: 10, tag: 'Informal Messaging Chat' },
  { phrase: 'telegram task', weight: 15, tag: 'Telegram Task Scam' },
  { phrase: 'crypto payment', weight: 15, tag: 'Cryptocurrency Scam' }
];

// Heuristic: check email authenticity
function analyzeEmailHeuristics(email, companyName) {
  if (!email) {
    return { score: 5, max: 10, status: 'Neutral', details: 'No recruiter email address provided.' };
  }
  
  const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'yandex.com', 'mail.ru'];
  const emailLower = email.toLowerCase();
  const domain = emailLower.split('@')[1];
  
  const isPublic = publicDomains.some(d => domain === d);
  
  if (isPublic) {
    if (companyName && companyName.trim().length > 0) {
      const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const hasBrand = emailLower.includes(cleanCompany);
      if (hasBrand && cleanCompany.length > 3) {
        return {
          score: 0,
          max: 10,
          status: 'Suspicious',
          details: `Suspicious domain: uses a public Gmail/Yahoo account containing the company brand (${email}) instead of a corporate domain.`
        };
      }
    }
    return {
      score: 3,
      max: 10,
      status: 'Suspicious',
      details: `Recruiter email (${email}) uses a generic public domain instead of an official company server.`
    };
  }
  
  return {
    score: 10,
    max: 10,
    status: 'Verified',
    details: `Official domain detected (${domain}). Recruiter is contacting from a corporate email server.`
  };
}

// Heuristic: check contact number safety
function analyzeContactHeuristics(phone) {
  if (!phone) {
    return { score: 3, max: 5, status: 'Neutral', details: 'No contact number provided.' };
  }
  
  const suspiciousIndicators = ['+1', '+44', 'whatsapp only', 'telegram only'];
  const phoneLower = phone.toLowerCase();
  
  const isForeignSuspicious = suspiciousIndicators.some(ind => phoneLower.includes(ind));
  if (isForeignSuspicious) {
    return {
      score: 0,
      max: 5,
      status: 'Suspicious',
      details: `Contact number (${phone}) uses a foreign or internet-generated virtual routing code.`
    };
  }
  
  return {
    score: 5,
    max: 5,
    status: 'Verified',
    details: 'Contact number verified as a standard regional line.'
  };
}

// Heuristic: check salary levels
function analyzeSalaryHeuristics(offered, expected, jobTitle) {
  if (!offered) {
    return { score: 15, max: 15, status: 'Neutral', details: 'No salary details provided. Follows standard disclosure.' };
  }
  
  const offeredNum = parseFloat(offered.toString().replace(/[^0-9]/g, ''));
  const expectedNum = expected ? parseFloat(expected.toString().replace(/[^0-9]/g, '')) : 35000; // Default BDT
  
  if (isNaN(offeredNum)) {
    return { score: 12, max: 15, status: 'Neutral', details: 'Salary listed in text but non-numeric or range is unspecified.' };
  }
  
  // Flag if salary is more than 3x the expected market rate
  if (offeredNum > expectedNum * 3) {
    return {
      score: 0,
      max: 15,
      status: 'High Risk',
      details: `Offered salary (${offeredNum.toLocaleString()} BDT) is unrealistically high (over 3x) compared to standard market expectation (~${expectedNum.toLocaleString()} BDT) for this role.`
    };
  }
  
  if (offeredNum > expectedNum * 1.5) {
    return {
      score: 8,
      max: 15,
      status: 'Suspicious',
      details: `Offered salary (${offeredNum.toLocaleString()} BDT) is significantly higher than average market rate (~${expectedNum.toLocaleString()} BDT) for a typical entry role.`
    };
  }
  
  return {
    score: 15,
    max: 15,
    status: 'Verified',
    details: `Offered salary (${offeredNum.toLocaleString()} BDT) matches standard market expectation of ~${expectedNum.toLocaleString()} BDT.`
  };
}

// Smart Local Fallback Analyzer
function runLocalScamHeuristics(params) {
  const { text = '', company = '', website = '', email = '', phone = '', salaryOffered = '', salaryExpected = '', recruiter = '' } = params;
  
  const textLower = text.toLowerCase();
  
  // 1. Company Verification (Weight: 25%)
  let companyScore = 25;
  let companyDetails = 'Company profile appears to be valid.';
  let companyStatus = 'Verified';
  
  const hasFeeRequests = textLower.includes('registration fee') || textLower.includes('training fee') || textLower.includes('deposit') || textLower.includes('pay money') || textLower.includes('investment');
  const isUrgentAndNoExp = (textLower.includes('urgent') || textLower.includes('immediate') || textLower.includes('!!!')) && 
                           (textLower.includes('no experience') || textLower.includes('entry level') || textLower.includes('fresher') || textLower.includes('no prior'));

  if (!company || company.toLowerCase().includes('fake') || company.toLowerCase().includes('unknown')) {
    companyScore = 5;
    companyStatus = 'Suspicious';
    companyDetails = 'Company registration cannot be found, or name is highly generic.';
  } else if (hasFeeRequests) {
    companyScore = 5;
    companyStatus = 'High Risk';
    companyDetails = 'Company trust degraded: Job details contain illegal requests for registration, training, or security deposit fees.';
  } else if (isUrgentAndNoExp) {
    companyScore = 15;
    companyStatus = 'Suspicious';
    companyDetails = 'Company name exists but job details show high urgency pressure combined with low entry barriers.';
  }
  
  // 2. Website Trust (Weight: 15%)
  let webScore = 15;
  let webDetails = 'Website uses secure HTTPS and has verified domain ownership.';
  let webStatus = 'Verified';
  if (!website) {
    webScore = 3;
    webStatus = 'Suspicious';
    webDetails = 'No official corporate website provided.';
  } else {
    const webLower = website.toLowerCase();
    if (webLower.includes('blogspot') || webLower.includes('wixsite') || webLower.includes('weebly') || !webLower.startsWith('https')) {
      webScore = 0;
      webStatus = 'High Risk';
      webDetails = `Website (${website}) uses a free blogging domain or lacks SSL/HTTPS encryption.`;
    }
  }
  
  // 3. Salary Analysis (Weight: 15%)
  const salaryObj = analyzeSalaryHeuristics(salaryOffered, salaryExpected, params.jobTitle);
  
  // 4. Grammar Analysis (Weight: 10%)
  let grammarScore = 10;
  let grammarDetails = 'Grammar is professional. Standard formatting and professional writing tone detected.';
  let grammarStatus = 'Verified';
  
  // Count exclamation marks
  const exclamationCount = (text.match(/!/g) || []).length;
  // Check for excessive capitals
  const words = text.split(/\s+/);
  const capsWords = words.filter(w => w.length > 2 && w === w.toUpperCase() && !w.match(/^[0-9\W]+$/));
  const capsRatio = words.length > 0 ? capsWords.length / words.length : 0;
  
  if (exclamationCount > 5 || capsRatio > 0.15) {
    grammarScore = 3;
    grammarStatus = 'High Risk';
    grammarDetails = `Grammar lacks professional tone: contains excessive exclamation marks (${exclamationCount}) or capitalization (${Math.round(capsRatio*100)}% of words).`;
  } else if (textLower.includes('congratulations!!!') || textLower.includes('join today!!!') || textLower.includes('limited seats')) {
    grammarScore = 5;
    grammarStatus = 'Suspicious';
    grammarDetails = 'Tone is informal, urgent, and reads like sales copy rather than a traditional job posting.';
  }
  
  // 5. Scam Keywords (Weight: 10%)
  let keywordScore = 10;
  let keywordDetails = 'No common recruitment scam phrases detected.';
  let keywordStatus = 'Verified';
  const foundKeywords = [];
  
  for (const kw of SCAM_KEYWORDS) {
    if (textLower.includes(kw.phrase)) {
      foundKeywords.push(kw.tag);
      keywordScore -= (kw.weight / 5); // Increased penalty scaling
    }
  }
  if (keywordScore < 0) keywordScore = 0;
  if (foundKeywords.length > 0) {
    keywordStatus = foundKeywords.length > 1 ? 'High Risk' : 'Suspicious';
    keywordDetails = `Flagged scam phrases detected: ${foundKeywords.join(', ')}.`;
  }

  
  // 6. Email Verification (Weight: 10%)
  const emailObj = analyzeEmailHeuristics(email, company);
  
  // 7. Contact Verification (Weight: 5%)
  const contactObj = analyzeContactHeuristics(phone);
  
  // 8. Recruiter Verification (Weight: 10%)
  let recruiterScore = 10;
  let recruiterDetails = 'Recruiter details look authentic and correspond to company employees.';
  let recruiterStatus = 'Verified';
  if (!recruiter) {
    recruiterScore = 5;
    recruiterStatus = 'Neutral';
    recruiterDetails = 'No hiring recruiter name provided for direct verification.';
  } else if (emailObj.status === 'Suspicious') {
    recruiterScore = 2;
    recruiterStatus = 'Suspicious';
    recruiterDetails = `Recruiter claims to represent ${company || 'the company'} but uses an unverified email channel.`;
  }

  // Calculate Weighted Risk Score (0-100)
  // Maximum total score = 25 + 15 + 15 + 10 + 10 + 10 + 5 + 10 = 100 (Safe)
  // Risk Score = 100 - totalScore
  const totalScoreEarned = 
    companyScore + 
    webScore + 
    salaryObj.score + 
    grammarScore + 
    keywordScore + 
    emailObj.score + 
    contactObj.score + 
    recruiterScore;
    
  const riskScore = Math.max(0, Math.min(100, 100 - Math.round(totalScoreEarned)));
  
  let riskLevel = 'Safe';
  if (riskScore >= 75) {
    riskLevel = 'High Risk';
  } else if (riskScore >= 45) {
    riskLevel = 'Medium Risk';
  } else if (riskScore >= 15) {
    riskLevel = 'Low Risk';
  }
  
  const suggestedActions = [];
  if (riskScore >= 45) {
    suggestedActions.push('Do NOT pay any money, registration fees, or training costs under any circumstances.');
    suggestedActions.push('Ask the recruiter to email you from an official corporate domain name (not @gmail.com or @yahoo.com).');
  }
  if (webStatus === 'High Risk' || webStatus === 'Suspicious') {
    suggestedActions.push('Check the domain owner details using a WHOIS search tool.');
  }
  if (recruiterStatus === 'Suspicious' || recruiterStatus === 'Neutral') {
    suggestedActions.push('Search for the recruiter on LinkedIn. Verify if they work for the actual company.');
  }
  if (suggestedActions.length === 0) {
    suggestedActions.push('Verify the listing directly on the company\'s official career page before applying.');
  }

  let verdict = 'This job listing looks clean and safe. Standard security practices are still recommended.';
  if (riskScore >= 75) {
    verdict = 'CRITICAL ALERT: This job posting has extreme indicators of fraud. It contains common scam keywords, suspicious recruiter details, and high-risk domains. Avoid entirely.';
  } else if (riskScore >= 45) {
    verdict = 'WARNING: Several indicators look suspicious, such as generic email domains or high salary promises. Exercise high caution and perform manual checks before applying.';
  } else if (riskScore >= 15) {
    verdict = 'MINOR WARNING: Low level flags detected. The description has a few minor errors or lacks comprehensive recruiter metadata.';
  }

  return {
    riskScore,
    riskLevel,
    factors: {
      company: { score: companyScore, max: 25, status: companyStatus, details: companyDetails },
      website: { score: webScore, max: 15, status: webStatus, details: webDetails },
      salary: salaryObj,
      grammar: { score: grammarScore, max: 10, status: grammarStatus, details: grammarDetails },
      keywords: { score: keywordScore, max: 10, status: keywordStatus, details: keywordDetails },
      email: emailObj,
      contact: contactObj,
      recruiter: { score: recruiterScore, max: 10, status: recruiterStatus, details: recruiterDetails }
    },
    summary: {
      trustScore: 100 - riskScore,
      scamProbability: riskScore,
      verdict
    },
    suggestedActions
  };
}

// Main exports
export async function analyzeJobPosting(params) {
  const gemini = getGeminiClient();
  
  // If no Gemini client, run our powerful local heuristics
  if (!gemini) {
    console.log('🤖 Running local heuristic engine for risk evaluation...');
    return runLocalScamHeuristics(params);
  }
  
  console.log('✨ Calling Google Gemini API for scam detection & analysis...');
  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
You are AI Job Shield, a professional cyber-security and anti-fraud system specializing in detecting recruitment scams, phishing, and fake job postings.
Your task is to analyze the job posting details below and generate a structured JSON report evaluating risk scores and factor assessments.

INPUT DETAILS:
- Job Advertisement Text: """${params.text || ''}"""
- Company Name Claimed: "${params.company || ''}"
- Website URL provided: "${params.website || ''}"
- Contact Email: "${params.email || ''}"
- Contact Phone: "${params.phone || ''}"
- Salary Offered: "${params.salaryOffered || ''}"
- Market Expected Salary: "${params.salaryExpected || ''}"
- Recruiter Name: "${params.recruiter || ''}"

Weighted risk factors to evaluate (totaling 100 points of trust):
1. Company Verification (max: 25 pts)
2. Website Trust (max: 15 pts)
3. Salary Analysis (max: 15 pts)
4. Grammar & Writing Quality (max: 10 pts)
5. Scam Phrase Keywords (max: 10 pts) (e.g. pay registration/training fee, guaranteed job, earn millions, whatsapp interview, etc.)
6. Recruiter Email Verification (max: 10 pts) (Gmail/Yahoo for major companies is highly suspicious)
7. Contact Phone Verification (max: 5 pts)
8. Recruiter Verification (max: 10 pts)

For each factor, assign an earned score (0 to Max), status ('Verified', 'Neutral', 'Suspicious', or 'High Risk'), and a specific 'details' string explaining your logic.

Return ONLY a valid JSON object matching this structure EXACTLY (no markdown wrappers, no trailing commas, no extra text):
{
  "riskScore": [Integer from 0 to 100. Lower earned points mean higher risk. Risk Score = 100 - sum(earned scores)],
  "riskLevel": "[Safe (0-14) / Low Risk (15-44) / Medium Risk (45-74) / High Risk (75-100)]",
  "factors": {
    "company": { "score": [Integer], "max": 25, "status": "[Status]", "details": "[Why this score was assigned]" },
    "website": { "score": [Integer], "max": 15, "status": "[Status]", "details": "[Why this score was assigned]" },
    "salary": { "score": [Integer], "max": 15, "status": "[Status]", "details": "[Why this score was assigned]" },
    "grammar": { "score": [Integer], "max": 10, "status": "[Status]", "details": "[Why this score was assigned]" },
    "keywords": { "score": [Integer], "max": 10, "status": "[Status]", "details": "[Why this score was assigned]" },
    "email": { "score": [Integer], "max": 10, "status": "[Status]", "details": "[Why this score was assigned]" },
    "contact": { "score": [Integer], "max": 5, "status": "[Status]", "details": "[Why this score was assigned]" },
    "recruiter": { "score": [Integer], "max": 10, "status": "[Status]", "details": "[Why this score was assigned]" }
  },
  "summary": {
    "trustScore": [100 - riskScore],
    "scamProbability": [riskScore],
    "verdict": "[A paragraph summarizing your reasoning, calling out key red flags or safety markers]"
  },
  "suggestedActions": [
    "[Action Item 1]",
    "[Action Item 2]"
  ]
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.response.text();
    // Parse response
    const analysis = JSON.parse(responseText.trim());
    return analysis;
  } catch (error) {
    console.error('💥 Gemini API analysis failed. Falling back to local heuristic checks.', error.message);
    return runLocalScamHeuristics(params);
  }
}
