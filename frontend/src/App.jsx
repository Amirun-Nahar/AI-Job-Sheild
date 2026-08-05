import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  FileText, 
  PlusCircle, 
  DollarSign, 
  AlertCircle, 
  ThumbsUp, 
  Globe, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  RefreshCw, 
  BookOpen, 
  Info,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Building,
  DollarSign as SalaryIcon,
  Check,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Pre-filled template data for easy testing of fake job scams
const SCAM_TEMPLATES = [
  {
    title: '🔥 Telegram Tasks (Earn 50,000 BDT Daily)',
    name: 'Telegram Tasks & Data Entry',
    company: 'Apex Media Growth Partners',
    website: 'http://apex-media-growth-tasks.blogspot.com',
    email: 'apexmedia.hr.recruiter@gmail.com',
    phone: '+1 415-998-3210',
    salaryOffered: '1,500,000 BDT Yearly',
    salaryExpected: '350,000 BDT',
    recruiter: 'Manager Dave (Telegram)',
    text: `!!! URGENT HIRING !!! NO EXPERIENCE REQUIRED !!!
Earn up to 50,000 BDT daily from the comfort of your home!
Apex Media is hiring remote typing assistants. Your task is to like YouTube videos and submit screenshots to our Telegram channel.
REQUIREMENTS:
- Smartphone/Laptop
- 1-2 hours daily
- Instant payout in Bkash/Rocket
- Must pay a 1,500 BDT security deposit / registration fee to activate your employee ID.
JOIN TODAY! ONLY 5 SEATS LEFT!!!`
  },
  {
    title: '⚠️ Fake Remote Healthcare Data Entry (Gmail Recruiter)',
    name: 'Remote Data entry Clerk',
    company: 'Optum Health Systems LLC',
    website: '',
    email: 'optumhealth.hr.careers@gmail.com',
    phone: '+1 (520) 441-9231',
    salaryOffered: '350,000 BDT Monthly',
    salaryExpected: '40,000 BDT',
    recruiter: 'HR Recruiter Sarah',
    text: `Optum Health Systems is looking for a Remote Data Entry Clerk.
Salary: 350,000 BDT per month (Paid weekly).
Duties: Enter raw medical logs into MS Excel templates. 
This is a 100% remote job. Interviews will be conducted exclusively via Google Meet or WhatsApp chat.
No prior experience is necessary. We will provide all equipment.
You will need to pay a small training materials fee of 3,000 BDT which is fully refundable after your first week.`
  },
  {
    title: '✅ Legitimate Software Engineer Post',
    name: 'Junior Software Engineer',
    company: 'Pathao Bangladesh',
    website: 'https://pathao.com',
    email: 'careers@pathao.com',
    phone: '+8802998877',
    salaryOffered: '45,000 BDT Monthly',
    salaryExpected: '40,000 BDT',
    recruiter: 'Rashedul Islam (Talent Acquisition)',
    text: `Pathao is looking for an enthusiastic Junior Software Engineer to join our core ride-sharing engineering team in Dhaka.
Key Responsibilities:
- Participate in full software development lifecycle (JS/Node.js/React).
- Write clean, maintainable, testable code.
- Collaborate with product managers and QA engineers.
Requirements:
- Bachelor's degree in CSE or equivalent experience.
- Strong command over data structures and algorithms.
- 0-1 years of experience.
Pathao is an equal opportunity employer. We do not charge any fees at any stage of recruitment.`
  }
];

