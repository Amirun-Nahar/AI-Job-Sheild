import { analyzeJobPosting } from './services/riskEngine.js';

// Setup Mock Env to test heuristic path
process.env.GEMINI_API_KEY = '';

const MOCK_SCAM_POST = {
  text: `!!! URGENT NOTICE !!! NO EXPERIENCE REQUIRED !!!
Earn up to 250,000 BDT daily for remote typing job!
Please pay a registration fee of 1,500 BDT for security card activation.
Contact hr-department@gmail.com on Telegram chat today!!!`,
  company: 'Global Tasks Publisher Inc.',
  website: 'http://global-typing-portal.blogspot.com',
  email: 'globaltasks.hr@gmail.com',
  phone: '+1 (415) 322-1209',
  salaryOffered: '250,000 BDT Monthly',
  salaryExpected: 35000,
  recruiter: 'Officer Joe'
};

const MOCK_CLEAN_POST = {
  text: `Pathao is looking for an entry-level QA engineer to join our Dhaka headquarters. 
You will be testing mobile APIs, reporting bugs, and collaborating with developers.
No fees are charged at any stage. Standard medical and transport allowance provided.`,
  company: 'Pathao Bangladesh',
  website: 'https://pathao.com',
  email: 'careers@pathao.com',
  phone: '0299887711',
  salaryOffered: '40,000 BDT Monthly',
  salaryExpected: 40000,
  recruiter: 'Talent Acquisition Team'
};

async function test() {
  console.log('🧪 Starting AI Job Shield Risk Engine Verification...');

  console.log('\n--- 1. Testing Fraudulent Job Posting (Scam Template) ---');
  const scamReport = await analyzeJobPosting(MOCK_SCAM_POST);
  console.log('Resulting Risk Level:', scamReport.riskLevel);
  console.log('Resulting Risk Score:', scamReport.riskScore + '%');
  console.log('Scam Probability:', scamReport.summary.scamProbability + '%');
  console.log('Verdict:', scamReport.summary.verdict);
  console.log('Factors Check Statuses:');
  Object.entries(scamReport.factors).forEach(([key, f]) => {
    console.log(`  - ${key}: score ${f.score}/${f.max} (${f.status}) -> ${f.details}`);
  });
  console.log('Suggested Actions:', scamReport.suggestedActions);

  console.log('\n--- 2. Testing Legitimate Job Posting ---');
  const cleanReport = await analyzeJobPosting(MOCK_CLEAN_POST);
  console.log('Resulting Risk Level:', cleanReport.riskLevel);
  console.log('Resulting Risk Score:', cleanReport.riskScore + '%');
  console.log('Verdict:', cleanReport.summary.verdict);
  console.log('Factors Check Statuses:');
  Object.entries(cleanReport.factors).forEach(([key, f]) => {
    console.log(`  - ${key}: score ${f.score}/${f.max} (${f.status}) -> ${f.details}`);
  });

  // Verify Risk boundaries
  console.log('\n--- 3. Running Automated Score Invariant Checks ---');
  if (scamReport.riskScore >= 75 && cleanReport.riskScore <= 15) {
    console.log('✅ PASS: Scams correctly flagged as High Risk, and clean jobs flagged as Safe/Low Risk.');
  } else {
    console.log('❌ FAIL: Score levels do not meet expectations.');
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
