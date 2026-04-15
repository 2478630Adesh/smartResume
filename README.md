# 🚀 ResumeIQ — Smart Resume Builder & Analyzer

A full-stack MERN (MongoDB, Express, React, Node.js) application for building, analyzing, and optimizing resumes with ATS scoring, skill gap analysis, and a complete HR recruitment pipeline.

---

## 📋 Features Overview

### 👤 User Authentication & Authorization
- User registration and login with JWT-based authentication
- Password encryption with bcrypt (12 salt rounds)
- Role-based access control: **Job Seeker** and **HR/Recruiter**
- Secure session handling with token expiration

### 📝 User Profile Management
- Complete profile with personal info, education, skills, projects, experience, certifications
- Social links (GitHub, LinkedIn, Portfolio, Twitter)
- Tabbed interface for easy management
- Profile strength indicator on dashboard

### 📄 Resume Builder
- Auto-generate resume from profile data
- 2 professional templates (Modern & Elegant)
- Live preview in iframe
- Download as PDF (print-to-PDF)
- Responsive resume layout

### 📤 Resume Upload & Management
- Drag-and-drop file upload
- Support for PDF and DOCX files (max 10MB)
- Automatic skill extraction from uploaded resumes
- Resume library for job applications

### 💼 Job Dashboard (User Side)
- Browse all active job listings
- Search by title, company, or skills
- Filter by job type and experience level
- Job detail page with full description

### 📨 Job Application System
- One-click apply with resume selection
- ATS score calculated on application
- Application tracking with status updates
- Application history page

### 🎯 Skill Gap Analysis
- Compare your skills against job requirements
- Matching skills and missing skills identification
- Match percentage calculation
- Actionable improvement suggestions

### 📊 ATS Score / Resume Matching
- Weighted ATS scoring algorithm:
  - Skill matching (40%)
  - Keyword matching (25%)
  - Resume structure (20%)
  - Experience relevance (15%)
- Score breakdown visualization
- Score range: 0-100%

### 🔍 Job Description Analyzer
- Paste any job description from external platforms
- Automatic skill extraction (100+ tech skills database)
- Experience level detection
- Job type classification
- Profile match comparison

### 🏢 HR Dashboard
- Post new job openings with full details
- Edit or delete job postings
- View applicants per job
- Application status management (Pending, Reviewed, Shortlisted, Rejected)

### 👥 Applicant Management & Leaderboard
- Candidates ranked by ATS score
- Skill match visualization per candidate
- Status dropdown for quick updates
- Gold/Silver/Bronze rank badges

---

## 🛠 Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | React 18, React Router 6, Axios, Chart.js     |
| Styling   | Custom CSS (Dark Theme), Framer Motion         |
| Backend   | Node.js, Express.js                            |
| Database  | MongoDB with Mongoose ODM                      |
| Auth      | JWT, bcryptjs                                  |
| Upload    | Multer (PDF/DOCX)                              |
| Parsing   | pdf-parse, mammoth                             |
| Icons     | react-icons (Feather Icons)                    |
| Toast     | react-hot-toast                                |

---

## 📁 Project Structure

```
smart-resume-builder/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile CRUD
│   │   ├── jobController.js       # Jobs CRUD, apply, leaderboard
│   │   └── resumeController.js    # Upload, generate, skill gap
│   ├── middleware/
│   │   ├── auth.js                # JWT verify & role-based access
│   │   └── upload.js              # Multer file upload config
│   ├── models/
│   │   ├── User.js                # User schema with profile fields
│   │   └── Job.js                 # Job schema with applicants
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── resumeRoutes.js
│   ├── utils/
│   │   ├── atsAnalyzer.js         # ATS scoring algorithm
│   │   └── generateToken.js       # JWT token generator
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env                       # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/              # Login, Register
│   │   │   ├── Dashboard/         # User Dashboard
│   │   │   ├── HR/                # HR Dashboard, Post Job
│   │   │   ├── Jobs/              # Job List, Detail, Applications
│   │   │   ├── Layout/            # Navbar, Sidebar, shared components
│   │   │   ├── Profile/           # Profile management
│   │   │   └── Resume/            # Builder, Upload, JD Analyzer
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth state management
│   │   ├── pages/
│   │   │   └── Landing.js         # Landing page
│   │   ├── styles/
│   │   │   └── App.css            # Complete design system
│   │   ├── utils/
│   │   │   ├── api.js             # Axios instance with interceptors
│   │   │   └── helpers.js         # Utility functions
│   │   ├── App.js                 # Router & route config
│   │   └── index.js               # React entry
│   └── package.json
├── package.json                   # Root scripts
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally or a MongoDB Atlas connection string
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Clone the project
cd smart-resume-builder

# Install all dependencies (root + backend + frontend)
npm run install-all
```

