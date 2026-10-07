# AI Career Guidance Portal

A complete, full-stack AI-driven career counseling, skill mapping, and learning roadmap platform designed for students, early-career engineers, and job seekers transitioning across tech domains.

The portal algorithmically matches users to careers using a blend of **deterministic weighted skill alignment (60%)** and a **k-Nearest Neighbors (k-NN) machine learning classifier (40%)**, complemented by **natural language processing (NLP)** for resume diagnostics, **linear regression** for skill demand forecasting, and **Google Gemini** for qualitative, empathetic career counseling and customized 6-week learning curricula.

---

## 🌟 Key Features

1. **Secure Authentication & Session Management**:
   - Register, login, logout, and `/api/auth/me` profile persistence.
   - Passwords securely hashed with `bcrypt`.
   - JWT tokens stored in `httpOnly`, `sameSite=lax` cookies.
   - Comprehensive input validation on all routes via `zod`.

2. **Interactive Career & Skill Assessment**:
   - 3-step evaluation: Education background, Passion/Interest domains, and Self-evaluated technical skills (rated 1 to 5).
   - **Weighted Domain Alignment**: Evaluates required skill weights and interest tags for all careers.
   - **k-NN Machine Learning Prediction**: Classifies user skill vectors against a synthetic distribution across 20 canonical tech competencies.
   - **Blended Ranking**: Combines 60% rule-based weighted match + 40% k-NN classifier.
   - **AI Explanation**: Google Gemini provides friendly, contextual rationale for the top 3 recommended paths without tampering with algorithmic rankings.
   - **Model Transparency Box**: Displays test accuracy (k=7) and explicit synthetic data disclaimers.

3. **Deterministic Skill Gap Analysis**:
   - Instant gap breakdown for each career: Missing skills (unrated), Weak/Maturing skills, and Strong competencies.
   - Recharts visual Bar Chart comparing Target Required Weight vs Current Competency (1 to 5).
   - Zero-AI dependency ensures reliable, deterministic results.

4. **3-Year Skill Demand Forecasting**:
   - Simple Linear Regression (`ml-regression`) fitted on multi-year demand indices (2020–2025).
   - Projects market demand through 2028 for target career competencies.
   - Visualized via interactive Recharts multi-series line chart with forecast demarcation.

5. **AI-Driven 6-Week Learning Roadmaps**:
   - Generates week-by-week actionable curricula with milestone tasks, free documentation/tutorials, and a capstone mini-project.
   - Validated against strict Zod schemas with automatic retry and curated fallback mechanisms.
   - Interactive task checklist with persistent database progress tracking and visual percentage bars.

6. **NLP Resume Analyzer & Keyword Alignment**:
   - In-memory PDF upload (`multer.memoryStorage()`, 5MB limit, never written to disk).
   - Text extraction via `pdf-parse`.
   - NLP with `natural`: tokenization, Porter stemming, stopword filtering, and TF-IDF cosine similarity.
   - Displays a transparent **"Match and Readiness Estimate"** (never an arbitrary ATS rejector).
   - Highlights present vs missing keywords and provides high-impact rewrite suggestions.

7. **Context-Aware AI Counselor Chatbot**:
   - Interactive career counselor aware of the user's top career match, skill gaps, and background.
   - Maintains a 10-message conversational memory saved in PostgreSQL.
   - Graceful fallback mode ensures full utility even without an active Gemini API key.

8. **Unified Career Command Center (Dashboard)**:
   - High-level overview of top career match, readiness percentages, roadmap completion progress, and latest resume scores.

---

## 🛠 Tech Stack

- **Frontend**:
  - React 18
  - Vite 6
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - React Router DOM v7
  - Axios (with credentials and centralized error interceptor)
  - Recharts (Bar Charts, Line Charts)
  - Lucide React (Icons)
