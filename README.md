# TapID

TapID is a smart NFC attendance management system for colleges and training centers. It combines an ESP32 + RC522 RFID reader, a Node.js/Express API, a MySQL database, and a React/Vite web portal for administrators and faculty.

## Features

- JWT authentication for admin, faculty, and student users
- Admin dashboard metrics for students, faculty, classrooms, subjects, and devices
- Faculty timetable view and attendance session lifecycle
- ESP32 attendance recording by RFID UID and classroom device MAC address
- Duplicate attendance prevention per session/student
- Student directory with RFID card mapping
- Attendance reports with CSV export
- Admin log and audit endpoints
- Secure image upload workflow with file type and size validation
- Docker Compose deployment for MySQL, backend, and frontend

## File Structure

```text
TapID/
  ai/                         NVIDIA/Nemotron helper service and tests
  api/                        Swagger, Postman, and API testing artifacts
  backend/
    app.js                    Express app, middleware, route mounting, errors
    server.js                 Runtime entrypoint and graceful shutdown
    config/                   Database, JWT, logging, app config
    controllers/              Route handlers for auth, attendance, admin, reports
    middleware/               Auth, role checks, audit, validation, rate limiting
    models/                   Domain model placeholders for future ORM migration
    routes/                   Express route modules
    services/                 Business/reporting/service helpers
    tests/                    Jest + Supertest API tests
    utils/                    Shared helpers, responses, JWT secret handling
  database/
    schema.sql                MySQL tables, keys, and constraints
    indexes.sql               Performance indexes
    seed.sql                  Rerunnable demo data
    triggers.sql              Device status triggers for session start/end
    procedures.sql            Reserved for stored procedures
  deployment/                 Nginx and container deployment assets
  docs/                       Architecture, reports, diagrams, manuals
  firmware/esp32/             ESP32 NFC reader firmware
  frontend/
    src/
      components/             Layout, sidebar, topbar
      context/                Auth state provider
      pages/                  Login, dashboard, attendance, reports, admin pages
      services/api.js         Axios API client with token injection
      styles/                 Shared CSS tokens/utilities
    tests/                    Vitest + Testing Library tests
```

Generated folders such as `node_modules/`, `frontend/dist/`, `backend/logs/`, and `backend/uploads/` are intentionally excluded from the structure above.

## Database Schema

```text
users
  id PK, email UNIQUE, password_hash, role(admin|faculty|student), created_at

faculty
  id PK, user_id UNIQUE FK users.id, name, phone, department

sections
  id PK, name, branch, semester, UNIQUE(name, branch, semester)

students
  id PK, user_id UNIQUE NULL FK users.id, name, enrollment_number UNIQUE,
  section_id FK sections.id, created_at

rfid_cards
  id PK, uid UNIQUE, student_id NULL FK students.id, status(active|revoked|lost),
  issued_at

subjects
  id PK, code UNIQUE, name, semester

classrooms
  id PK, room_number UNIQUE, building

devices
  id PK, mac_address UNIQUE, classroom_id FK classrooms.id,
  status(online|offline|revoked)

timetable
  id PK, faculty_id FK faculty.id, subject_id FK subjects.id,
  section_id FK sections.id, classroom_id FK classrooms.id, day_of_week,
  start_time, end_time,
  UNIQUE(faculty_id, subject_id, section_id, classroom_id, day_of_week, start_time)

attendance_sessions
  id PK, timetable_id NULL FK timetable.id, faculty_id FK faculty.id,
  subject_id FK subjects.id, classroom_id FK classrooms.id, session_date,
  start_time, end_time NULL, status(active|completed)

attendance
  id PK, session_id FK attendance_sessions.id, student_id FK students.id,
  rfid_card_id FK rfid_cards.id, timestamp, status(present|late|absent),
  manual_override, UNIQUE(session_id, student_id)

audit_logs
  id PK, user_id NULL FK users.id, action, entity_type, entity_id, details,
  timestamp
```

## Environment

Copy `.env.example` to `.env` and set production-safe values.

```bash
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=tapid
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=http://localhost:5173
NVIDIA_API_KEY=
VITE_API_URL=http://localhost:3000/api
```

Use a `JWT_SECRET` of at least 32 characters in production. If a real API key has ever been committed, pasted, or shared, rotate it before deployment.

## Local Setup

1. Install Node.js 18+ and MySQL 8+.
2. Install dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install
```

3. Create and seed the database:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p tapid < database/indexes.sql
mysql -u root -p tapid < database/seed.sql
mysql -u root -p tapid < database/triggers.sql
```

4. Start the backend:

```bash
npm run dev:backend
```

5. Start the frontend:

```bash
npm run dev:frontend
```

The web portal runs at `http://localhost:5173`; the API runs at `http://localhost:3000/api`.

Demo accounts from `database/seed.sql` use password `password123`:

- `admin@tapid.edu`
- `faculty@tapid.edu`
- `student1@tapid.edu`
- `student2@tapid.edu`

## Docker Deployment

```bash
docker compose up -d --build
```

Docker exposes:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api`
- MySQL: `localhost:3307`

The compose file mounts database scripts in deterministic init order: schema, indexes, seed, triggers, procedures.

## API Overview

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/admin/stats`
- `GET /api/admin/rfid-cards`
- `GET /api/faculty`
- `POST /api/faculty`
- `GET /api/students`
- `POST /api/students`
- `GET /api/timetable`
- `POST /api/session/start`
- `POST /api/session/:id/end`
- `POST /api/attendance/record`
- `POST /api/attendance/bulk-record`
- `GET /api/attendance/session/:session_id`
- `GET /api/reports/attendance`
- `POST /api/upload`
- `GET /api/logs`
- `GET /api/logs/audit`
- `GET /api/analytics/summary`

## Testing

Run all available automated checks:

```bash
npm test
npm run build
```

Verified in this workspace:

- Backend Jest/Supertest: 3 suites, 5 tests passing
- Frontend Vitest/Testing Library: 1 suite, 3 tests passing
- Frontend production build: passing

## Firmware

Open `firmware/esp32/main.ino` or `firmware/esp32/tapid_reader/tapid_reader.ino` in Arduino IDE. Configure Wi-Fi and backend API URL, then flash the ESP32. The attendance endpoint is:

```text
POST /api/attendance/record
{
  "rfid_uid": "A1B2C3D4",
  "mac_address": "24:0A:C4:00:00:01"
}
```

## Security Notes

- Keep `.env` out of version control.
- Rotate any API key that has been exposed in local files, logs, chat, or screenshots.
- Use HTTPS and a restricted `CORS_ORIGIN` in production.
- Use a managed MySQL user with least privilege.
- Keep uploaded files outside source control and serve them through a controlled static route or object storage in production.
