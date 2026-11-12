# CreateCode AI

> **Write Smarter. Debug Faster. Build Better.**

CreateCode AI is a complete, production-ready, AI-powered developer productivity platform built with the MERN stack (MongoDB, Express, React, Node.js). It consolidates code execution, AI-driven debugging and optimization, automated pull request reviews, vulnerability scanning, and personal developer analytics into a single workspace.

---

## 📸 Visual Design & Two Full Themes

CreateCode AI faithfully recreates the visual direction, layout structure, navigation, card design, spacing, and typography of the design references:

- **Dark Theme (Default)**: Deep charcoal background (`#080F17`), sleek sidebar (`#0D1722`), elevated cards (`#111E2B`), crisp teal accents (`#12D6C5`), cyan highlights (`#38BDF8`), and clear white typography (`#F1F5F9`).
- **Light Theme**: Crisp off-white canvas (`#F3F7FA`), pure white cards (`#FFFFFF`), subtle borders (`#D8E3EA`), dark navy typography (`#0F172A`), and teal accents (`#089E9A`).
- **Persistent Preferences**: Theme state switches instantly without page reload and persists across sessions via `localStorage`.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS with custom palette tokens
- **Routing**: React Router v6
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Visual Analytics**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer token & cookie credentials

### Backend
- **Runtime**: Node.js v18+ & Express.js
- **Database**: MongoDB & Mongoose (with automated in-memory MongoDB fallback for instant zero-config testing)
- **Authentication**: JWT & HTTP-only cookies, bcryptjs password hashing, Passport.js OAuth strategies
- **AI Intelligence**: Google Gemini API integration (with structured JSON schemas & resilient semantic analyzer fallback)
- **Code Execution**: Judge0 API multi-language runner (C, C++, Java, Python, JavaScript)
- **Static Analysis & Security**: AST and regex-based vulnerability & code quality scanner
- **GitHub**: GitHub REST API client, OAuth token exchange, Webhook HMAC signature verification
- **Background Jobs**: BullMQ & Redis (with resilient asynchronous in-process queue worker)

---

## 🚀 Key Modules & Capabilities

1. **AI Coding Assistant (`/chat`)**:
   - 7 AI Modes: *Debug*, *Optimize*, *Explain*, *Security*, *Complexity Analysis*, *Code Conversion*, and *Generate Test Cases*.
   - Structured JSON responses: Error Detection alert box, optimized code blocks with one-click copy, time/space complexity estimations, and verified edge test cases.
   - Persistent conversation threads categorized by *Today*, *Yesterday*, and *This Week*.

2. **Code Playground (`/playground`)**:
   - Browser-based Monaco Editor supporting C, C++, Java, Python, and JavaScript.
   - Custom `stdin` input stream support.
   - Remote execution via Judge0 API displaying runtime, memory footprint, compile errors, and stdout.

3. **AI Code Review & Static Analysis (`/reviews`)**:
   - Dual-engine review analyzing code snippets, files, and pull requests.
   - Score breakdown: Overall Score (e.g. 86/100), Code Quality (88%), Security (80%), Performance (85%), Maintainability (90%).
   - Line-by-line findings with severity tags (Critical, High, Medium, Low), impact explanations, and suggested code diffs.

4. **GitHub Integration & Automated PR Reviews (`/github`)**:
   - Connection status, account binding, and repository picker.
   - Webhook listener verifying HMAC SHA-256 signatures (`x-hub-signature-256`).
   - Automated review triggers when PRs are opened or updated.
   - Automated PR review comment publisher.

5. **Issues & Security Findings (`/issues`)**:
   - Central tracker for vulnerabilities (SQL injection, hardcoded secrets, DOM XSS, off-by-one loops).
   - Status transitions: *Open*, *Resolved*, *Dismissed*, *False Positive*.

6. **Developer Productivity Analytics (`/analytics`)**:
   - Time-range filters: Last 7 Days, Last 30 Days, Last 90 Days.
   - Metric cards: Reviews Completed (+18%), Bugs Found (-24%), Security Issues (-40%), Code Quality (+6%).
   - Code Quality Trend line chart and Issue Distribution donut chart.

7. **Profile & Settings (`/settings`)**:
   - Tabs: Profile, Accounts, Preferences, Security, and API Usage quotas.

---

## 💻 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Installation
Clone or navigate to the project directory and run:
```bash
npm install
```
*(This installs dependencies for both `server` and `client` via npm workspaces).*

### 3. Environment Configuration
Create `.env` inside `server/`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/createcode
JWT_SECRET=createcode_jwt_secret_super_secure_key_abcdef_987654
SESSION_SECRET=createcode_session_secret_super_secure_key_123456
TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# External API Integrations (Optional - built-in resilient engines run if keys are omitted)
GEMINI_API_KEY=your_gemini_api_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_judge0_key_here
REDIS_URL=redis://127.0.0.1:6379
GITHUB_WEBHOOK_SECRET=createcode_webhook_secret_key_12345
```

### 4. Running the Application
To run the full stack concurrently:

**Start the Backend Server (Port 5000):**
```bash
npm run server
```

**Start the Frontend Client (Port 5173):**
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎯 Instant Demo / Interview Mode
For recruiters, interviewers, and evaluators:
1. Click **"View Live Demo"** on the landing page, or **"Instant Demo Access"** on `/auth`.
2. Automatically signs in as **Rohit Sharma (`rohit-dev`)** with pre-seeded projects, review #CR-142, AI chat history, and analytics metrics matching the UI reference screenshots.

