# CareTriage AI

Full-stack healthcare intake app: **Next.js** (UI) + **FastAPI** (API). You can deploy **both on Vercel**: Next.js via `@vercel/next` and the API as a Python serverless function (`api/index.py` at the repo root → `/v1/*`, `/health`). The same FastAPI app also runs standalone from `backend/` on **Render**, **Railway**, **Fly.io**, or **Cloud Run** if you prefer a long-lived process.

---

## Prerequisites

| Tool | Role |
|------|------|
| [Node.js](https://nodejs.org/) 20+ | Frontend |
| [uv](https://docs.astral.sh/uv/getting-started/installation/) | Python dependencies for local API dev (`backend/` uses `pyproject.toml` + `uv.lock`; root `requirements.txt` mirrors deps for Vercel’s Python builder) |
| [PostgreSQL](https://www.postgresql.org/) | Production database (optional locally; SQLite is fine for dev) |

Install **uv** (pick one):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# macOS/Linux: then restart the shell or: export PATH="$HOME/.local/bin:$PATH"
```

```bash
brew install uv
```

---

## Run locally

### 1. Frontend (repo root)

```bash
npm install
cp .env.example .env.local
```

In `.env.local` set at least:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (from [Clerk](https://dashboard.clerk.com/))
- `NEXT_PUBLIC_API_URL=http://localhost:8000`

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. API (`backend/`)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` — for local dev, default `sqlite:///./data/caretriage.db` is fine.
- `CLERK_JWKS_URL`, `CLERK_ISSUER` — must match the JWTs your app sends (Clerk dashboard → **API Keys** / Frontend API).
- `OPENAI_API_KEY`, optional `OPENAI_MODEL`.

Install dependencies and start the server (uses **only** `uv`; lockfile is `uv.lock`):

```bash
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: [http://localhost:8000/health](http://localhost:8000/health), routes under `/v1/...`.

### One command from repo root

If `uv` is on your `PATH`:

```bash
npm run dev:api
```

This runs `uv run uvicorn ...` inside `backend/` (after you have run `uv sync` there once).

---

## Database notes

- **Local:** SQLite (`DATABASE_URL=sqlite:///./data/caretriage.db`) — file is created under `backend/data/`.
- **Production:** Use **Postgres**. Pass `postgresql://...` or `postgres://...`; the app normalizes to **`postgresql+psycopg://`** (psycopg v3, declared in `pyproject.toml`).
- **Supabase:** Paste the **URI** from **Project Settings → Database** into `DATABASE_URL`. The API adds `sslmode=require` and a short `connect_timeout` when the host contains `supabase`. If you see **`failed to resolve host 'db....supabase.co'`**, that is **DNS** (offline, VPN, typo, paused/deleted project, or rare IPv6/DNS issues). Confirm the hostname in the Supabase dashboard and try the **pooler** connection string from the same page if direct `db.*` fails on your network.
- Do not rely on SQLite for production on ephemeral disks.

---

## Deploy

### Full stack on Vercel (Next.js + FastAPI serverless)

`vercel.json` uses **legacy `builds`**: `@vercel/next` from `package.json` and `@vercel/python` from `api/index.py`. Routes send **`/v1/*`** and **`/health`** to the Python function; everything else is served by Next (`handle: filesystem` first—do **not** route `/(.*)` only to Python or pages will never load).

1. Push this repo to GitHub/GitLab/Bitbucket.
2. [Import the project in Vercel](https://vercel.com/new). Root directory = repository root.
3. **Environment variables** on the same Vercel project — use **`vercel/env.example`** as the full checklist (groups A–D: Next public, Clerk secret, FastAPI/Python, optional). At minimum: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_URL` (same origin: `https://<project>.vercel.app`, no trailing slash), `CORS_ORIGINS`, `DATABASE_URL` (Postgres in production), `CLERK_JWKS_URL`, `CLERK_ISSUER`, `OPENAI_API_KEY`, plus `OPENAI_MODEL` / `OPENAI_TIMEOUT_SECONDS` / `FREE_TIER_MONTHLY_INTAKES` as needed.
4. In **Clerk**, add your Vercel URL (`https://<project>.vercel.app` and custom domain) to allowed origins / redirect URLs.

Keep root **`requirements.txt`** in sync with **`backend/pyproject.toml`** when you add Python dependencies (Vercel installs from the repo root for the Python builder).

### API only → Render / Railway / Fly / etc.

If you host the API elsewhere, point `NEXT_PUBLIC_API_URL` at that base URL (no trailing slash).

Common pattern:

1. Set the service **root directory** to `backend` (or run commands from `backend`).
2. **Install uv** in the build step, then sync from the lockfile:

   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   export PATH="$HOME/.local/bin:$PATH"
   uv sync --frozen
   ```

3. **Start command** (example; your host may inject `PORT`):

   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment variables** on the API host: `DATABASE_URL` (Postgres), `CORS_ORIGINS` (include your Vercel URL, e.g. `https://your-app.vercel.app`), `CLERK_JWKS_URL`, `CLERK_ISSUER`, `OPENAI_API_KEY`, etc. See `backend/.env.example`.

Commit **`backend/uv.lock`** so production uses `uv sync --frozen` and reproducible builds.

`backend/Procfile` is optional (e.g. Heroku-style); it expects `uv` on `PATH` at runtime—same as the start command above.

---

## Repository layout

| Path | Purpose |
|------|---------|
| `app/`, `components/` | Next.js App Router UI |
| `api/index.py` | Vercel Python serverless entry for FastAPI (kept outside `app/` so it is not confused with App Router API routes) |
| `vercel/env.example` | All env vars mapped for the Vercel dashboard (Next + Python) |
| `backend/pyproject.toml` | API dependencies (PEP 621) |
| `backend/uv.lock` | Locked versions for `uv sync --frozen` |
| `backend/app/` | FastAPI app (`/v1/intake`, `/v1/reports`, Clerk JWT, OpenAI, rule-based triage floors) |
