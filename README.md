# MyLekarz API

**A production-ready REST API for an online medical booking platform** — patients find clinics and doctors, check availability, and book appointments; clinics and doctors manage their schedules, services, patients, prescriptions and reviews.

The API is built with **Node.js + Express + PostgreSQL (Sequelize)**, secured with **session-based authentication (Passport.js)**, and ships with **automated tests**, **Swagger documentation**, and **migrations + seeders** for a reproducible database.

## ✨ Highlights

- **Role-based access control** — four actor types (patient, doctor, clinic, admin) with per-role authorization middleware.
- **Full appointment lifecycle** — clinic/doctor search, schedules & timetables, booking, and a background **cron job** that automatically completes past appointments.
- **Authentication** — email/password via Passport local strategy, **Google OAuth2** sign-in, bcrypt password hashing, session store backed by PostgreSQL (`connect-pg-simple`), and JWT-based password reset tokens.
- **Documented & testable** — **100+ API operations** documented live in Swagger UI (`/api-docs`), plus **103 unit tests** (Sinon + Rewire, no database required) and an integration suite (Supertest).
- **Production concerns handled** — input validation (express-validator), centralized error handling, structured logging (Winston + Morgan), CORS allow-listing, Cloudinary image uploads with size limits, transactional database writes, and pagination with consistent page semantics.

## 🛠 Tech Stack

| Area | Technology |
|---|---|
| Runtime & framework | Node.js 22, Express 4 |
| Database | PostgreSQL, Sequelize ORM (migrations + seeders) |
| Auth | Passport.js (local + Google OAuth20), express-session, bcrypt, JWT |
| Validation | express-validator |
| File storage | Cloudinary, Multer |
| Email & documents | Nodemailer, PDFKit |
| Background jobs | node-cron |
| Logging | Winston, Morgan |
| API docs | swagger-jsdoc, swagger-ui-express |
| Testing | Mocha, Chai, Sinon, Rewire, Supertest, Mochawesome |

## 🏗 Architecture

The codebase follows a classic layered architecture — routes → controllers → services → models — which keeps business logic framework-agnostic and easy to test:

```
Client ─▶ Routes (validation + auth guards)
            ─▶ Controllers (request/response handling)
                ─▶ Services (business logic, transactions)
                    ─▶ Sequelize models (PostgreSQL)
```

- **Modules** cover the full domain: clinics, doctors, patients, appointments, schedules, timetables, services, specialties, reviews, posts, categories, tags, medications, prescriptions, documents, statistics — plus a Notion integration for content management.
- **Scheduled task** (`src/utils/cron.js`) transitions expired appointments to `completed` every few minutes.
- **Swagger spec** is generated automatically from JSDoc annotations in the route files.

## 🚀 Getting Started

### Prerequisites

- Node.js **22.x**
- PostgreSQL 12+ (local or hosted, e.g. Neon)

### 1. Clone & install

```bash
git clone https://github.com/DHaurylkevich/doc-web.git
cd doc-web
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000` in the example) |
| `POSTGRES_PRISMA_URL` | Main PostgreSQL connection string |
| `POSTGRES_URL_TEST` | Connection string used by integration tests |
| `SESSION_SECRET` | Secret for express-session |
| `JWT_SECRET` | Secret for password-reset tokens |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth2 credentials |
| `EMAIL` / `EMAIL_PASS` / `CLIENT_URL` | Nodemailer credentials + frontend origin for reset links |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials for file uploads |
| `DB_SYNC` | `true` to auto-sync models with the schema on boot (dev convenience) |

### 3. Prepare the database

```bash
# Apply migrations
npx sequelize-cli db:migrate

# Fill the database with realistic demo data
npx sequelize-cli db:seed:all
```

### 4. Run

```bash
npm run dev        # development with auto-reload (nodemon)
npm start          # production build/start
```

The API starts on the configured port (default `3000`), and Swagger UI is available at `http://localhost:3000/api-docs/`.

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server with nodemon (auto-reload) |
| `npm start` | Start the server |
| `npm run lint` | ESLint over the whole codebase |
| `npm test` | Run the integration test suite (needs `POSTGRES_URL_TEST`, migrated + seeded) |
| `npm run test:unit` | Run the unit suite — 103 tests, no database required |
| `npm run build` | Build entrypoint (runs `node index.js`) |

## 🧪 Testing

Two isolated suites keep the feedback loop fast:

- **Unit tests** (`npm run test:unit`) — services and controllers tested with Sinon stubs and Rewire, so they run anywhere without a database.
- **Integration tests** (`npm test`) — supertest against the booted app; point `POSTGRES_URL_TEST` at a test database and run `npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all` there first.

Mocha tests can also be exported to an HTML report with Mochawesome:

```bash
npx mocha <test-file> --reporter mochawesome
```

## 📖 API Documentation

The OpenAPI 3.0 specification is generated from JSDoc annotations in the route files and served with Swagger UI:

- **Local:** `http://localhost:3000/api-docs/`
- It documents **100+ operations**: auth (including Google OAuth), clinics, doctors, patients, appointments, schedules, services, specialties, reviews, posts, medications, prescriptions, search, statistics and more — with request/response schemas and role requirements.

## 📁 Project Structure

```
src/
├── config/          # DB, session store, Swagger, Passport
├── controllers/     # Request/response handling
├── middleware/      # Auth guards, validation, error handler, uploads
├── models/          # Sequelize models & associations
├── routes/          # API routes (with Swagger annotations)
├── services/        # Business logic & database transactions
├── utils/           # Migrations, seeders, cron, mail, PDF, pagination
tests/
├── integration/     # Supertest against the booted app
└── unit/            # Sinon/Rewire tests (no DB needed)
```