### 2. Configure Environment

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/smart_resume_builder
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string.

### 3. Run the Application

```bash
# Start both backend and frontend concurrently
npm run dev

# Or run separately:
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

### 4. Open in Browser

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint            | Description        | Auth |
|--------|---------------------|--------------------|------|
| POST   | /api/auth/register  | Register user      | No   |
| POST   | /api/auth/login     | Login user         | No   |
| GET    | /api/auth/profile   | Get profile        | Yes  |
| PUT    | /api/auth/profile   | Update profile     | Yes  |

### Jobs
| Method | Endpoint                              | Description            | Auth | Role |
|--------|---------------------------------------|------------------------|------|------|
| GET    | /api/jobs                             | Get all active jobs    | Yes  | Any  |
| GET    | /api/jobs/:id                         | Get single job         | Yes  | Any  |
| POST   | /api/jobs                             | Create job             | Yes  | HR   |
| PUT    | /api/jobs/:id                         | Update job             | Yes  | HR   |
| DELETE | /api/jobs/:id                         | Delete job             | Yes  | HR   |
| POST   | /api/jobs/:id/apply                   | Apply for job          | Yes  | User |
| GET    | /api/jobs/hr/myjobs                   | Get HR's jobs          | Yes  | HR   |
| GET    | /api/jobs/:id/applicants              | Get applicant board    | Yes  | HR   |
| PUT    | /api/jobs/:jobId/applicants/:appId    | Update app status      | Yes  | HR   |
| POST   | /api/jobs/analyze                     | Analyze JD             | Yes  | Any  |
| GET    | /api/jobs/my-applications             | Get user applications  | Yes  | User |

### Resume
| Method | Endpoint               | Description        | Auth |
|--------|------------------------|--------------------|------|
| POST   | /api/resume/upload     | Upload resume      | Yes  |
| GET    | /api/resume            | Get all resumes    | Yes  |
| DELETE | /api/resume/:resumeId  | Delete resume      | Yes  |
| POST   | /api/resume/generate   | Generate resume    | Yes  |
| POST   | /api/resume/skill-gap  | Skill gap analysis | Yes  |

---

## 🎨 Design System

The app uses a **premium dark theme** with:
- **Primary**: Indigo/Purple gradient (#6366f1 → #a855f7)
- **Secondary**: Teal/Cyan (#06d6a0 → #22d3ee)
- **Typography**: DM Sans (body) + Space Mono (numbers)
- **Components**: Cards with glow effects, gradient buttons, animated score circles, progress bars
- **Animations**: Fade-in-up page transitions, hover effects, skeleton loading

---

## 📊 ATS Scoring Algorithm

The ATS analyzer uses a weighted scoring system:

1. **Skill Match (40%)** — Direct comparison of resume skills vs job requirements
2. **Keyword Match (25%)** — NLP keyword extraction and comparison from descriptions
3. **Structure Score (20%)** — Checks for proper resume sections, contact info, links
4. **Experience Relevance (15%)** — Word overlap between resume and job description

---

## 🧪 Test Accounts

After starting the app, register with:
- **Job Seeker**: Any email with role "user"
- **HR/Recruiter**: Any email with role "hr"

---

## 📌 Key Highlights for Final Year Project

1. **Full-Stack MERN Architecture** with REST API design
2. **JWT Authentication** with bcrypt password hashing
3. **Role-Based Access Control** (User vs HR)
4. **ATS Scoring Algorithm** — a real-world NLP-based matching system
5. **Skill Gap Analysis** with actionable suggestions
6. **JD Parser** — extracts skills from unstructured text
7. **Candidate Leaderboard** — ranked by algorithm score
8. **File Upload System** with Multer (PDF/DOCX parsing)
9. **Professional Dark UI** with custom CSS design system
10. **Resume Generator** with template selection and PDF export

---

## 📜 License

MIT License — Free to use for educational purposes.

---

Built with ❤️ for Final Year Project | MERN Stack | 2026
