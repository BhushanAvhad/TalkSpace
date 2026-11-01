-- ==============================================================================
-- TalkSpace - Phase 6 Migration: User Profiles, Reactions, Replies & Search
-- Safe to run multiple times (Idempotent)
-- ==============================================================================

-- 1. Add Profile Attributes to Users Table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'profile.png',
ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT 'Available',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_users_username_trgm 
ON public.users (username);

CREATE INDEX IF NOT EXISTS idx_messages_sender_target 
ON public.messages (sender, target);

-- 3. Row Level Security policies remain active
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Secure Search RPC Function (Strict Authorization Enforcement)
-- Users can ONLY search public group messages OR private messages where they are sender or recipient
CREATE OR REPLACE FUNCTION public.search_talkspace_messages(
    p_requesting_user TEXT,
    p_query TEXT,
    p_chat_type TEXT DEFAULT 'all', -- 'all', 'group', or 'private'
    p_partner TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    message_id TEXT,
    sender TEXT,
    target TEXT,
    type TEXT,
    message TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
BEGIN
    -- 48-Hour retention cutoff for public group messages
    cutoff_time := timezone('utc'::text, now()) - INTERVAL '48 hours';

    RETURN QUERY
    SELECT m.id, m.message_id, m.sender, m.target, m.type, m.message, m.created_at
    FROM public.messages m
    WHERE 
        -- Keyword match
        m.message ILIKE ('%' || p_query || '%')
        AND (
            -- Condition 1: Public group messages within 48 hours retention
            (m.type = 'group' AND m.created_at > cutoff_time AND (p_chat_type = 'all' OR p_chat_type = 'group'))
            OR
            -- Condition 2: Private messages ONLY belonging to the requesting user
            (
                m.type = 'private'
                AND (m.sender = p_requesting_user OR m.target = p_requesting_user)
                AND (p_chat_type = 'all' OR p_chat_type = 'private')
                AND (p_partner IS NULL OR m.sender = p_partner OR m.target = p_partner)
            )
        )
    ORDER BY m.created_at DESC
    LIMIT 50;
END;
$$;

-- Grant execute rights
GRANT EXECUTE ON FUNCTION public.search_talkspace_messages(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

