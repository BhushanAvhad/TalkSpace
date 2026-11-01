-- ==============================================================================
-- Supabase Schema for Wassup Chat Application (Users & Messages)
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- 1. Create Users Table for Login / Authentication
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
CREATE POLICY "Allow public read access to users"
ON public.users
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert access to users" ON public.users;
CREATE POLICY "Allow public insert access to users"
ON public.users
FOR INSERT
WITH CHECK (true);


-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT UNIQUE,
    sender TEXT NOT NULL,
    target TEXT, -- NULL for group messages, username for private messages
    type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('group', 'private')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Indexes for Messages
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages (type);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender);
CREATE INDEX IF NOT EXISTS idx_messages_target ON public.messages (target);

-- 4. Enable Row Level Security (RLS) for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to messages" ON public.messages;
CREATE POLICY "Allow public read access to messages"
ON public.messages
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert access to messages" ON public.messages;
CREATE POLICY "Allow public insert access to messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- 5. Enable Realtime Replication (Safe if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END $$;
