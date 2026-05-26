# SynapseForce

**AI-Powered Workforce Intelligence Platform**

SynapseForce is a full-stack HR management platform that uses skill-based AI matching to automatically assign the right employees to the right projects. HR admins get a complete workforce overview — from resume parsing and skill detection to project tracking, team suggestions, and real-time messaging. Employees get a personal workspace to manage their profile, track assigned projects, and communicate with HR.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | https://synapse-force.vercel.app |
| Backend API | https://synapseforce-api.onrender.com |

**Demo credentials**

| Role | Email | Password |
|------|-------|----------|
| HR Admin | smriti@gmail.com | smriti123 |
| Employee | alice@synapseforce.com | pass123 |
| Employee | bob@synapseforce.com | pass123 |
| Employee | carol@synapseforce.com | pass123 |

---

## Features

### HR Admin
- **Dashboard** — workforce overview with active projects, skill gaps, overdue alerts, and a live activity feed
- **Employee Directory** — searchable table with availability status, top skills, performance score, and project count; expand any row to see full skill breakdown and endorse skills
- **Project Management** — create projects with required skills; team is auto-assigned via AI skill matching; track progress, deadlines, and status
- **Resume Management** — upload employee resumes (PDF/DOCX); Apache Tika extracts text and auto-detects skills with strength levels
- **Team Builder** — enter required skills and get ranked employee suggestions with match scores
- **Analytics** — skill distribution chart, skill gap analysis, export to CSV, recent activity feed
- **Messaging** — initiate conversations with any employee; shared inbox with unread counts
- **HR Profile** — personal profile with workforce stats, top performers, project status breakdown

### Employee
- **Dashboard** — personal stats (skills, projects, performance score), skill strength bars, assigned project progress
- **My Profile** — view and update availability status (Available / Busy / On Leave), upload resume, see detected skills with endorsement badges, update project progress
- **Message HR** — direct messaging with the HR team; notifications on new messages

### Platform
- JWT authentication with role-based access control (ADMIN / USER)
- Real-time notification bell with unread count badge (polls every 5 seconds)
- Global search across employees and projects
- Dark / light mode toggle
- Fully responsive layout

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Language |
| Spring Boot | 3.2.0 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| JJWT | 0.11.5 | JWT token generation and validation |
| Spring Data JPA / Hibernate | 6.x | ORM and database access |
| Apache Tika | 2.9.1 | Resume text extraction (PDF, DOCX) |
| PostgreSQL | 15+ | Production database |
| H2 | — | In-memory database for local development |
| Lombok | — | Boilerplate reduction |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.1 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | 6.22 | Client-side routing |
| Axios | 1.6 | HTTP client |
| Recharts | 2.12 | Charts and data visualization |
| Lucide React | 0.344 | Icon library |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Render | Backend hosting (Docker) |
| Vercel | Frontend hosting |
| Supabase | Managed PostgreSQL database |
| GitHub | Source control and CI/CD trigger |

---

## Project Structure

```
SynapseForce/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/synapseforce/
│   │   ├── auth/                     # Login, register, JWT
│   │   ├── user/                     # User entity, controller, availability
│   │   ├── skill/                    # Skill entity and repository
│   │   ├── resume/                   # Resume upload, Tika parsing, skill extraction
│   │   ├── project/                  # Project CRUD, progress tracking, deadlines
│   │   ├── task/                     # Task management
│   │   ├── message/                  # HR ↔ employee messaging
│   │   ├── notification/             # In-app notifications
│   │   ├── activity/                 # Activity log feed
│   │   ├── analytics/                # Overview stats, skill gap, export
│   │   ├── team/                     # AI skill-matching team suggestions
│   │   ├── security/                 # JWT filter, security config
│   │   └── common/                   # Data seeder, global exception handler
│   ├── src/main/resources/
│   │   ├── application.properties    # Local (H2) config
│   │   └── application-prod.properties # Production (PostgreSQL) config
│   └── Dockerfile                    # Multi-stage Docker build
│
└── frontend/                         # React + Vite SPA
    └── src/
        ├── pages/                    # Dashboard, Employees, Projects, Messages, etc.
        ├── components/
        │   ├── layout/               # Sidebar, Topbar, AppLayout
        │   └── ui/                   # StatCard, EmptyState, SkillBadge
        ├── context/                  # AuthContext, ThemeContext
        └── lib/                      # Axios instance with JWT interceptor
```

