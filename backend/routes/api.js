import express from 'express';
import { analyzeJobPosting } from '../services/riskEngine.js';
import { getAllReports, createReport, confirmScam } from '../services/db.js';

const router = express.Router();

// Analyze job posting
router.post('/analyze', async (req, res) => {
  try {
    const params = req.body;
    if (!params.text) {
      return res.status(400).json({ error: 'Job description text is required for analysis.' });
    }
    const report = await analyzeJobPosting(params);
    return res.json(report);
  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    return res.status(500).json({ error: 'Failed to complete job safety analysis.' });
  }
});

// Fetch reported scams
router.get('/reports', async (req, res) => {
  try {
    const reports = await getAllReports();
    return res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Failed to retrieve community scam reports.' });
  }
});

// Submit a new scam report
router.post('/reports', async (req, res) => {
  try {
    const { jobTitle, companyName, platform, scamType, contactInfo, description, riskScore, riskLevel, reportedBy } = req.body;
    
    if (!jobTitle || !companyName || !platform || !scamType) {
      return res.status(400).json({ error: 'Job title, company name, platform, and scam type are required.' });
    }
    
    const newReport = await createReport({
      jobTitle,
      companyName,
      platform,
      scamType,
      contactInfo: contactInfo || '',
      description: description || '',
      riskScore: Number(riskScore) || 50,
      riskLevel: riskLevel || 'Unverified',
      reportedBy: reportedBy || 'Anonymous',
      confirmations: 1
    });
    
    return res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    return res.status(500).json({ error: 'Failed to submit community scam report.' });
  }
});

// Confirm/upvote a scam report
router.post('/reports/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await confirmScam(id);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Error confirming report:', error);
    return res.status(500).json({ error: 'Failed to confirm scam report.' });
  }
});

export default router;
