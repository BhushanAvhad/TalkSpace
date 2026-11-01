# TalkSpace 💬

TalkSpace is a real-time chat application powered by **Node.js**, **Express**, **Socket.IO**, and **Supabase (PostgreSQL & Realtime)**.

---

## 🚀 Features

- **Real-Time Messaging**: Group channels and 1-on-1 direct private messages with instant delivery via Socket.IO.
- **Supabase Cloud Database**: Persistent message history and user accounts stored in Supabase PostgreSQL.
- **User Authentication**: Secure user registration and login with salted cryptographic password hashing (`PBKDF2 SHA-512`).
- **Chat Requests**: Interactive private chat invitations between active users.
- **Typing Indicators**: Real-time feedback when a user is typing.
- **Emoji Picker**: Integrated emoji support for expressive conversations.
- **Dark / Light Mode**: Easily toggleable themes.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Frontend**: Vanilla JavaScript, Bootstrap 5, FontAwesome, HTML5/CSS3

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/BhushanAvhad/TalkSpace.git
cd TalkSpace
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Supabase Environment Variables
Create a `.env` file in the project root:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
PORT=3000
```

### 4. Setup Database Tables in Supabase
Run the SQL script from `supabase_schema.sql` in your **Supabase Dashboard → SQL Editor**.

### 5. Start the Application
```bash
# Start server
npm start

# Or with auto-reload (development mode)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
ISC
