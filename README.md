# 💼 JobTracker — Modern Full-Stack Job Application Tracker

A modern, production-grade, full-stack web application designed to help software engineers and professionals track, organize, and optimize their job search journey. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js 16](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)

---

## 🌟 Key Features

### 1. 📊 Real-Time Analytics & Application Funnel
- **Live KPI Dashboard**: Instant summary of Total Applications, Active Interviews, Received Offers, and Rejections.
- **Cumulative Application Journey Funnel**: Real-time conversion tracking across stages (`Applied` → `Interview` → `Offer` → `Hired`), providing actionable feedback on interview and offer conversion rates.
- **Interactive Visualizations**:
  - **Timeline Velocity Chart**: Monthly application volume tracking via Recharts Area graphs.
  - **Active Pipeline Breakdown**: Stage-by-stage distribution bar chart mirroring the Kanban board.
- **Recent Activity Table**: Rapid access to recently updated applications with status tags and resume links.

### 2. 📋 Drag-and-Drop Kanban Board
- **Fluid Visual Workflow**: Move applications across four primary columns (`Applied`, `Interviewing`, `Offers`, `Rejected`).
- **Optimistic UI with Automatic Rollback**: Instant frontend updates on drag drop; automatically rolls back with toast notifications if the API request fails.
- **Search & Quick Filtering**: Filter Kanban cards by job title, company name, or work mode (`Remote`, `Hybrid`, `Onsite`).
- **One-Click Quick Transitions**: Chevron shortcut actions on cards for fast single-click status updates.

### 3. 💼 Complete Job Application CRUD
- **Comprehensive Job Details**: Track company name, position, salary range, location, job description URL, work mode, employment type, and personal notes.
- **Dedicated Edit Page (`/jobs/[id]`)**: Full editing capabilities with timestamp tracking and history logs.
- **Search & Multi-Filter List View (`/jobs`)**: Filter by status, search by keywords, and sort applications chronologically.

### 4. 📄 Resume Tracking via Shareable Links
- **Application-Specific Resume Linking**: Store the exact resume version URL (Google Drive, Notion, Portfolio, Dropbox) used for each individual job application.
- **URL Validation & Sanitization**: Automatic protocol formatting (`https://`) and URL syntax verification.
- **One-Click Open / View**: Secure server-side redirect endpoint (`/api/jobs/[id]/resume`) with strict user ownership checks.

### 5. 🔒 Production-Grade Authentication & Security
- **Centralized JWT Management (`lib/jwt.ts`)**: Cryptographically secure token signing with production guard that halts application if `JWT_SECRET` is missing or set to an insecure placeholder.
- **Cookie-Based Sessions**: Secure, HttpOnly cookie tokens prevent client-side XSS leaks.
- **Strict Data Isolation & Ownership**: Multi-tenant database queries scoped to `userId` with 401/403 forbidden protection.
- **Bcrypt Password Hashing**: Passwords salt-hashed before database storage; excluded from all API responses.