- **Backend**:
  - Node.js 18+ (ES Modules: `"type": "module"`)
  - Express
  - PostgreSQL & `pg` (parameterized queries)
  - `bcrypt` & `jsonwebtoken`
  - `cookie-parser`, `cors`, `helmet`, `express-rate-limit`
  - `multer` (memoryStorage) & `pdf-parse`
  - `zod` schema validation
- **AI / ML / NLP**:
  - **LLM**: Google Gemini API (`@google/generative-ai`) with timeout, retry, and structured fallbacks
  - **NLP**: `natural` (Tokenization, Porter Stemmer, TF-IDF cosine similarity, keyword analysis)
  - **Machine Learning**: `ml-knn` (career prediction classifier) and `ml-regression` (simple linear regression for skill demand forecasting)

---

## 📁 Folder Structure

```text
career-portal/
├── README.md
├── .gitignore
├── package.json               # Root scripts: install:all, dev (concurrently)
├── frontend/
│   ├── package.json
│   ├── vite.config.js         # Configured with @tailwindcss/vite & /api proxy to :5000
│   ├── .env.example
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Router and protected route definitions
│       ├── index.css          # Tailwind CSS v4 setup
│       ├── api/
│       │   └── client.js      # Axios instance with credentials & interceptor
│       ├── components/
│       │   ├── Button.jsx
│       │   ├── Card.jsx
│       │   ├── Input.jsx
│       │   ├── Spinner.jsx
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx
│           ├── Assessment.jsx
│           ├── AssessmentResult.jsx
│           ├── Careers.jsx
│           ├── CareerDetail.jsx
│           ├── Roadmaps.jsx
│           ├── ResumeAnalyzer.jsx
│           └── Chatbot.jsx
└── backend/
    ├── package.json
    ├── server.js              # Server entry point with db verify & shutdown handling
    ├── .env.example
    └── src/
        ├── app.js             # Express app, helmet, CORS, rate limits, routes
        ├── config/
        │   └── db.js          # PostgreSQL connection pool
        ├── middleware/
        │   ├── auth.js        # JWT verify & optionalAuthenticate
        │   ├── validate.js    # Zod request validator
        │   └── errorHandler.js # Standardized error and 404 responses
        ├── controllers/
        │   ├── authController.js
        │   ├── careerController.js
        │   ├── assessmentController.js
        │   ├── roadmapController.js
        │   ├── resumeController.js
        │   ├── chatController.js
        │   └── dashboardController.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── careerRoutes.js
        │   ├── assessmentRoutes.js
        │   ├── roadmapRoutes.js
        │   ├── resumeRoutes.js
        │   ├── chatRoutes.js
        │   └── dashboardRoutes.js
        ├── services/
        │   ├── aiService.js       # Gemini generateText & generateJSON with fallbacks
        │   ├── nlpService.js      # Natural TF-IDF, stemming & cosine similarity
        │   ├── mlService.js       # k-NN classifier & SimpleLinearRegression
        │   ├── matchService.js    # 60/40 blended scoring & top-3 AI explanation
        │   └── skillGapService.js # Deterministic gap analysis & chart data
        ├── ml/
        │   ├── generateData.js    # Synthetic ML dataset generation & k-NN train
        │   └── data/
        │       ├── trainingData.json
        │       └── forecastData.json
        └── db/
            ├── schema.sql         # Idempotent database schema
            ├── seed.sql           # Realistic seed for 10 career paths
            └── setup.js           # Automated database initialization script
```

---

## 📋 Prerequisites

Before starting, ensure you have:
1. **Node.js 18+** installed (`node -v`).
2. **PostgreSQL 14+** installed and running locally, or a cloud PostgreSQL instance (Neon, Supabase, Render, AWS RDS).
3. *(Optional)* **Google Gemini API Key**:
   - Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
   - *Note: If no API key is provided, the app will continue to function fully using built-in curated fallbacks.*

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Clone or Navigate to the Project

```bash
cd career-portal
```

### Step 2: Install All Dependencies

You can install all root, backend, and frontend dependencies in one command:

