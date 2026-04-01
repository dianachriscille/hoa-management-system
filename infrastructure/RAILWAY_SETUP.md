# Infrastructure — HOA Management System

## Overview

Infrastructure is fully managed by **Railway.app** — no Terraform needed.

## Railway Services

| Service | Type | Notes |
|---|---|---|
| hoa-backend | Web Service | NestJS API, auto-deployed from GitHub |
| hoa-postgres | PostgreSQL Plugin | Auto-provisioned, credentials injected as env vars |

## Setup Steps

1. Go to `https://railway.app/new`
2. **New Project → Deploy from GitHub repo**
3. Select `hoa-management-system` repo
4. Railway detects `railway.json` and `backend/Dockerfile` automatically
5. Click **Add Plugin → PostgreSQL** — Railway auto-sets `DATABASE_URL`
6. Add all environment variables from `backend/.env.example`
7. Click **Deploy**

## Environment Variables on Railway

Set these in Railway dashboard → your service → Variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
GMAIL_FROM=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REDIS_URL=rediss://...  (from Upstash)
PAYMONGO_PUBLIC_KEY=...
PAYMONGO_SECRET_KEY=...
PAYMONGO_WEBHOOK_SECRET=...
GOOGLE_DRIVE_CLIENT_ID=...
GOOGLE_DRIVE_CLIENT_SECRET=...
FCM_SERVER_KEY=...
QR_HMAC_SECRET=...
```

## Upstash Redis Setup

Railway does not include a free Redis tier — use Upstash instead:

1. Go to `https://upstash.com` → Create Redis database
2. Choose region closest to your Railway deployment region
3. Copy the **Redis URL** → set as `REDIS_URL` in Railway

## Custom Domain (Optional)

Railway dashboard → your service → Settings → Custom Domain → add your domain.