---

## Local Development

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8081`. H2 in-memory database is used automatically — no setup needed. Demo data (users, skills, projects) is seeded on first run.

H2 console: `http://localhost:8081/h2-console`
- JDBC URL: `jdbc:h2:mem:synapseforce`
- Username: `sa` / Password: *(empty)*

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`. The Vite dev server proxies `/api` requests to `localhost:8081`.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com), connect the GitHub repo
2. Set **Language** to **Docker**, **Root Directory** to `backend`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string |
| `JWT_SECRET` | Any long random string |
| `FRONTEND_URL` | Your Vercel frontend URL |

Render injects a `PORT` env var automatically — the Dockerfile handles it.

### Frontend — Vercel

1. Import the GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL (e.g. `https://synapseforce-api.onrender.com`) |

### Database — Supabase

Create a free project on [Supabase](https://supabase.com). Copy the PostgreSQL connection string from **Settings → Database → Connection string (URI)**. Hibernate auto-creates all tables on first boot (`ddl-auto=update`).

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | List all employees |
| GET | `/users/me` | Any | Get current user profile + skills |
| GET | `/users/{id}` | Admin / Self | Get user profile |
| GET | `/users/{id}/skills` | Any | Get user skills |
| PATCH | `/users/{id}/availability` | Admin / Self | Update availability status |
| PATCH | `/users/skills/{skillId}/endorse` | Admin | Toggle skill endorsement |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/projects` | Any | List all projects |
| POST | `/projects` | Admin | Create project (auto-assigns team) |
| PATCH | `/projects/{id}/status` | Admin | Update project status |
| PATCH | `/projects/{id}/progress` | Admin / Member | Update progress % and note |
| DELETE | `/projects/{id}` | Admin | Delete project |
| GET | `/projects/my/{userId}` | Any | Get projects for a user |

### Resumes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/resume/upload` | Any | Upload resume, extract skills |
| GET | `/resume/all` | Admin | List all uploaded resumes |
| GET | `/resume/my` | Any | Get current user's resumes |

### Team & Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/team/suggest?skills=Java,React` | Admin | Get ranked team suggestions |
| GET | `/analytics/overview` | Any | Dashboard stats, skill gaps, activity |
| GET | `/export/employees.csv` | Admin | Export employee data as CSV |
| GET | `/export/projects.csv` | Admin | Export project data as CSV |

### Messages & Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/messages/send/{receiverId}` | Any | Send a message |
| GET | `/messages/conversations` | Any | List conversations |
| GET | `/messages/conversation/{otherId}` | Any | Get message thread |
| GET | `/messages/admin` | Any | Get HR admin contact |
| GET | `/notifications` | Any | Get notifications |
| GET | `/notifications/unread-count` | Any | Get unread count |
| PATCH | `/notifications/{id}/read` | Any | Mark notification as read |
| PATCH | `/notifications/read-all` | Any | Mark all as read |

---

## How AI Team Matching Works

When a project is created with required skills (e.g. `Java, Spring Boot, Docker`):

1. The `TeamSuggestionService` fetches all employees and their skill records
2. Each employee is scored based on how many required skills they have and the strength level of each matching skill
3. Employees are ranked by score and the top matches are assigned to the project
4. Each assigned employee receives an in-app notification

The same scoring logic powers the **Team Builder** page, where HR can enter any skill set and get a ranked list of best-fit employees before creating a project.

---

## Screenshots

> Dashboard (HR Admin) · Employee Directory · Project Tracking · Messaging · Analytics

*(Add screenshots here)*

---

## Author

**Smriti Prajapati**  
[GitHub](https://github.com/Smriti-Prajapati)
