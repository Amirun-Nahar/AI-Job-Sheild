import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'reports.json');

// Ensure local data directory exists
const dataDir = path.dirname(LOCAL_DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial structure for local JSON database if it doesn't exist
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2));
}

let isUsingMongoDB = false;

// Connect to MongoDB with fallback
export async function connectDB(uri) {
  if (!uri) {
    console.log('⚠️ No MONGODB_URI provided. Falling back to local JSON file storage.');
    return;
  }
  try {
    // Set a short timeout so it doesn't block server startup indefinitely if Mongo is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isUsingMongoDB = true;
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection failed. Falling back to local JSON storage.', error.message);
    isUsingMongoDB = false;
  }
}

// Report Schema for MongoDB
const reportSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  platform: { type: String, required: true },
  scamType: { type: String, required: true },
  contactInfo: { type: String, default: '' },
  description: { type: String, default: '' },
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, default: 'Unverified' },
  confirmations: { type: Number, default: 1 },
  reportedBy: { type: String, default: 'Anonymous' },
  createdAt: { type: Date, default: Date.now }
});

const ReportModel = mongoose.models.Report || mongoose.model('Report', reportSchema);

// JSON DB Helper Functions
function readLocalDB() {
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return [];
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to local JSON db:', err);
  }
}

// Unified Database API
export async function getAllReports() {
  if (isUsingMongoDB) {
    return await ReportModel.find().sort({ createdAt: -1 });
  } else {
    const reports = readLocalDB();
    // Sort descending by date
    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function createReport(reportData) {
  if (isUsingMongoDB) {
    const newReport = new ReportModel(reportData);
    return await newReport.save();
  } else {
    const reports = readLocalDB();
    const newReport = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...reportData,
      confirmations: reportData.confirmations || 1,
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    writeLocalDB(reports);
    return newReport;
  }
}

export async function confirmScam(id) {
  if (isUsingMongoDB) {
    return await ReportModel.findByIdAndUpdate(
      id,
      { $inc: { confirmations: 1 } },
      { new: true }
    );
  } else {
    const reports = readLocalDB();
    const index = reports.findIndex(r => r._id === id);
    if (index !== -1) {
      reports[index].confirmations = (reports[index].confirmations || 0) + 1;
      writeLocalDB(reports);
      return reports[index];
    }
    return null;
  }
}

// Add Mock Seed Data if Database is empty
export async function seedMockReportsIfEmpty() {
  const reports = await getAllReports();
  if (reports.length === 0) {
    console.log('🌱 Seeding mock community reports...');
    const seedData = [
      {
        jobTitle: 'Data Entry Representative (Remote)',
        companyName: 'Apex Healthcare Solutions (Fake)',
        platform: 'Telegram / WhatsApp',
        scamType: 'Registration Fee & Phishing',
        contactInfo: 'hr-department@gmail.com / +1 415-321-4456',
        description: 'Offered 45 USD per hour. Requested $150 registration fee for training materials and identity details via Telegram chat.',
        riskScore: 92,
        riskLevel: 'High Risk',
        confirmations: 42,
        reportedBy: 'Nahar (Graduate)'
      },
      {
        jobTitle: 'Social Media Evaluator',
        companyName: 'Global Operations LLC',
        platform: 'Facebook Ads',
        scamType: 'Training Fee Scam',
        contactInfo: 'info@global-evaluators-portal.com',
        description: 'Guarantees 5,000 BDT daily. Requires purchasing a proprietary certification guide for 2,000 BDT to unlock work.',
        riskScore: 84,
        riskLevel: 'High Risk',
        confirmations: 18,
        reportedBy: 'S. Al-Mamun'
      },
      {
        jobTitle: 'Remote Typing Assistant',
        companyName: 'Publishing Hub Limited',
        platform: 'LinkedIn',
        scamType: 'Identity Theft',
        contactInfo: 'career-publishinghub@gmail.com',
        description: 'High payment for simple PDF to MS Word typing. Demanded copy of National ID, Bank Details, and signature before interview.',
        riskScore: 78,
        riskLevel: 'High Risk',
        confirmations: 29,
        reportedBy: 'Anika.T'
      }
    ];
    for (const item of seedData) {
      await createReport(item);
    }
    console.log('✅ Seed reports injected.');
  }
}
