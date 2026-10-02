<div align="center">

# ⚖️ LEXORA
### *Autonomous Judicial Intelligence & Courtroom Platform*

[![Build](https://img.shields.io/badge/Build-1.0.0-blueviolet?style=for-the-badge)](https://github.com/Code-By-Aayush/Lexora)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **The world's first AI-powered judicial adjudication system** that autonomously conducts court proceedings, evaluates evidence, manages guilt meters, and delivers Supreme Court-style verdicts — all in real time.

</div>

---

## 🌟 Overview

**Lexora** is a next-generation **AI Judicial Intelligence Platform** that reimagines how legal disputes are adjudicated. Combining **Google Gemini AI**, a live **Guilt Meter** courtroom engine, and role-based judicial workflows, Lexora brings autonomous legal intelligence to the modern justice system.

Built for jurisdictions exploring AI-assisted dispute resolution, Lexora handles everything from FIR intake to final gavel — with structured human oversight at every tier.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| ⚖️ **AI Courtroom Engine** | Real-time adjudication powered by Google Gemini |
| 📊 **Live Guilt Meter** | Dynamic prosecution vs defense balance (0–100%) |
| 🏛️ **3-Tier Judicial System** | Full AI autonomy → Supervised AI → Human-led court |
| 📋 **FIR Analysis & Routing** | Automated case classification and tier assignment |
| 🔐 **JWT Authentication** | Secure role-based access (citizen, police, lawyer, judge, admin) |
| 📁 **Case Management** | Full lifecycle tracking from filing to verdict |
| 📝 **Final Verdict Engine** | Supreme Court-style formal judgments with legal seals |
| 🔄 **Evidence Submission** | Multi-party evidence and testimony tracking |

---

## 🏗️ Architecture

```
Lexora
├── frontend/                   # Vanilla HTML/CSS/JS Client
│   ├── index.html              # Main SPA entry point
│   ├── app.js                  # Core application logic (~52KB)
│   ├── styles.css              # Premium dark-mode UI (~40KB)
│   ├── court-audio.js          # Courtroom audio ambience engine
│   └── assets/                 # Static assets & logos
│
└── backend/                    # FastAPI Python Backend
    ├── requirements.txt        # All Python dependencies
    ├── .env.example            # Environment variable template
    └── app/
        ├── main.py             # Application entry point & CORS
        ├── api/
        │   ├── auth.py         # JWT auth, register, login
        │   ├── cases.py        # Case CRUD & guilt meter API
        │   └── ai_court.py     # Gemini AI judicial engine
        ├── models/
        │   ├── user.py         # User SQLAlchemy model
        │   ├── case.py         # Case model with guilt meter
        │   ├── evidence.py     # Evidence model
        │   └── guilt_meter_history.py  # Audit trail
        ├── schemas/
        │   ├── user.py         # Pydantic user schemas
        │   └── case.py         # Pydantic case schemas
        ├── core/
        │   ├── config.py       # Settings from .env
        │   └── security.py     # BCrypt + JWT utilities
        └── db/
            ├── session.py      # SQLAlchemy session factory
            └── init_db.py      # Database initializer
```

---

## 🧠 The 3-Tier Judicial System

Lexora's AI evaluates every FIR and routes it to the appropriate judicial tier:

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LEXORA JUDICIAL ROUTING ENGINE                    │
├─────────────────────────┬────────────────────────────────────────────┤
│  TIER 1 — Full AI       │  Score ≥ 70% | Commercial, Cyber, Digital  │
│  Autonomy               │  AI handles trial; magistrate reviews      │
│                         │  verdict after. ETA: 24–48 hours           │
├─────────────────────────┼────────────────────────────────────────────┤
│  TIER 2 — Supervised    │  Score 40–70% | Complex civil/statutory    │
│  AI Trial               │  AI rules each step; human validates.      │
│                         │  ETA: 2–4 weeks                            │
├─────────────────────────┼────────────────────────────────────────────┤
│  TIER 3 — Human-Led     │  Score < 40% | Heinous crimes, violence    │
│  + AI Co-Pilot          │  Human judge leads; AI provides analysis.  │
│                         │  ETA: Standard court timeline              │
└─────────────────────────┴────────────────────────────────────────────┘
```

---

## 📊 The Guilt Meter

The **Guilt Meter** is Lexora's signature feature — a live, AI-driven balance that shifts in real time as evidence and testimonies are submitted:

```
PROSECUTION ◄════════════════════════════════════► DEFENSE
            [50%]                              [50%]
              ↑ Starts neutral. Shifts with each submission.

Strong Evidence    → +5% to +18% toward submitting party
Final Threshold    → ≥85% Prosecution = Guilty Beyond Doubt
                   → ≤15% Prosecution = Exonerated
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Google Gemini API Key ([Get one free](https://aistudio.google.com/app/apikey))
- Node.js (optional, for serving frontend)

### 1. Clone the Repository

```bash
git clone https://github.com/Code-By-Aayush/Lexora.git
cd Lexora
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and GEMINI_API_KEY
```

### 3. Configure Environment

Open `backend/.env` and set:

```env
APP_NAME=Lexora
APP_VERSION=1.0.0
DEBUG=False
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/lexora_db
SECRET_KEY=your-secure-random-secret-key
GEMINI_API_KEY=your-google-gemini-api-key
```

### 4. Initialize Database

```bash
# Create PostgreSQL database
createdb lexora_db

# Run the app — SQLAlchemy will auto-create tables on startup
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Launch Frontend

Simply open `frontend/index.html` in your browser, or serve it:

```bash
# Using Python's built-in server
cd frontend
python -m http.server 3000
# Then visit http://localhost:3000
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT token |
| `GET` | `/api/auth/me` | Get current user info |
| `GET` | `/api/auth/users` | List all users (auth required) |

### Case Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cases/` | File a new case (FIR) |
| `GET` | `/api/cases/` | List cases (role-filtered) |
| `GET` | `/api/cases/{id}` | Get case details |
| `PATCH` | `/api/cases/{id}/guilt-meter` | Update guilt meter |
| `GET` | `/api/cases/{id}/guilt-meter-history` | Audit trail |

### AI Judicial Engine

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/analyze-fir` | Analyze FIR & assign tier |
| `POST` | `/api/ai/courtroom-step` | Process evidence/testimony |
| `POST` | `/api/ai/final-verdict` | Generate formal verdict |

### Swagger Docs

Once running, visit: **`http://localhost:8000/docs`** for the interactive API explorer.

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| `citizen` | File cases, view own cases |
| `police` | File cases, view all cases |
| `lawyer` | View assigned cases, submit evidence |
| `judge` | Full case access, approve AI verdicts, update guilt meter |
| `admin` | Full system access |

---

## 🛡️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance async API framework
- [SQLAlchemy](https://sqlalchemy.org/) — ORM with PostgreSQL
- [Alembic](https://alembic.sqlalchemy.org/) — Database migrations
- [python-jose](https://github.com/mpdavis/python-jose) — JWT authentication
- [bcrypt](https://pypi.org/project/bcrypt/) — Password hashing
- [Pydantic v2](https://docs.pydantic.dev/) — Data validation
- [httpx](https://www.python-httpx.org/) — Async HTTP client for AI calls

**AI Layer**
- [Google Gemini AI](https://ai.google.dev/) — Core judicial reasoning engine
- [LangChain](https://langchain.com/) — LLM orchestration
- [ChromaDB](https://trychroma.com/) — Vector database for case precedents
- [Sentence Transformers](https://sbert.net/) — Semantic embeddings

**Frontend**
- Vanilla HTML5 / CSS3 / JavaScript — Zero dependency, lightning fast
- Dark-mode premium UI with glassmorphism design
- Real-time court audio ambience engine
- Animated Guilt Meter with live updates

---

## 🔒 Security

- All passwords hashed with **BCrypt** (cost factor 12)
- **JWT tokens** with configurable expiry
- Role-based access control on every endpoint
- `.env` files excluded from version control
- `SECRET_KEY` must be a random 256-bit value in production

> ⚠️ **Never commit your `.env` file.** Use `.env.example` as a template.

---

## 🗺️ Roadmap

- [ ] **v1.1** — WebSocket real-time courtroom updates
- [ ] **v1.2** — PDF verdict generation & e-signature
- [ ] **v1.3** — Case precedent search via ChromaDB
- [ ] **v1.4** — Multi-language support (Hindi, Tamil, etc.)
- [ ] **v2.0** — Mobile app (Flutter) + Blockchain verdict ledger

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aayush Chetan Gore**
- GitHub: [@Code-By-Aayush](https://github.com/Code-By-Aayush)
- Email: cybertech.aayush@gmail.com

---

<div align="center">

**⚖️ Justice. Intelligence. Speed.**

*Built with ❤️ and Gemini AI*

</div>
