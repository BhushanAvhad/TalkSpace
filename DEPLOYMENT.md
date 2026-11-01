# TalkSpace – Production Deployment Guide

This guide details the complete, step-by-step procedure for deploying TalkSpace into production across:
- **Frontend**: [Vercel](https://vercel.com) (React 19 + Vite SPA)
- **Backend**: [Render](https://render.com) (Node.js Express + Socket.IO Web Service)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage) (`talkspace-files` bucket)

---

## Architecture Overview

```
                      ┌─────────────────────────┐
                      │    Vercel (Frontend)    │
                      │  React 19 + Vite (SPA)  │
                      └────────────┬────────────┘
                                   │
              HTTP REST + Files    │    WebSocket (Socket.IO)
                                   ▼
                      ┌─────────────────────────┐
                      │     Render (Backend)    │
                      │  Express 4 + Socket.IO  │
                      └────────────┬────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             ▼                                           ▼
┌─────────────────────────┐                 ┌─────────────────────────┐
│   Supabase PostgreSQL   │                 │     Supabase Storage    │
│  (Users, Messages, RLS) │                 │   ('talkspace-files')   │
└─────────────────────────┘                 └─────────────────────────┘
```

---

## 1. Supabase Storage & Database Setup

TalkSpace uses Supabase Storage to ensure attachments, media, and avatars persist across Render container restarts and redeployments.

### Step 1.1: Create Storage Bucket
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Storage** from the left-hand navigation.
3. Click **New bucket**.
4. Set **Name**: `talkspace-files`.
5. **Public bucket**: Keep toggle **OFF** (Private) so that attachments remain protected by TalkSpace authorization and signed URLs.
6. Click **Save**.

### Step 1.2: Verify Storage Policies (Optional / Recommended)
Because the backend interacts with Supabase Storage using your configured API key, no public bucket exposure is necessary.
If you wish to allow authenticated users direct read access:
```sql
-- Allow authenticated service operations
CREATE POLICY "Allow TalkSpace backend operations"
ON storage.objects FOR ALL
USING (bucket_id = 'talkspace-files');
```

---

## 2. Render Backend Deployment

Deploy the Node.js Express & Socket.IO server as a **Web Service** on Render.

### Step 2.1: Create Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing the TalkSpace code.
4. Configure the service settings:
   - **Name**: `talkspace-backend` (or your chosen name)
   - **Region**: Choose the region closest to your Supabase database
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
   - **Instance Type**: Free or Starter

### Step 2.2: Configure Render Environment Variables
Under the **Environment** tab of your Render service, add the following key-value pairs:

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` *(Render sets automatically)* | Backend listening port |
| `SUPABASE_URL` | `https://<your-project-id>.supabase.co` | Your Supabase project URL |
| `SUPABASE_KEY` | `<your-supabase-key>` | Supabase anon key or service-role key |
| `SUPABASE_STORAGE_BUCKET` | `talkspace-files` | Target Supabase storage bucket |
| `PUBLIC_GROUP_RETENTION_HOURS` | `48` | Group message auto-pruning window |
| `FRONTEND_URL` | `https://<your-frontend>.vercel.app` | Vercel production frontend origin |
| `CLIENT_URL` | `https://<your-frontend>.vercel.app` | Vercel frontend alias for CORS |
| `CORS_ORIGIN` | `https://<your-frontend>.vercel.app` | Allowed CORS origins |

> **Note on Initial Deployment**: If you don't know your exact Vercel URL yet, you can temporarily set `FRONTEND_URL=*` or deploy Vercel first and update Render environment variables immediately afterward.

### Step 2.3: Health Check
Render includes a **Health Check Path** setting:
- **Health Check Path**: `/health`

Once deployed, verify:
```bash
curl https://talkspace-backend.onrender.com/health
# Expected Response:
# {"status":"ok","uptime":12.34,"timestamp":"2026-11-01T..."}
```

---

## 3. Vercel Frontend Deployment

Deploy the React 19 + Vite frontend application to Vercel.

### Step 3.1: Create Project on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name**: `talkspace` (or your chosen name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3.2: Configure Vercel Environment Variables
Under the **Environment Variables** section, add:

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `VITE_API_URL` | `https://talkspace-backend.onrender.com` | Deployed Render backend base URL |
| `VITE_SOCKET_URL` | `https://talkspace-backend.onrender.com` | Deployed Render Socket.IO server URL |

### Step 3.3: Deploy
1. Click **Deploy**.
2. Once the build completes, Vercel will provide your production URL (e.g., `https://talkspace.vercel.app`).
3. Copy this URL and update the `FRONTEND_URL` and `CLIENT_URL` environment variables on your Render backend if you haven't already.

---

## 4. CORS and WebSocket Synchronization

TalkSpace includes native dynamic CORS origin validation in `server.js`:
- Supports exact matches (`FRONTEND_URL`, `CLIENT_URL`, `CORS_ORIGIN`).
- Automatically permits Vercel preview deployment URLs (`*.vercel.app`).
- Enables credentials exchange (`withCredentials: true`) required for protected sessions and file delivery.

If you add a custom domain (e.g. `https://talkspace.mycompany.com`), simply add it to `CORS_ORIGIN` in Render:
```env
CORS_ORIGIN=https://talkspace.mycompany.com,https://talkspace.vercel.app
```

---

## 5. Verification & Testing Checklist

After deploying both services, run through this verification checklist:

1. **Health Check**:
   - Access `https://your-backend.onrender.com/health`.
   - Ensure it returns HTTP 200 with `status: "ok"`.

2. **Frontend Routing & UI**:
   - Navigate to `https://your-frontend.vercel.app`.
   - Verify landing page renders with animations and dark/light mode toggle.

3. **Authentication**:
   - Register a new user account.
   - Log out and log back in.
   - Verify session restores without requiring re-login.

4. **Real-Time Messaging**:
   - Open two browser tabs (or an incognito window with a second user).
   - Send messages in `#general`.
   - Send a 1-on-1 private chat request and verify instant acceptance and message delivery.

5. **Attachment & Supabase Storage**:
   - Upload an image in `#general`.
   - Upload a document in a private conversation.
   - Verify thumbnails render, lightbox zoom works, and document downloads successfully.
   - Check your Supabase Dashboard **Storage** > `talkspace-files` bucket to confirm objects are stored.

6. **Profile Avatar Uploads**:
   - Click your profile > Settings > Upload Avatar.
   - Upload an image. Verify the avatar updates in the header, sidebar, and message list without flickering.

7. **Data Retention & Privacy**:
   - Group messages are automatically cleaned after 48 hours.
   - Private messages and attachments remain stored indefinitely.
   - Direct file URLs cannot be accessed by unauthorized users without proper credentials/membership.

---

## 6. Local Development Reference

To run the full stack locally:
```bash
# Terminal 1: Start backend
npm install
npm run dev

# Terminal 2: Start frontend
cd frontend
npm install
npm run dev
```
In local development, leave `VITE_API_URL` and `VITE_SOCKET_URL` blank in `frontend/.env` to utilize the built-in Vite reverse proxy (`vite.config.js`).

