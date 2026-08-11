# Deploying FitiFy — Two Separate Vercel Projects

This project deploys as **two independent Vercel projects**:

| Project | Directory (Root Directory) | What it runs | Result URL |
|---|---|---|---|
| **fitify-backend** | `backend/` | Express API as a serverless function | `https://fitify-backend.vercel.app` (example) |
| **fitify-frontend** | `frontend/` | Static Vite/React site | `https://fitify-frontend.vercel.app` (example) |

The frontend is a static site. Every `/api/*` request the browser makes is **proxied by Vercel's edge network to the backend** (see `frontend/vercel.json`). This means:

- The frontend code keeps using relative `/api/...` paths — **zero code changes**.
- Cookies and auth work as same-origin — **no CORS and no cross-site cookie problems**.
- No CORS headers, no `SameSite=None` hacks, no API base URL env vars needed.

---

## Why it won't error (what was verified)

Both directories have been dry-run built in isolation exactly the way Vercel builds them:

- `frontend/` → `npm ci` (fresh install from `frontend/package-lock.json`) → `npm run build` (`vite build`) → **succeeds**, output in `dist/`.
- `backend/` → `npm ci` (fresh install from `backend/package-lock.json`) → esbuild bundles **both** `src/server.ts` and the Vercel entry `api/index.ts` → **succeeds**.
- The bundled Express app was booted and smoke-tested: `GET /api/health` → 200, `GET /api/auth/me` → 401 (expected), `GET /api/leaderboard` → 200.

Each subdirectory has its **own `package-lock.json`**, so Vercel installs the exact tested dependency versions — no version drift.

---

## Prerequisites

- The repo pushed to GitHub.
- A Vercel account (free Hobby plan is enough).
- Environment values ready:
  - `GEMINI_API_KEY` (Google AI Studio)
  - `MONGODB_URI` (MongoDB Atlas / any Mongo connection string)
  - `SESSION_SECRET` (long random string)

---

## Step 1 — Deploy the Backend

1. In Vercel, click **Add New → Project**, import the GitHub repo.
2. In **Configure Project**:
   - **Root Directory:** `backend`
   - Framework preset: **Other** (leave as detected; `vercel.json` handles the build)
   - Build Command: leave empty (from `vercel.json`)
   - Output Directory: leave empty
3. In **Environment Variables**, add (preview + production + development):
   - `GEMINI_API_KEY`
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `APP_URL` = the future **frontend** URL, e.g. `https://fitify-frontend.vercel.app` (used by the CORS allow-list; harmless via the proxy)
4. In **Settings → General → Node.js Version**, select **24.x**.
5. Click **Deploy**.
6. After it finishes, open **Settings → Domains** and copy the production URL, e.g. `https://fitify-backend.vercel.app`.
7. Verify it works by visiting `https://fitify-backend.vercel.app/api/health` — you should see `{"status":"ok",...}`.

> If a route returns `MONGODB_URI is not set...`, the env var wasn't added (check the deployed environment variables).

---

## Step 2 — Point the frontend at the backend

Edit `frontend/vercel.json` and replace the placeholder:

```json
"destination": "https://YOUR-BACKEND-PROJECT.vercel.app/api/$1"
```

with your real backend URL (no trailing slash), e.g.:

```json
"destination": "https://fitify-backend.vercel.app/api/$1"
```

Commit and push.

---

## Step 3 — Deploy the Frontend

1. In Vercel, click **Add New → Project**, import the same GitHub repo.
2. In **Configure Project**:
   - **Root Directory:** `frontend`
   - Framework preset: **Vite** (auto-detected)
   - Build Command: leave empty (from `vercel.json`)
   - Output Directory: `dist` (set in `vercel.json`)
3. In **Settings → General → Node.js Version**, select **24.x**.
4. No environment variables are required on the frontend.
5. Click **Deploy**.

The frontend now serves the SPA and proxies `/api/*` to the backend through Vercel's edge. Logins, the leaderboard, and all Gemini features work end-to-end.

---

## Step 4 — Post-deploy checks

- `https://<frontend>.vercel.app/api/health` returns `{"status":"ok",...}` (proxy → backend works).
- Sign up / sign in persists after refresh (cookie + MongoDB work).
- An AI workout generation succeeds (Gemini key works).

---

## Re-deploying after changes

- Push to the GitHub default branch (or any connected branch) — each project auto-deploys.
- Only `backend/**` changes trigger the backend rebuild; only `frontend/**` changes trigger the frontend rebuild.

---

## Local development (unchanged)

```bash
npm install        # repo root (npm workspaces)
npm run dev        # backend :3000 + frontend :5173
```

The root `vercel.json` is still there and still works if you ever want a single-project (monolith) deploy from the repo root — it is ignored when you set a Root Directory of `backend/` or `frontend/`.
