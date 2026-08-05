# 🛡️ AI Job Shield
> **Verify Before You Apply.** An AI-Powered Fake Job Detection & Scam Prevention Platform.

AI Job Shield is an intelligent, full-stack web platform designed to help job seekers—especially students, fresh graduates, and freelancers—identify fraudulent job postings before they apply. By analyzing job descriptions, company registry footprints, salary reasonability, grammar quality, recruiter details, and website safety scores, the platform calculates a weighted **Job Risk Score (0-100%)** to flag potential recruitment fraud.

---

## 🚀 Live Demo & Services
* **Backend API URL**: `https://ai-job-sheild.onrender.com`
* **Frontend Web Application**: *[Add your deployed Frontend Static Site URL here]*

---

## ⚡ Key Features
* **AI Job Risk Analysis**: Paste a job description and recruiter info to receive a detailed safety report, scam probability, and specific warning indicators.
* **scam Template Loaders**: Instant test buttons for standard scams (Telegram tasks, WhatsApp training fees, etc.) to demonstrate risk engine capabilities.
* **Company & Website Trust Checker**: Inspects domains, detects missing SSL/HTTPS encryption, identifies free blog hosting names (`.blogspot.com`), and flags potential corporate spoofing/phishing.
* **Salary Analyzer**: Compares offered compensation against market benchmarks to catch unrealistic pay claims.
* **Grammar & Tone Quality Audits**: Detects excessive exclamation marks (`!!!`), capitalizations (`URGENT`), and informal urgency pressure.
* **Community Scam Board**: A dashboard where users can report new scam listings and verify reported job ads, upvoting scam warning confirmations.
* **Scam Education Hub**: Interactive summaries of current recruitment scam vectors (training fees, registration fees, identity theft, money mules).

---

## 🛠️ Technology Stack
* **Frontend**: React.js, Tailwind CSS v4.0, Framer Motion (Transitions), Lucide React (Icons).
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (Mongoose) with an in-memory/JSON-file local database fallback if MongoDB is offline.
* **AI Integration**: Google Gemini API (`gemini-1.5-flash` for structured JSON risk calculations) with a regex-based client-side heuristic engine fallback.
* **Authentication**: Firebase Authentication architecture with a local mock provider for seamless out-of-the-box developer testing.

---

## 📐 Monorepo Project Structure
```
AI-Job-Shield/
├── backend/                       # Node/Express Backend API Service
│   ├── routes/api.js              # REST endpoints (/analyze, /reports)
│   ├── services/db.js             # Mongoose connection & local storage fallbacks
│   └── services/riskEngine.js     # Heuristics & Google Gemini AI analyzer
│
└── frontend/                      # React SPA Client Service
    ├── vite.config.js             # Vite config with Tailwind CSS v4 integration
    ├── src/App.jsx                # Main portal, dashboard, and hubs
    └── src/context/AuthContext.jsx# Authentication session controller
```

---

## ⚙️ Running Locally

### Prerequisites
* [Node.js](https://nodejs.org) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (Optional - runs on local mock storage if offline)

### Installation
1. Clone your repository:
   ```bash
   git clone https://github.com/Amirun-Nahar/AI-Job-Sheild.git
   cd AI-Job-Sheild
   ```
2. Install all monorepo dependencies (root, backend, and frontend):
   ```bash
   npm run install-all
   ```

### Configuration
1. Open `backend/.env` (or create it) and configure your secrets:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-job-shield
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   *Note: If `GEMINI_API_KEY` is left blank, the backend will automatically use its internal regex-based rule analyzer.*

### Execution
Start the Express API server and Vite React app concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🗝️ Live Environment Variables Setup

When deploying to platforms like Render:

### Backend Variables
* `GEMINI_API_KEY`: Your Gemini API developer key.
* `MONGODB_URI`: Cloud database connection string (e.g. MongoDB Atlas).

### Frontend Variables
* `VITE_API_URL`: The URL of your deployed backend endpoint + `/api` (e.g., `https://ai-job-sheild.onrender.com/api`).
