# Build Instructions — HOA Management System (Free Services)

## Free Services Used

| Service | Purpose | Free Tier |
|---|---|---|
| Railway.app | Backend hosting + PostgreSQL | $5 credit/month |
| Vercel | Frontend hosting | Unlimited free |
| Cloudinary | File storage (photos, documents) | 10GB free |
| Gmail SMTP | Transactional email | 500/day free |
| PayMongo | GCash payments | Free to register, ~2.5% per transaction |
| Firebase FCM | Push notifications | Free |
| Google Drive API | Document repository | Free |
| Upstash Redis | Session cache + BullMQ | 10K commands/day free |

---

## Local Development Setup

### Step 1 — Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Start local PostgreSQL and Redis
```bash
docker run -d --name hoa-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hoa_system -p 5432:5432 postgres:15
docker run -d --name hoa-redis -p 6379:6379 redis:7
```

### Step 3 — Configure environment
```bash
cd backend
copy .env.example .env
# Fill in all values
```

### Step 4 — Run migrations and start
```bash
cd backend
npm run migration:run
npm run start:dev

cd frontend
npm run dev
```

---

## Free Service Setup Guides

### Gmail SMTP
1. Go to `https://myaccount.google.com/security`
2. Enable **2-Step Verification**
3. Search **App Passwords** → Generate for "Mail"
4. Copy the 16-character password
```
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_FROM="HOA Management <youremail@gmail.com>"
```

### Cloudinary
1. Sign up at `https://cloudinary.com`
2. Dashboard → copy Cloud Name, API Key, API Secret
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

### Upstash Redis
1. Sign up at `https://upstash.com`
2. Create Redis database → copy Redis URL (starts with `rediss://`)
```
REDIS_URL=rediss://default:password@host:port
```

### PayMongo
1. Sign up at `https://dashboard.paymongo.com`
2. Developers → API Keys → copy Public + Secret keys
3. Developers → Webhooks → Create webhook
   - URL: `https://your-backend-url/billing/webhooks/paymongo`
   - Events: `link.payment.paid`, `link.payment.failed`
4. Copy webhook secret
```
PAYMONGO_PUBLIC_KEY=pk_test_xxxx
PAYMONGO_SECRET_KEY=sk_test_xxxx
PAYMONGO_WEBHOOK_SECRET=whsk_xxxx
```

---

## Production Deployment

### Backend → Railway.app
1. Sign up at `https://railway.app`
2. New Project → Deploy from GitHub repo
3. Add **PostgreSQL** plugin (auto-sets DB credentials)
4. Add all environment variables from `.env.example`
5. Deploy → Railway gives you a public URL

### Frontend → Vercel
1. Sign up at `https://vercel.com`
2. New Project → Import from GitHub
3. Set root directory to `frontend`
4. Add env var: `VITE_API_URL=https://your-railway-url`
5. Deploy

### GitHub Actions Secrets Required
| Secret | Value |
|---|---|
| `RAILWAY_TOKEN_DEV` | Railway token for dev |
| `RAILWAY_TOKEN_PROD` | Railway token for prod |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `DEV_API_URL` | Dev backend Railway URL |
| `PROD_API_URL` | Prod backend Railway URL |

---

## Verify Deployment
```bash
curl https://your-railway-url/health
# Expected: { "status": "ok", "database": "connected" }
```