### 6. ⚡ Database Optimization & Indexing
- **Indexed Relational Schema**: PostgreSQL queries optimized with Prisma indexing (`@@index([userId])`, `@@index([jobId])`).
- **Status Audit History (`JobStatusHistory`)**: Logs every status transition with exact timestamps for accurate historical analytics.
- **Cascading Deletes**: Clean deletion cascades ensuring zero orphaned records when accounts or jobs are removed.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (Turbopack)](https://nextjs.org/) | App Router, Server/Client components, API routes |
| **Frontend** | [React 19](https://react.dev/) | Modern concurrent UI architecture & hooks |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety across client and server |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | Responsive dark glassmorphism aesthetic |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database storage |
| **ORM** | [Prisma ORM 7](https://www.prisma.io/) | Schema management, type generation & queries |
| **Charts** | [Recharts](https://recharts.org/) | Responsive SVG charts (Area and Bar visualizations) |
| **Icons & Feedback** | [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/) | Clean iconography & toast notifications |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT auth cookies & salted password hashing |

---

## 📂 Project Structure

```
job_tracker/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST: Login & JWT cookie issuance
│   │   │   ├── logout/route.ts       # POST: Clear auth cookie
│   │   │   ├── me/route.ts           # GET: Current authenticated user
│   │   │   └── register/route.ts     # POST: User signup & password hash
│   │   ├── dashboard/
│   │   │   └── analytics/route.ts    # GET: Funnel & timeline analytics
│   │   └── jobs/
│   │       ├── route.ts              # GET (List jobs), POST (Create job)
│   │       └── [id]/
│   │           ├── route.ts          # GET (Detail), PUT (Update), DELETE
│   │           ├── resume/route.ts   # GET: Secure redirect to resume link
│   │           └── status/route.ts   # PATCH: Update status & record history
│   ├── dashboard/page.tsx            # Live analytics dashboard
│   ├── jobs/
│   │   ├── page.tsx                  # Searchable jobs list
│   │   ├── new/page.tsx              # Add new application form
│   │   └── [id]/page.tsx             # Job details & edit form
│   ├── kanban/page.tsx               # Drag-and-drop Kanban workflow
│   ├── login/page.tsx                # Login portal
│   ├── register/page.tsx             # Signup page
│   ├── profile/page.tsx              # User profile & stats
│   ├── layout.tsx                    # Root layout with font & toast provider
│   └── globals.css                   # Global styles & dark palette
├── components/
│   ├── AddJobForm.tsx                # Form with URL-based resume link validation
│   ├── AppLayout.tsx                 # Protected route navigation layout
│   ├── DashboardAnalytics.tsx        # Recharts metrics, KPI cards & funnel
│   ├── JobCard.tsx                   # Interactive card for list view
│   ├── KanbanBoard.tsx               # Drag-and-drop kanban board controller
│   ├── KanbanCard.tsx                # Draggable application card
│   ├── Navbar.tsx                    # Responsive navigation header
│   └── LogoutButton.tsx              # Sign-out handler
├── context/
│   └── AuthContext.tsx               # Client authentication state provider
├── lib/
│   ├── jobs.ts                       # Typed client API services
│   ├── jwt.ts                        # Centralized JWT signing & security guard
│   └── prisma.ts                     # Singleton Prisma client instance
├── prisma/
│   ├── schema.prisma                 # Database schema with relations & indexes
│   └── migrations/                   # SQL migration versions
├── .env.example                      # Environment variables template
├── middleware.ts                     # Edge auth route protection
└── package.json                      # Project dependencies & scripts
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER ||--o{ JOB : owns
    JOB ||--o{ JOB_STATUS_HISTORY : tracks

    USER {
        string id PK
        string name
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }

    JOB {
        string id PK
        string company
        string position
        string location
        enum status
        enum jobType
        enum workMode
        string salary
        string jobUrl
        string notes
        string resumeLink
        string resumeType
        string resumeUrl
        string resumeFilename
        datetime appliedAt
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    JOB_STATUS_HISTORY {
        string id PK
        string jobId FK
        enum status
        datetime changedAt
    }
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later (Node.js 20+ recommended)
- **PostgreSQL**: Local PostgreSQL instance or hosted service (Neon, Supabase, AWS RDS)
- **npm** or **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/parvezs2442/jobTracker.git
cd jobTracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Fill in your actual connection string and a secure JWT secret:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/job_tracker?schema=public"

# Cryptographically strong secret key (generate with: openssl rand -base64 32)
JWT_SECRET="your_strong_secret_key_here"

# Environment
NODE_ENV="development"
```

> **Security Note:** In production mode (`NODE_ENV="production"`), the application will strictly refuse to start if `JWT_SECRET` is missing, shorter than 16 characters, or matches default placeholder strings.

### 4. Run Database Migrations
```bash
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Quality & Verification

The project enforces strict code quality, zero-lint tolerance, and reliable production builds:

```bash
# Run ESLint (0 errors, 0 warnings)
npm run lint

# Validate Prisma schema
npx prisma validate

# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
