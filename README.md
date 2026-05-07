# SynapseForce — AI-Powered Workforce Intelligence Platform

## Quick Start

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# API runs on http://localhost:8080
# H2 console: http://localhost:8080/h2-console
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Demo Credentials
| Role  | Email                        | Password  |
|-------|------------------------------|-----------|
| Admin | smriti@gmail.com             | smriti123 |
| User  | alice@synapseforce.com       | pass123   |

## API Endpoints
| Method | Path                        | Auth     |
|--------|-----------------------------|----------|
| POST   | /auth/register              | Public   |
| POST   | /auth/login                 | Public   |
| POST   | /resume/upload              | ADMIN    |
| GET    | /resume/all                 | ADMIN    |
| GET    | /resume/list/{userId}       | Any      |
| GET    | /team/suggest?skills=...    | ADMIN    |
| GET    | /analytics/overview         | Any      |
| GET    | /users                      | ADMIN    |
| GET    | /users/{id}/skills          | Any      |

## Tech Stack
- Backend: Spring Boot 3, Spring Security, JWT, Apache Tika, H2
- Frontend: React 18, Vite, Tailwind CSS, Recharts, Axios