```bash
npm run install:all
```

*(Or individually by running `npm install` at the root, inside `backend/`, and inside `frontend/`)*.

---

### Step 3: Configure Environment Variables

1. **Backend Environment**:
   Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   # On Windows PowerShell:
   Copy-Item backend/.env.example backend/.env
   ```
   Inspect `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_portal
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key_optional
   GEMINI_MODEL=gemini-1.5-flash
   ```

2. **Frontend Environment**:
   Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   # On Windows PowerShell:
   Copy-Item frontend/.env.example frontend/.env
   ```
   ```env
   VITE_API_URL=/api
   ```

---

### Step 4: Database Setup

You can set up PostgreSQL using either the command line (`psql`), pgAdmin, or the automated script.

#### Option A: Using the Automated Setup Script (Recommended)
Make sure your PostgreSQL server is running and your credentials in `backend/.env` are correct, then run:

```bash
npm run db:setup
```

This will automatically create the `career_portal` database if it doesn't already exist, apply `schema.sql`, and seed the 10 careers from `seed.sql`.

#### Option B: Using `psql` (CLI)
```bash
# Connect to your PostgreSQL instance
psql -U postgres

# Create the database
CREATE DATABASE career_portal;

# Connect to the new database
\c career_portal;

# Execute the schema and seed scripts
\i backend/src/db/schema.sql
\i backend/src/db/seed.sql

# Exit
\q
```

#### Option C: Using pgAdmin 4
1. Open pgAdmin 4 and connect to your server.
2. Right-click on **Databases** -> **Create** -> **Database...**
3. Name it `career_portal` and click **Save**.
4. Right-click on `career_portal` and select **Query Tool**.
5. Open and run `backend/src/db/schema.sql`.
6. Open and run `backend/src/db/seed.sql`.

---

### Step 5: Train / Verify the ML Classifier

Generate the synthetic training vectors and verify the k-NN model accuracy:

```bash
npm run ml:train
```

This generates `trainingData.json` and `forecastData.json` inside `backend/src/ml/data/`.

---

### Step 6: Start the Application

Start both the backend and frontend simultaneously with:

```bash
npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login user and issue JWT cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/careers` | List all seeded careers with skills and demand | No |
| `GET` | `/api/careers/:id` | Fetch specific career details | No |
| `GET` | `/api/careers/:id/skill-gap` | Calculate deterministic skill gap for career | Optional |
| `GET` | `/api/careers/:id/forecast` | Forecast 3-year demand via linear regression | No |
| `POST` | `/api/assessments` | Submit 3-step assessment and compute matches | Yes |
| `GET` | `/api/assessments/latest` | Fetch user's latest assessment & AI report | Yes |
| `GET` | `/api/assessments` | Fetch user assessment history | Yes |
| `POST` | `/api/roadmaps/generate` | Generate 6-week curriculum via Gemini/Fallback | Yes |
| `GET` | `/api/roadmaps` | List user's active roadmaps | Yes |
| `GET` | `/api/roadmaps/:id` | Get roadmap details and completion progress | Yes |
| `PUT` | `/api/roadmaps/:id/tasks/:taskId` | Toggle task completion status | Yes |
| `POST` | `/api/resume/analyze` | Upload PDF (memory) and analyze via NLP & AI | Yes |
| `GET` | `/api/resume/history` | List user's past resume analyses | Yes |
| `GET` | `/api/resume/:id` | Retrieve single resume diagnosis | Yes |
| `POST` | `/api/chat` | Send message to career counselor with context | Yes |
| `GET` | `/api/chat/history` | Fetch 10-message chat history | Yes |
| `DELETE` | `/api/chat/history` | Clear chat message history | Yes |
| `GET` | `/api/dashboard` | Fetch consolidated command center metrics | Yes |
| `GET` | `/api/health` | Service uptime and status check | No |

---

## 🧠 How the AI & ML System Works