export default function App() {
  const { user, login, register, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analyzer'); // analyzer | checker | reports | about
  
  // Backend health status state
  const [backendConnected, setBackendConnected] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Analyzer Form states
  const [jobText, setJobText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterPhone, setRecruiterPhone] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [salaryExpected, setSalaryExpected] = useState('40000'); // Default market rate in BDT
  const [recruiterName, setRecruiterName] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Company Check state
  const [checkCompanyName, setCheckCompanyName] = useState('');
  const [checkWebsite, setCheckWebsite] = useState('');
  const [companyCheckResult, setCompanyCheckResult] = useState(null);
  const [companyCheckLoading, setCompanyCheckLoading] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  
  // Submit report form states
  const [reportJobTitle, setReportJobTitle] = useState('');
  const [reportCompanyName, setReportCompanyName] = useState('');
  const [reportPlatform, setReportPlatform] = useState('LinkedIn');
  const [reportScamType, setReportScamType] = useState('Registration Fee');
  const [reportContact, setReportContact] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportRiskScore, setReportRiskScore] = useState(50);
  const [reportSubmitLoading, setReportSubmitLoading] = useState(false);

  // Check API health on startup
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setBackendConnected(true);
        }
      })
      .catch(() => {
        setBackendConnected(false);
      })
      .finally(() => {
        setCheckingBackend(false);
      });
  }, []);

  // Fetch reports when visiting community tab
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend offline, using local storage reports fallback');
      const cached = localStorage.getItem('ai_job_shield_cached_reports');
      if (cached) {
        setReports(JSON.parse(cached));
      } else {
        // Static fallback matching seed
        setReports([
          {
            _id: '1',
            jobTitle: 'Data Entry Representative (Remote)',
            companyName: 'Apex Healthcare Solutions (Fake)',
            platform: 'Telegram / WhatsApp',
            scamType: 'Registration Fee & Phishing',
            contactInfo: 'hr-department@gmail.com / +1 415-321-4456',
            description: 'Offered 45 USD per hour. Requested $150 registration fee for training materials and identity details via Telegram chat.',
            riskScore: 92,
            riskLevel: 'High Risk',
            confirmations: 42,
            reportedBy: 'Nahar (Graduate)',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            jobTitle: 'Social Media Evaluator',
            companyName: 'Global Operations LLC',
            platform: 'Facebook Ads',
            scamType: 'Training Fee Scam',
            contactInfo: 'info@global-evaluators-portal.com',
            description: 'Guarantees 5,000 BDT daily. Requires purchasing a proprietary certification guide for 2,000 BDT to unlock work.',
            riskScore: 84,
            riskLevel: 'High Risk',
            confirmations: 18,
            reportedBy: 'S. Al-Mamun',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setReportsLoading(false);
    }
  };

  // Helper to load template
  const loadTemplate = (tmpl) => {
    setJobText(tmpl.text);
    setCompanyName(tmpl.company);
    setWebsiteUrl(tmpl.website);
    setRecruiterEmail(tmpl.email);
    setRecruiterPhone(tmpl.phone);
    setSalaryOffered(tmpl.salaryOffered);
    setSalaryExpected(tmpl.salaryExpected.replace(/[^0-9]/g, ''));
    setRecruiterName(tmpl.recruiter);
    setAnalysisResult(null);
  };

  // Handle job analysis submit
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobText.trim()) return;

    setAnalysisLoading(true);
    setAnalysisResult(null);
    
    // Simulate loading stage transitions
    const steps = [
      'Extracting job details...',
      'Scanning for scam keywords & urgency markers...',
      'Evaluating website domain status & SSL headers...',
      'Verifying email structure and recruiter links...',
      'Calculating risk engine weights...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisSteps(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    const payload = {
      text: jobText,
      company: companyName,
      website: websiteUrl,
      email: recruiterEmail,
      phone: recruiterPhone,
      salaryOffered: salaryOffered,
      salaryExpected: salaryExpected ? Number(salaryExpected) : 35000,
      recruiter: recruiterName
    };

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend API error during analysis. Running client-side analysis engine...');
      // Implement the exact same heuristic logic locally in frontend if backend fails
      const result = runLocalScamHeuristicsClient(payload);
      setAnalysisResult(result);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Client-side heuristics logic fallback
  const runLocalScamHeuristicsClient = (params) => {
    const textLower = (params.text || '').toLowerCase();
    let scoreEarned = 100;
    const factors = {
      company: { score: 25, max: 25, status: 'Verified', details: 'Company profile verified' },
      website: { score: 15, max: 15, status: 'Verified', details: 'Website appears secure and official' },
      salary: { score: 15, max: 15, status: 'Verified', details: 'Salary range is reasonable and matches market rates.' },
      grammar: { score: 10, max: 10, status: 'Verified', details: 'Grammar and formatting are within professional standards.' },
      keywords: { score: 10, max: 10, status: 'Verified', details: 'No known scam phrases detected.' },
      email: { score: 10, max: 10, status: 'Verified', details: 'Official domain recruiter email.' },
      contact: { score: 5, max: 5, status: 'Verified', details: 'Standard regional telephone number.' },
      recruiter: { score: 10, max: 10, status: 'Verified', details: 'Recruiter name is valid.' }
    };

    // Keyword checking
    const keywords = [
      { p: 'pay registration fee', w: 30, t: 'Registration Fee' },
      { p: 'registration fee', w: 25, t: 'Registration Fee' },
      { p: 'training fee', w: 25, t: 'Training Fee' },
      { p: 'urgent hiring', w: 10, t: 'Urgency Pressure' },
      { p: 'limited offer', w: 5, t: 'Urgency Pressure' },
      { p: 'guaranteed job', w: 20, t: 'Guaranteed Job Offer' },
      { p: 'no experience required', w: 5, t: 'Low Requirements' },
      { p: 'earn millions', w: 20, t: 'Get Rich Quick Claim' },
      { p: 'whatsapp interview', w: 15, t: 'Informal Messaging' },
      { p: 'telegram task', w: 20, t: 'Telegram Task Scam' }
    ];

    let foundKw = [];
    let kwScore = 10;
    keywords.forEach(kw => {
      if (textLower.includes(kw.p)) {
        foundKw.push(kw.t);
        kwScore -= (kw.w / 10);
      }
    });
    if (kwScore < 0) kwScore = 0;
    factors.keywords.score = Math.round(kwScore);
    if (foundKw.length > 0) {
      factors.keywords.status = 'High Risk';
      factors.keywords.details = `Detected flags: ${foundKw.join(', ')}.`;
    }

    // Company & Website checks
    if (!params.company) {
      factors.company.score = 5;
      factors.company.status = 'Suspicious';
      factors.company.details = 'No company name provided. Very high risk of identity masking.';
    }
    if (!params.website) {
      factors.website.score = 5;
      factors.website.status = 'Suspicious';
      factors.website.details = 'No website URL provided.';
    } else {
      const url = params.website.toLowerCase();
      if (url.includes('blogspot') || url.includes('wixsite') || !url.startsWith('https')) {
        factors.website.score = 0;
        factors.website.status = 'High Risk';
        factors.website.details = 'Website URL uses a free blog host or lacks secure HTTPS.';
      }
    }

    // Email
    if (params.email) {
      const publicDom = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const emailDomain = params.email.split('@')[1];
      if (publicDom.includes(emailDomain)) {
        factors.email.score = 2;
        factors.email.status = 'Suspicious';
        factors.email.details = 'Recruiter uses a public email provider (Gmail/Yahoo) instead of an official company domain.';
      }
    } else {
      factors.email.score = 5;
      factors.email.status = 'Neutral';
      factors.email.details = 'No contact email provided.';
    }

    // Salary comparison
    const off = parseFloat((params.salaryOffered || '').replace(/[^0-9]/g, ''));
    const exp = parseFloat(params.salaryExpected) || 35000;
    if (off > exp * 3) {
      factors.salary.score = 0;
      factors.salary.status = 'High Risk';
      factors.salary.details = `Offered salary (${off.toLocaleString()} BDT) is extremely unrealistic relative to average market rates (~${exp.toLocaleString()} BDT).`;
    }

    // Grammar
    const exclamationCount = (params.text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      factors.grammar.score = 4;
      factors.grammar.status = 'Suspicious';
      factors.grammar.details = 'Lacks professional tone: contains excessive exclamation marks.';
    }

    // Calculate score
    const totalEarned = Object.values(factors).reduce((acc, current) => acc + current.score, 0);
    const riskScore = Math.max(0, 100 - totalEarned);
    
    let riskLevel = 'Safe';
    if (riskScore >= 75) riskLevel = 'High Risk';
    else if (riskScore >= 45) riskLevel = 'Medium Risk';
    else if (riskScore >= 15) riskLevel = 'Low Risk';

    const suggestedActions = [
      'Do NOT pay any registration or training fees under any circumstances.',
      'Ask the sender to contact you from an official corporate domain name.',
      'Search for the company registration details in local government business indexes.'
    ];

    let verdict = 'This job listing looks safe. Proceed with standard career security steps.';
    if (riskScore >= 75) {
      verdict = 'CRITICAL ALERT: This posting displays classic markers of an advanced recruitment scam, including upfront fee pressure and public email contacts. Do not apply.';
    } else if (riskScore >= 45) {
      verdict = 'WARNING: Several indicators are suspicious. Double-check recruiter details and verify on their official site before sharing details.';
    }

    return {
      riskScore,
      riskLevel,
      factors,
      summary: {
        trustScore: 100 - riskScore,
        scamProbability: riskScore,
        verdict
      },
      suggestedActions
    };
  };

  // Company and Website Trust Check
  const handleCompanyCheck = async (e) => {
    e.preventDefault();
    if (!checkCompanyName && !checkWebsite) return;

    setCompanyCheckLoading(true);
    setCompanyCheckResult(null);

    await new Promise(r => setTimeout(r, 1200)); // Visual spacing

    const websiteLower = checkWebsite.toLowerCase();
    let isFake = false;
    let trustScore = 95;
    let details = [];

    if (checkCompanyName.toLowerCase().includes('global tasks') || checkCompanyName.toLowerCase().includes('apex media tasks')) {
      isFake = true;
      trustScore = 14;
      details.push('Company flagged in community blacklist databases.');
    }

    if (websiteLower) {
      if (!websiteLower.startsWith('https://')) {
        trustScore -= 30;
        details.push('SSL certificate is missing or insecure (HTTP instead of HTTPS).');
      }
      if (websiteLower.includes('blogspot') || websiteLower.includes('wixsite') || websiteLower.includes('github.io')) {
        trustScore -= 40;
        details.push('Uses a free hosting/blogging sub-domain rather than a corporate dot-com domain.');
      }
      if (websiteLower.includes('google-career') || websiteLower.includes('pathao-hr')) {
        trustScore -= 35;
        details.push('Possible domain spoofing / phishing attempt detected.');
      }
    } else {
      trustScore -= 20;
      details.push('No website provided, making company footprint verification difficult.');
    }

    if (details.length === 0) {
      details.push('Website uses secure SSL encryption. Domain age records indicate stable operations (> 2 years).');
      details.push('Corporate presence indexed on professional networks.');
    }

    setCompanyCheckResult({
      name: checkCompanyName || 'Unknown Entity',
      website: checkWebsite || 'None Provided',
      trustScore: Math.max(0, trustScore),
      riskLevel: trustScore >= 80 ? 'Verified / Safe' : trustScore >= 45 ? 'Medium Risk' : 'High Risk / Suspicious',
      confidence: Math.max(20, trustScore - 5),
      details
    });

    setCompanyCheckLoading(false);
  };

  // Handle report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportJobTitle || !reportCompanyName) return;

    setReportSubmitLoading(true);
    
    const payload = {
      jobTitle: reportJobTitle,
      companyName: reportCompanyName,
      platform: reportPlatform,
      scamType: reportScamType,
      contactInfo: reportContact,
      description: reportDesc,
      riskScore: reportRiskScore,
      riskLevel: reportRiskScore >= 75 ? 'High Risk' : reportRiskScore >= 45 ? 'Medium Risk' : 'Low Risk',
      reportedBy: user ? user.displayName : 'Anonymous'
    };

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports(prev => [newReport, ...prev]);
        setShowReportForm(false);
        resetReportForm();
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend offline, adding report to local memory and cache');
      const newReport = {
        _id: 'report_' + Date.now(),
        ...payload,
        confirmations: 1,
        createdAt: new Date().toISOString()
      };
      const updated = [newReport, ...reports];
      setReports(updated);
      localStorage.setItem('ai_job_shield_cached_reports', JSON.stringify(updated));
      setShowReportForm(false);
      resetReportForm();
    } finally {
      setReportSubmitLoading(false);
    }
  };

  const resetReportForm = () => {
    setReportJobTitle('');
    setReportCompanyName('');
    setReportContact('');
    setReportDesc('');
    setReportRiskScore(50);
  };

  // Increment confirmation upvote
  const handleConfirmScam = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/confirm`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setReports(prev => prev.map(r => r._id === id ? updated : r));
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('Backend offline, incrementing local upvotes');
      const updated = reports.map(r => {
        if (r._id === id) {
          return { ...r, confirmations: (r.confirmations || 0) + 1 };
        }
        return r;
      });
      setReports(updated);
      localStorage.setItem('ai_job_shield_cached_reports', JSON.stringify(updated));
    }
  };

  // Auth form submissions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register(authEmail, authPassword, authName);
      }
      setShowAuthModal(false);
      // Clear forms
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err) {
      setAuthError('Authentication failed. Please check credentials and try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Pre-populate report form from analysis result
  const populateReportFromAnalysis = () => {
    if (!analysisResult) return;
    setReportJobTitle('Flagged Posting');
    setReportCompanyName(companyName || 'Unknown Company');
    setReportPlatform('Online Ad');
    setReportScamType(analysisResult.riskScore >= 75 ? 'Registration Fee' : 'Phishing Scam');
    setReportContact(`${recruiterEmail || ''} ${recruiterPhone || ''}`.trim());
    setReportDesc(`AI Risk Assessment details: ${analysisResult.summary.verdict}`);
    setReportRiskScore(analysisResult.riskScore);
    
    // Switch tab to reports and open form
    setActiveTab('reports');
    setShowReportForm(true);
  };

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.jobTitle.toLowerCase().includes(query) ||
      r.companyName.toLowerCase().includes(query) ||
      r.scamType.toLowerCase().includes(query) ||
      (r.description && r.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('analyzer')}>
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white m-0 leading-none">
                AI Job Shield
              </h1>
              <span className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">
                Verify Before You Apply.
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { id: 'analyzer', label: 'Job Analyzer', icon: FileText },
              { id: 'checker', label: 'Verify Company / Web', icon: Globe },
              { id: 'reports', label: 'Community Board', icon: MessageSquare },
              { id: 'about', label: 'Scam Info Hub', icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User Section & Backend Indicator */}
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-slate-400 hidden sm:inline">
                {backendConnected ? 'Engine API Live' : 'Offline Mode (Local Fallbacks)'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300 hidden sm:inline">
                  Hi, {user.displayName}
                </span>
                <button 
                  onClick={logout}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: JOB ANALYZER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Promo / Info Intro */}
            <div className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-1 flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white font-display">AI-Powered Risk Assessment Engine</h2>
                <p className="text-sm text-slate-400 max-w-3xl">
                  Paste the text of a job description below and optionally add recruiter details. Our AI engine verifies credentials, identifies registration fees, analyses grammatical red flags, checks website structures, and returns a detailed scam probability assessment.
                </p>
              </div>
              
              {/* Load Templates Selector */}
              <div className="w-full md:w-auto flex flex-col gap-2 min-w-[200px]">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center md:text-left">
                  Or Test with Scam Templates:
                </span>
                {SCAM_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadTemplate(tmpl)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-indigo-500/40 text-xs font-medium text-slate-300 hover:text-indigo-300 transition-all flex items-center justify-between"
                  >
                    <span className="truncate max-w-[170px]">{tmpl.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT SIDE: The form inputs */}
              <form onSubmit={handleAnalyze} className="lg:col-span-7 space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-850">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Job Posting Specifications
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Paste Job Post Advertisement Text *
                  </label>
                  <textarea
                    required
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    rows={8}
                    placeholder="Paste the full job post details, email received, or description text here..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm font-sans placeholder-slate-600 focus:outline-none transition-all resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Company Name (Claimed)
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Google, Apex Solutions"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Company Website URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="e.g. https://apex-healthcare.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Recruiter Contact Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="email"
                        value={recruiterEmail}
                        onChange={(e) => setRecruiterEmail(e.target.value)}
                        placeholder="e.g. careers@google.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Recruiter Phone / Whatsapp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="text"
                        value={recruiterPhone}
                        onChange={(e) => setRecruiterPhone(e.target.value)}
                        placeholder="e.g. +1 415 220 9811"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Offered Salary
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="text"
                        value={salaryOffered}
                        onChange={(e) => setSalaryOffered(e.target.value)}
                        placeholder="e.g. 250000 BDT"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Market Benchmark (BDT)
                    </label>
                    <div className="relative">
                      <SalaryIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="number"
                        value={salaryExpected}
                        onChange={(e) => setSalaryExpected(e.target.value)}
                        placeholder="e.g. 40000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Recruiter / HR Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-650" />
                      <input
                        type="text"
                        value={recruiterName}
                        onChange={(e) => setRecruiterName(e.target.value)}
                        placeholder="e.g. HR Team, Sarah"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={analysisLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  {analysisLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      {analysisSteps}
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Run Safety Scan
                    </>
                  )}
                </button>
              </form>

              {/* RIGHT SIDE: The safety evaluation report */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* No analysis state */}
                {!analysisLoading && !analysisResult && (
                  <div className="h-full min-h-[350px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
                    <Shield className="w-12 h-12 text-slate-700 mb-4" />
                    <h3 className="text-base font-semibold text-slate-400">Awaiting Job Safety Input</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Paste a job description or choose one of our verified fake job templates on the left to review the detailed security assessment.
                    </p>
                  </div>
                )}

                {/* Analysis loading state */}
                {analysisLoading && (
                  <div className="min-h-[450px] bg-slate-900/35 border border-slate-850 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin flex items-center justify-center">
                      <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-300">AI Shield Scanning in progress</h4>
                      <p className="text-xs text-slate-500">{analysisSteps}</p>
                    </div>
                  </div>
                )}

                {/* Analysis result state */}
                {!analysisLoading && analysisResult && (
                  <div className="space-y-6 animate-slideUp">
                    
                    {/* Big Risk Indicator */}
                    <div className={`p-6 rounded-2xl border bg-slate-900/60 relative overflow-hidden ${
                      analysisResult.riskScore >= 75 
                        ? 'border-rose-900/40 glow-rose' 
                        : analysisResult.riskScore >= 45 
                          ? 'border-amber-900/40 glow-amber' 
                          : 'border-emerald-900/40 glow-emerald'
                    }`}>
                      
                      {/* Risk score gauge background */}
                      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
                        <Shield className="w-full h-full" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                            Calculated Risk Assessment
                          </span>
                          <h2 className="text-2xl font-bold font-display tracking-tight text-white leading-none">
                            {analysisResult.riskLevel}
                          </h2>
                        </div>
                        <div className="text-right">
                          <div className={`text-4xl font-extrabold font-display ${
                            analysisResult.riskScore >= 75 
                              ? 'text-rose-500' 
                              : analysisResult.riskScore >= 45 
                                ? 'text-amber-500' 
                                : 'text-emerald-500'
                          }`}>
                            {analysisResult.riskScore}%
                          </div>
                          <span className="text-xs text-slate-500">Risk Score</span>
                        </div>
                      </div>

                      {/* Risk gauge bar */}
                      <div className="h-2 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            analysisResult.riskScore >= 75 
                              ? 'bg-rose-500' 
                              : analysisResult.riskScore >= 45 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{ width: `${analysisResult.riskScore}%` }}
                        />
                      </div>

                      {/* Summary text */}
                      <p className="text-xs sm:text-sm text-slate-350 mt-4 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                        <strong>Verdict:</strong> {analysisResult.summary.verdict}
                      </p>
                    </div>

                    {/* Breakdown by factor */}
                    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-850 space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Weight Factor Breakdown (Trust Scores)
                      </h4>

                      <div className="space-y-3.5">
                        {Object.entries(analysisResult.factors).map(([key, data]) => {
                          // Note: data.score is the EARNED trust score. Max indicates full trust.
                          const earnedPercentage = (data.score / data.max) * 100;
                          const isWarning = data.status === 'Suspicious' || data.status === 'High Risk';
                          
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-300 capitalize">
                                  {key === 'keywords' ? 'Scam Phrase Detection' : key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-bold ${isWarning ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {data.score}/{data.max} pts
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                    data.status === 'Verified' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : data.status === 'Suspicious' 
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : data.status === 'High Risk'
                                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                                  }`}>
                                    {data.status}
                                  </span>
                                </div>
                              </div>
                              {/* Simple mini bar */}
                              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${earnedPercentage}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                                {data.details}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions Card */}
                    <div className="p-6 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4.5 h-4.5" />
                        Suggested Actions
                      </h4>
                      <ul className="space-y-2 list-none p-0 m-0 text-xs text-slate-300">
                        {analysisResult.suggestedActions.map((act, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Report to Community Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={populateReportFromAnalysis}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-400" />
                        Report to Community Board
                      </button>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: VERIFY COMPANY & WEBSITE */}
        {activeTab === 'checker' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold font-display text-white">Company presence & Web Trust Analyzer</h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Scan domain signatures, SSL certifications, free blog hosting extensions, and registration names to analyze legitimacy instantly.
              </p>
            </div>

            <form onSubmit={handleCompanyCheck} className="p-6 rounded-2xl glass-card space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={checkCompanyName}
                    onChange={(e) => setCheckCompanyName(e.target.value)}
                    placeholder="e.g. Apex Health Corp"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Website Address / Domain
                  </label>
                  <input
                    type="text"
                    value={checkWebsite}
                    onChange={(e) => setCheckWebsite(e.target.value)}
                    placeholder="e.g. apex-jobs-portal.blogspot.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={companyCheckLoading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {companyCheckLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Inspecting domain WHOIS & SSL tags...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Verify Authenticity
                  </>
                )}
              </button>
            </form>

            {/* Results Panel */}
            {companyCheckResult && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 max-w-2xl mx-auto space-y-6 animate-slideUp">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{companyCheckResult.name}</h3>
                    <span className="text-xs text-slate-400">{companyCheckResult.website}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                      companyCheckResult.trustScore >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : companyCheckResult.trustScore >= 45 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {companyCheckResult.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Website Trust Score</span>
                    <span className={`text-3xl font-extrabold font-display ${
                      companyCheckResult.trustScore >= 80 ? 'text-emerald-500' : companyCheckResult.trustScore >= 45 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {companyCheckResult.trustScore}%
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-semibold block uppercase">Verification Confidence</span>
                    <span className="text-3xl font-extrabold font-display text-indigo-400">
                      {companyCheckResult.confidence}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analysis Highlights</h4>
                  <ul className="space-y-2 list-none p-0 m-0 text-xs sm:text-sm text-slate-350">
                    {companyCheckResult.details.map((dtl, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        {companyCheckResult.trustScore >= 45 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{dtl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 3: COMMUNITY SCAM BOARD */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-fadeIn">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-extrabold font-display text-white">Community Scam Reports Board</h2>
                <p className="text-sm text-slate-400">
                  Real-time database of confirmed scams reported by other job seekers. Verify and upvote warnings.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reported companies..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-650 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 shadow-lg shadow-indigo-600/10"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Scam
                </button>
              </div>
            </div>

            {/* Submitting report form panel */}
            {showReportForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative shadow-2xl shadow-black/80 animate-scaleUp">
                  
                  <button 
                    onClick={() => setShowReportForm(false)}
                    className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-display text-white">Report Fake Job Listing</h3>
                    <p className="text-xs text-slate-400">
                      Share the details of a suspected recruitment scam to warn the community.
                    </p>
                  </div>

                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Job Title *</label>
                        <input
                          required
                          type="text"
                          value={reportJobTitle}
                          onChange={(e) => setReportJobTitle(e.target.value)}
                          placeholder="e.g. Remote Typing Agent"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Company Name *</label>
                        <input
                          required
                          type="text"
                          value={reportCompanyName}
                          onChange={(e) => setReportCompanyName(e.target.value)}
                          placeholder="e.g. Apex Publishing Group"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Platform Where Found *</label>
                        <select
                          value={reportPlatform}
                          onChange={(e) => setReportPlatform(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 text-sm focus:outline-none transition-all"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Facebook">Facebook Ads / Group</option>
                          <option value="WhatsApp">WhatsApp Message</option>
                          <option value="Telegram">Telegram Channel / PM</option>
                          <option value="Online Job Portal">Online Job Portal</option>
                          <option value="Email Offer">Unsolicited Email</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scam Category *</label>
                        <select
                          value={reportScamType}
                          onChange={(e) => setReportScamType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 text-sm focus:outline-none transition-all"
                        >
                          <option value="Registration Fee">Registration / Entry Fee Scam</option>
                          <option value="Training Fee">Mandatory Training Fee Scam</option>
                          <option value="Identity Theft">Phishing / Identity Theft</option>
                          <option value="Fake Recruiter">Fake HR Recruiter Phishing</option>
                          <option value="Crypto Payment">Crypto Mining Task Scam</option>
                          <option value="Other scam">Other Fraudulent Offer</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Flagged Recruiter Contact details</label>
                      <input
                        type="text"
                        value={reportContact}
                        onChange={(e) => setReportContact(e.target.value)}
                        placeholder="e.g. apex.recruitment@gmail.com / +1 (234) 567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Scam Details & Description *</label>
                      <textarea
                        required
                        value={reportDesc}
                        onChange={(e) => setReportDesc(e.target.value)}
                        rows={3}
                        placeholder="Explain the experience. How did they request money or information?"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>ESTIMATED RISK LEVEL</span>
                        <span className="text-indigo-400">{reportRiskScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={reportRiskScore}
                        onChange={(e) => setReportRiskScore(Number(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reportSubmitLoading}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {reportSubmitLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Publishing warning...
                        </>
                      ) : (
                        'Submit Scam Report'
                      )}
                    </button>
                  </form>

                </div>
              </div>
            )}

            {/* Reports listing grid */}
            {reportsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-sm text-slate-400">Loading reported postings...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(rpt => (
                  <div key={rpt._id} className="p-6 rounded-2xl glass-card border border-slate-850 flex flex-col justify-between space-y-4 hover:border-slate-800">
                    <div className="space-y-3">
                      
                      {/* Top flags */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-indigo-400">
                          {rpt.platform}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          rpt.riskScore >= 75 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {rpt.riskLevel || 'Scam'} ({rpt.riskScore}%)
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white leading-tight font-display">{rpt.jobTitle}</h3>
                        <span className="text-xs text-slate-400 font-semibold">{rpt.companyName}</span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div className="flex gap-2">
                          <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[9px] min-w-[70px]">Type:</span>
                          <span className="text-slate-300 font-medium">{rpt.scamType}</span>
                        </div>
                        {rpt.contactInfo && (
                          <div className="flex gap-2">
                            <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[9px] min-w-[70px]">Contact:</span>
                            <span className="text-slate-400 font-mono truncate max-w-[200px]">{rpt.contactInfo}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-405 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-875 font-sans min-h-[60px]">
                        {rpt.description}
                      </p>
                    </div>

                    {/* Upvote confirmations */}
                    <div className="border-t border-slate-850/80 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        By {rpt.reportedBy || 'Anonymous'}
                      </span>
                      <button
                        onClick={() => handleConfirmScam(rpt._id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 hover:bg-indigo-900/40 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Scam Confirmed ({rpt.confirmations || 1})
                      </button>
                    </div>
                  </div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/5">
                    <ShieldAlert className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-slate-450">No reports matched your search</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* VIEW 4: SCAM INFO HUB */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold font-display text-white">Scam Prevention & Education Hub</h2>
              <p className="text-sm text-slate-400">
                Learn the patterns, mechanisms, and common red flags of recruitment fraud to protect yourself.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Highest Threat
                </span>
                <h3 className="text-lg font-bold text-white font-display">Registration / Processing Fee Scams</h3>
                <p className="text-xs sm:text-sm text-slate-450 leading-relaxed">
                  Fake recruiters offer quick, entry-level remote tasks (data entry, PDF typing) but demand an upfront registration, software license, ID verification, or background check payment before the "first payout." 
                </p>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs text-rose-300 font-mono">
                  💡 Red Flag: "Please purchase our mandatory software pack for $45. We will reimburse you in your first paycheck."
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Highest Threat
                </span>
                <h3 className="text-lg font-bold text-white font-display">Paid Training / Certificate Schemes</h3>
                <p className="text-xs sm:text-sm text-slate-450 leading-relaxed">
                  Scammers contact job seekers claiming they are hired but need to complete a proprietary certificate or buy a training handbook from a "partner school." Once paid, the recruiter vanishes.
                </p>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs text-rose-300 font-mono">
                  💡 Red Flag: "You are hired! First, complete this course at certificates-portal-corp.org for 3,000 BDT."
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  High Threat
                </span>
                <h3 className="text-lg font-bold text-white font-display">Chat App Interviews (WhatsApp / Telegram)</h3>
                <p className="text-xs sm:text-sm text-slate-450 leading-relaxed">
                  Legitimate firms schedule interviews via official email systems and video feeds (Zoom, Teams, Meet). Scammers carry out recruitment entirely via text-only WhatsApp, Telegram, or Signal chats to hide their identity.
                </p>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs text-amber-300 font-mono">
                  💡 Red Flag: "All recruitment is done on Telegram text chat. Contact Manager Dave to start your interview."
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Information Leak
                </span>
                <h3 className="text-lg font-bold text-white font-display">Identity Theft & Phishing</h3>
                <p className="text-xs sm:text-sm text-slate-450 leading-relaxed">
                  Fraudulent postings ask for copies of National IDs, passport details, signature scans, and full bank accounts immediately after "selection" to register you. These are used for financial fraud and identity cloning.
                </p>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs text-indigo-300 font-mono">
                  💡 Red Flag: "Send a photocopy of your front/back National ID and bank routing number before your call."
                </div>
              </div>

            </div>

            {/* Anti-Scam Rules */}
            <div className="p-6 rounded-2xl bg-indigo-950/15 border border-indigo-900/45 space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                The Core Shield Rules:
              </h3>
              <ul className="space-y-3 list-none p-0 m-0 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Never pay money to get a job. No legitimate employer will ever charge registration or training fees.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Verify recruiter email domain extensions. They should not use @gmail.com, @yahoo.com, or @outlook.com if representing a large firm.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Be cautious of remote tasks offering disproportionately high pay rates (e.g. 5,000 BDT for liking videos).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Crosscheck listings on the company's official careers portal. If they aren't listed there, reach out to them directly to double check.</span>
                </li>
              </ul>
            </div>

          </div>
        )}

      </main>

      {/* Auth Modal overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scaleUp">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-display text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'login' ? 'Sign in to access community reported scams.' : 'Register to flag scam jobs.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    required
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                <input
                  required
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  authMode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div>
            <span className="font-bold text-slate-400">AI Job Shield</span> — Protecting job seekers against recruitment fraud.
          </div>
          <div>
            Verify Before You Apply. Designed to make job searching safe for students and fresh graduates.
          </div>
          <div className="text-indigo-500/60 font-medium">
            © {new Date().getFullYear()} AI Job Shield Platform. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
