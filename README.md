# ✈️ PrepPilot — Your AI Co-Pilot for Interview Success

> An AI-powered interview preparation platform that helps job seekers practice mock interviews, analyze resumes, decode job descriptions, and track performance — all in one place.

---

## 🚀 Live Demo

- **Frontend:** [preppilot.vercel.app](https://preppilot.vercel.app)
- **Backend API:** [preppilot-api.onrender.com](https://preppilot-api.onrender.com)

---

## 📌 Features

### 🔐 1. Authentication
- Register and login with Email/Password via **Firebase Auth**
- Protected routes — unauthenticated users are redirected to login
- User profile stores target role and target companies for personalized prep

---

### 📄 2. Resume Analyzer
- Upload your resume as a **PDF**
- Extracts full text using **pdf-parse**
- AI analyzes and returns:
  - **Score out of 100**
  - Identification of **weak sections** (missing skills, poor formatting signals, vague bullet points)
  - Specific **rewrite suggestions** for low-scoring sections
- Score history tracked over time on the Performance Dashboard

---

### 🔍 3. Job Description Analyzer
- Paste any job description
- AI extracts and returns:
  - **Required skills** for the role
  - **Missing skills** compared to your resume
  - **Red flags** in the JD (unrealistic expectations, vague scope, etc.)
  - **Match score** between your profile and the JD

---

### 🎯 4. AI Mock Interview
- Paste a job description to generate **role-specific interview questions** using Gemini 1.5 Flash
- Questions are asked **one at a time** — just like a real interview
- Type your answer for each question
- AI evaluates each answer and provides:
  - **Score out of 10**
  - **Detailed feedback**
  - **Suggested better answer**
- At the end of the session, a **final report** is generated with:
  - Overall score
  - Strong areas
  - Areas for improvement
  - Personalized recommendations

---

### 📊 5. Performance Dashboard
- Visual charts powered by **Recharts** showing:
  - Interview score trends across all sessions
  - Weak and strong skill areas identified over time
  - Resume score history
  - JD match score history
- Helps identify patterns in preparation progress

---

### 📚 6. Community Question Bank
- Users can **submit real interview questions** from companies they've interviewed at
- Questions are categorized by **company** and **role**
- Community can **upvote** useful questions
- Searchable and filterable by company, role, and difficulty

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | Firebase Auth |
| **AI** | Gemini 1.5 Flash API |
| **PDF Parsing** | pdf-parse |
| **Charts** | Recharts |
| **Streaming** | Server-Sent Events (SSE) |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---


## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Firebase project with Email/Password auth enabled
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/preppilot.git
cd preppilot
```

---

### 2. Backend Setup

```bash
cd preppilot-api
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/preppilot
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

Place your Firebase `serviceAccountKey.json` in the root of `preppilot-api/`.

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd preppilot-client
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Update `src/config/firebase.js` with your Firebase project config.

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`preppilot-api/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `CLIENT_URL` | Frontend URL for CORS |
| `GEMINI_API_KEY` | Google Gemini API key |

### Frontend (`preppilot-client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---


## 🧠 AI Features in Detail

### Prompt Engineering
PrepPilot uses carefully crafted prompts with Gemini 1.5 Flash to:
- Generate role-specific interview questions from any JD
- Evaluate answers with structured JSON output (score, feedback, better answer)
- Analyze resumes section by section
- Extract skill requirements and red flags from JDs
- Generate comprehensive end-of-session performance reports

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request


## 👨‍💻 Author

**Shreyas KS**
- GitHub: [@yourusername](https://github.com/ShreyasGowda21)
- Email: shreyushreyasgowda4@email.com

---

> ✈️ *PrepPilot — Built by a job seeker, for job seekers.*
