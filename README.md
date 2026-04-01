# HOA Management System

A web-based Homeowners Association management platform — built entirely with **free services**.

## Tech Stack (All Free)

| Layer | Technology |
|---|---|
| Backend | NestJS + TypeScript (Node.js 20) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL on Railway.app |
| Cache / Queue | Upstash Redis (free tier) |
| File Storage | Cloudinary (10GB free) |
| Email | Gmail SMTP via Nodemailer |
| Payments | PayMongo (GCash — free to register) |
| Push Notifications | Firebase FCM (free) |
| Document Storage | Google Drive API (free) |
| Backend Hosting | Railway.app |
| Frontend Hosting | Vercel (free) |
| CI/CD | GitHub Actions (free) |

## Project Structure

```
├── backend/          # NestJS API (TypeScript)
├── frontend/         # React + Vite (TypeScript)
├── infrastructure/   # Legacy Terraform (not used — Railway handles infra)
├── aidlc-docs/       # AI-DLC documentation
└── .github/          # GitHub Actions CI/CD
```

## Quick Start

```bash
# Backend
cd backend
copy .env.example .env   # fill in values
npm install
npm run migration:run
npm run start:dev         # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## Environment Variables

See `backend/.env.example` for all required variables with setup instructions.

## Deployment

- **Backend**: Push to `main` → auto-deploys to Railway.app
- **Frontend**: Push to `main` → auto-deploys to Vercel

## Free Service Accounts Needed

1. [Railway.app](https://railway.app) — backend + PostgreSQL
2. [Vercel](https://vercel.com) — frontend
3. [Cloudinary](https://cloudinary.com) — file storage
4. [Upstash](https://upstash.com) — Redis
5. [PayMongo](https://dashboard.paymongo.com) — GCash payments
6. [Firebase](https://console.firebase.google.com) — push notifications
7. Gmail account — transactional email
