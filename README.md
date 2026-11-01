# TalkSpace 💬

A modern, full-stack, real-time messaging and communication platform built with **React 19**, **Node.js**, **Express**, **Socket.IO**, and **Supabase (PostgreSQL & Storage)**.

TalkSpace features end-to-end real-time communication, robust file and media sharing, cryptographic authentication, rich message interactions (reactions, edits, replies), advanced search, automated 48-hour public retention policies, and cross-platform production deployment readiness (Vercel + Render).

---

## 🌟 Key Features

### 1. Real-Time Messaging & Channels
- **Public #General Room**: Real-time group chat for community conversations.
- **1-on-1 Direct Messaging**: Private conversations with chat request acceptance flows.
- **Socket.IO Realtime Engine**: Instant event-driven message delivery, user presence, and typing indicators.
- **Message Read Receipts & Unread Badges**: Unread message counters, double-check delivery indicators, and conversation mute controls.

### 2. Rich Message Interactions
- **Emoji Reactions**: Expressive reaction picker with multi-emoji reactions, count aggregation, and real-time synchronization.
- **Quoted Replies**: Contextual message replies with previews and one-click jump-to navigation.
- **Message Editing & Deletion**: Authors can edit messages (with an `(edited)` indicator) or delete them with real-time sync across connected peers.

### 3. File Sharing & Media Management
- **Drag-and-Drop Uploader**: Upload images (PNG, JPEG, WEBP, GIF) and documents (PDF, DOCX, XLSX, PPTX, TXT, CSV) up to 25MB.
- **Supabase Storage Integration**: Attachments persist in Supabase Storage (`talkspace-files` bucket) with fallback local caching.
- **Interactive Lightbox & Previews**: Fullscreen lightbox viewer with zoom controls and document metadata badges.
- **Shared Media Panel**: Drawer displaying shared photos, documents, and attachments filtered per channel or private conversation.
- **Access Control & Privacy**: Private conversation attachments are protected via backend authorization and signed URLs.

### 4. User Profiles & Customization
- **Profile Customization**: Customizable display names, custom avatar uploads, bio, and real-time status text.
- **Theme Modes**: Seamlessly toggle between dark graphite mode and clean slate light mode.
- **Audio Notifications**: Toggleable notification sound effects and muted conversation settings.

### 5. Advanced Search (Ctrl + K)
- **Universal Quick Search**: Instant modal search accessed via `Ctrl + K` (or `Cmd + K`).
- **Scoped Filters**: Search across active users, public messages, and authorized private chat history.
- **Keyword Highlighting & Direct Navigation**: Matches are highlighted with direct navigation to message context.

### 6. Automated Retention Policy
- **48-Hour Public Retention**: Messages and media in the public `#general` channel automatically expire and are purged after 48 hours via an hourly background scheduler.
- **Indefinite Private Retention**: All 1-on-1 private messages and private attachments remain stored indefinitely.

### 7. Security & Hardening
- **Authentication**: Salted cryptographic password hashing (`PBKDF2 SHA-512`).
- **Input Sanitization & MIME Validation**: Strict file type sniffing and size validation preventing executable uploads.
- **CORS & WebSocket Protection**: Dynamic CORS matching for production domains and Vercel preview environments.
- **Health Checks & Graceful Shutdown**: Integrated `/health` monitoring and container signal management (`SIGTERM`, `SIGINT`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark/light theme variables
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Real-Time Client**: [Socket.IO Client](https://socket.io/)
- **UI & Animations**: [Framer Motion](https://www.framer.com/motion/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Server Framework**: [Express 4](https://expressjs.com/)
- **Real-Time Gateway**: [Socket.IO 4](https://socket.io/) (HTTP server shared)
- **Uploads**: [Multer](https://github.com/expressjs/multer) with cryptographic filename generation
- **CORS & Security**: Dynamic CORS origin validator, path traversal guards

### Database & Cloud Storage
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS)
- **Object Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage) (`talkspace-files` bucket)

---

## 📁 Repository Structure

```
chat_app_final_done/
├── frontend/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/           # UI, Chat, Auth, Profile & Search components
│   │   ├── lib/                  # Utilities & API / Socket URL resolvers
│   │   ├── pages/                # LandingPage and views
│   │   ├── socket/               # Socket.IO client instance
│   │   └── stores/               # Zustand stores (useAuthStore, useChatStore)
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json               # Vercel SPA routing rewrites
├── storageService.js             # Supabase Storage client & file access control
├── retentionService.js           # 48-hour group retention & cleanup scheduler
├── server.js                     # Unified Express & Socket.IO backend
├── supabase_schema.sql           # Database schema & RLS policies
├── DEPLOYMENT.md                 # Production deployment manual (Vercel + Render)
├── .env.example                  # Backend environment variable template
└── package.json                  # Backend dependencies and scripts
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- A free **Supabase** project

### 2. Clone Repository
```bash
git clone https://github.com/BhushanAvhad/TalkSpace.git
cd TalkSpace
```

### 3. Backend Setup
1. Install backend dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-anon-or-service-role-key
   SUPABASE_STORAGE_BUCKET=talkspace-files
   PORT=3000
   PUBLIC_GROUP_RETENTION_HOURS=48
   ```

3. Setup Database Schema:
   Execute the SQL statements in `supabase_schema.sql` inside your **Supabase Dashboard → SQL Editor**.

4. Start the backend:
   ```bash
   npm run dev
   # Server starts on http://localhost:3000
   ```

### 4. Frontend Setup
1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start Vite development server:
   ```bash
   npm run dev
   # App will be accessible at http://localhost:5173
   ```
   *(In local development, Vite proxies API and WebSocket requests to `http://localhost:3000` automatically).*

---

## 🌐 Production Deployment

TalkSpace is prepared for zero-friction cloud deployment:
- **Frontend on Vercel**: Connect the repository, set Root Directory to `frontend`, and configure `VITE_API_URL` and `VITE_SOCKET_URL`.
- **Backend on Render**: Deploy as a Web Service running `npm start` bound to `0.0.0.0` with health checking at `/health`.
- **Media on Supabase Storage**: Create a private bucket named `talkspace-files`.

For detailed instructions and environment variable reference, consult the complete guide in [DEPLOYMENT.md](file:///d:/development/chat_app_final_done/DEPLOYMENT.md).

---

## 🧪 Testing & Verification

- **Backend Syntax Check**: `node --check server.js storageService.js retentionService.js`
- **Frontend Production Build**: `npm run build --prefix frontend`
- **Health Endpoint**: `GET /health` (returns HTTP 200 with uptime and status)

---

## 📄 License
This project is licensed under the **ISC License**.