```
                        [User Skills & Interests]
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
      Weighted Domain Matching             k-NN Classifier (k=7)
       (Deterministic 60%)                 (Trained Vector 40%)
                 │                                   │
                 └─────────────────┬─────────────────┘
                                   ▼
                         Blended Final Score
                                   │
                                   ▼
                        Google Gemini Explainer
                   (Explains Top 3 in friendly language;
                    Never alters algorithmic rankings)
```

1. **Weighted Match Percentage (`matchService.js`)**:
   - Each career defines required skills with weights from 1 to 5.
   - User evaluates their proficiency (1 to 5).
   - Match score computes normalized earned points against max possible weight points, plus an interest alignment factor.

2. **k-NN Classifier (`mlService.js`)**:
   - Trained using `ml-knn` on a synthetic dataset of 800 profiles across 10 career labels with randomized Gaussian variance.
   - Evaluates the nearest $k=7$ neighbors in 20-dimensional skill space to produce a probability distribution.
   - Computes test accuracy on a 20% holdout split.

3. **Natural Language Processing (`nlpService.js`)**:
   - Extracts text from PDF buffer using `pdf-parse` in memory.
   - Cleans stopwords, tokenizes words, and stems with `PorterStemmer`.
   - Computes TF-IDF vectors for the resume and target job requirements, calculating cosine similarity.
   - Evaluates keyword presence vs absence to generate a **Match and Readiness Estimate**.

4. **Demand Forecasting (`mlService.js`)**:
   - Fits multi-year market demand indices (2020–2025) using `SimpleLinearRegression`.
   - Extrapolates future trajectory for 2026, 2027, and 2028.

5. **Google Gemini LLM (`aiService.js`)**:
   - Acts strictly as an empathetic qualitative advisor.
   - Generates 6-week curriculum JSON validated with Zod, actionable resume rewrites, and chat guidance.
   - If `GEMINI_API_KEY` is not supplied or fails, curated fallbacks ensure seamless operation.

---

## ⚙️ Troubleshooting

- **Database Connection Error (`ECONNREFUSED` / `password authentication failed`)**:
  - Verify PostgreSQL is running: on Windows run `Get-Service *postgres*`, on Linux/macOS run `sudo systemctl status postgresql` or `brew services list`.
  - Check your password and port (default `5432`) in `backend/.env`.
- **Port In Use (`EADDRINUSE: 5000` or `5173`)**:
  - Kill the process holding the port:
    - Windows PowerShell: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force`
    - macOS / Linux: `lsof -ti :5000 | xargs kill -9`
- **Cookie / CORS Issues in Development**:
  - In development, ensure `CLIENT_URL=http://localhost:5173` matches your browser URL.
  - Cookies use `sameSite: 'lax'`, compatible with `localhost`.
- **PDF Upload Fails**:
  - Ensure the uploaded file has a `.pdf` extension and is under 5 MB.
  - Ensure the document contains selectable text (not scanned images without OCR).
- **Missing Gemini API Key**:
  - The application automatically falls back to curated structured outputs; no application crashes occur.

---

## ☁️ Deployment Notes

- **Database**: Provision a managed PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com). Copy the connection URI into `DATABASE_URL`. Set `NODE_ENV=production`.
- **Backend**: Deploy on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io]. Set environment variables and configure start command as `npm run start`.
- **Frontend**: Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Configure build command `npm run build` with output directory `dist`, and set `VITE_API_URL` to your production backend URL.

---

## 🔮 Limitations & Future Scope

- **Synthetic ML Training Data**: Current k-NN model is trained on synthetic Gaussian-perturbed skill profiles; future iterations could train on anonymized real-world cohort data.
- **Mock Interviews**: Interactive voice/video technical screening simulation.
- **Live Job Board Aggregation**: Integration with LinkedIn / Indeed / Adzuna APIs for real-time job opening counts.
- **OAuth Providers**: Support for Google and GitHub single sign-on (SSO).
- **Multilingual Support**: Localization for international students and non-English speakers.
