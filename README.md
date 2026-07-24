# NexusAI Landing + Task Manager

Monorepo with two independently deployable parts:

- **`frontend/`** — React + Vite app. Deploy to Vercel.
- **`backend/`** — Express + SQLite API. Deploy to Railway.

## Local development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev        # runs on http://localhost:5000

# Frontend (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm run dev         # runs on http://localhost:5173
```

## Deployment

**Backend (Railway)**
1. New Project → Deploy from this GitHub repo
2. Set the Railway service's **root directory** to `backend`
3. Set environment variables: `JWT_SECRET`, `JWT_EXPIRES_IN`, `GROQ_API_KEY` (optional), `ALLOWED_ORIGINS`
4. Attach a persistent volume (e.g. mounted at `/data`) and set `DB_PATH=/data/tasks.db` so the SQLite database survives redeploys

**Frontend (Vercel)**
1. New Project → import this GitHub repo
2. Set the Vercel project's **root directory** to `frontend`
3. Set environment variable `VITE_API_URL` to your Railway backend URL (no trailing slash, no `/api`)
4. Deploy

**After both are live:** set `ALLOWED_ORIGINS` on Railway to your Vercel URL and redeploy the backend.
