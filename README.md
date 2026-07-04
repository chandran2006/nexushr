# NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform

> Built by **Amdox Technologies** · Production-grade · AI-powered · Enterprise-ready

![NexusHR Banner](https://via.placeholder.com/1200x400/0f172a/3b82f6?text=NexusHR+%E2%80%94+AI-Enabled+Enterprise+HR+Platform)

## Overview

NexusHR is a full-stack, AI-powered HR management platform built with Java 21 + Spring Boot 3.3 on the backend and React 19 + TypeScript on the frontend. It covers the complete employee lifecycle from recruitment to offboarding, with real-time features, AI-driven insights, and enterprise-grade security.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Core language |
| Spring Boot | 3.3 | Application framework |
| Spring Security 6 | 6.x | JWT auth + RBAC |
| PostgreSQL | 16 | Primary database |
| Redis | 7 | Caching + sessions |
| Flyway | Latest | DB migrations |
| WebSocket (STOMP) | — | Real-time updates |
| OpenAI API | — | AI features |
| Swagger/OpenAPI | 3 | API documentation |
| Maven | 3.9 | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 6 | Build tool |
| TailwindCSS | 4 | Styling |
| Zustand | 5 | State management |
| TanStack Query | 5 | Server state |
| Framer Motion | 11 | Animations |
| Recharts | 2 | Charts |
| Axios | 1 | HTTP client |
| Sonner | 1 | Toast notifications |

---

## Modules

| Module | Features |
|---|---|
| **Auth** | JWT login/register, refresh tokens, RBAC, 6 roles |
| **Employees** | Full CRUD, departments, org hierarchy, search, pagination |
| **Attendance** | Clock in/out, real-time tracking, history, WebSocket |
| **Leave** | Apply/approve/reject, balance tracking, workflow |
| **Payroll** | Salary calculation, payslips, bulk processing, tax |
| **Performance** | Goals/OKRs, reviews, 360 feedback, ratings |
| **Recruitment** | Job postings, candidate pipeline, interview scheduling |
| **AI Intelligence** | Chatbot, attrition prediction, skill gap analysis, engagement |
| **Notifications** | Real-time WebSocket, email, notification center |
| **Dashboard** | Analytics, charts, KPIs, executive overview |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local dev)
- Node.js 20+ (for local dev)

### Run with Docker (Recommended)

```bash
git clone https://github.com/amdox/nexushr.git
cd nexushr
cp .env.example .env
# Edit .env with your values (especially OPENAI_API_KEY)
docker compose up -d
```

- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html

### Local Development

**Backend:**
```bash
cd nexushr-backend
# Start PostgreSQL and Redis (via Docker)
docker compose up postgres redis -d
# Run Spring Boot
mvn spring-boot:run
```

**Frontend:**
```bash
cd nexushr-frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@nexushr.com | Admin@123 |

---

## Environment Variables

See `.env.example` for all required variables.

Key variables:
```env
DB_URL=jdbc:postgresql://localhost:5432/nexushr
REDIS_HOST=localhost
JWT_SECRET=your-256-bit-secret
OPENAI_API_KEY=sk-your-key-here
FRONTEND_URL=http://localhost:5173
```

---

## API Documentation

Swagger UI available at: `http://localhost:8080/api/swagger-ui.html`

Key endpoints:
```
POST   /api/auth/login          Login
POST   /api/auth/register       Register
GET    /api/employees           List employees
POST   /api/attendance/clock-in Clock in
POST   /api/leaves/apply        Apply for leave
GET    /api/dashboard           Dashboard data
POST   /api/ai/chat             AI chatbot
GET    /api/ai/attrition/{id}   Attrition prediction
```

---

## Architecture

```
nexushr/
├── nexushr-backend/          # Spring Boot application
│   └── src/main/java/com/nexushr/
│       ├── controller/       # REST controllers
│       ├── service/          # Business logic
│       ├── repository/       # JPA repositories
│       ├── entity/           # JPA entities
│       ├── dto/              # Request/Response DTOs
│       ├── security/         # JWT + Spring Security
│       ├── config/           # App configuration
│       ├── exception/        # Global exception handling
│       ├── ai/               # AI service (OpenAI)
│       └── websocket/        # WebSocket config
├── nexushr-frontend/         # React application
│   └── src/
│       ├── pages/            # Page components
│       ├── components/       # Reusable UI components
│       ├── store/            # Zustand state stores
│       ├── lib/              # API client + utilities
│       └── types/            # TypeScript types
├── docker-compose.yml        # Full stack Docker setup
├── .env.example              # Environment template
└── .github/workflows/        # CI/CD pipeline
```

---

## Deployment

### Render / Railway (Backend)
1. Connect GitHub repo
2. Set environment variables from `.env.example`
3. Deploy from `nexushr-backend/` directory

### Vercel (Frontend)
1. Import GitHub repo
2. Set root directory to `nexushr-frontend`
3. Build command: `npm run build`
4. Output directory: `dist`

### Neon / Supabase (Database)
1. Create PostgreSQL database
2. Set `DB_URL` to connection string
3. Flyway migrations run automatically on startup

---

## Security Features

- JWT access + refresh token rotation
- BCrypt password hashing (strength 12)
- Role-based access control (6 roles)
- CORS configuration
- Input validation on all endpoints
- Soft delete (no hard data deletion)
- Audit logging for all critical actions
- Account lockout after failed attempts

---

## AI Features

- **HR Chatbot**: Powered by OpenAI GPT-4o-mini, answers HR policy questions
- **Attrition Prediction**: ML-based risk scoring with actionable recommendations
- **Skill Gap Analysis**: Compares current skills vs target role requirements
- **Engagement Scoring**: Employee engagement health metrics

> AI features work with mock responses when `OPENAI_API_KEY` is not set.

---

## License

MIT License — © 2024 Amdox Technologies
"# nexushr" 
"# nexushr" 
"# nexushr" 
