-- ==============================================================================
-- TalkSpace - Automatic Message Retention & Cleanup Migration
-- Policy: 
--   1. Public Group Messages (#general) are retained for 48 hours (configurable).
--   2. Private Messages are retained INDEFINITELY (never deleted).
-- ==============================================================================

-- Create index on (type, created_at) to make retention queries ultra-fast
CREATE INDEX IF NOT EXISTS idx_messages_type_created_at
ON public.messages (type, created_at ASC);

-- Stored function for safe, idempotent group message purge
CREATE OR REPLACE FUNCTION public.purge_expired_group_messages(
    retention_hours INTEGER DEFAULT 48
)
RETURNS TABLE (
    deleted_count INTEGER,
    deleted_message_ids TEXT[],
    deleted_attachment_urls TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
    v_deleted_count INTEGER := 0;
    v_message_ids TEXT[] := ARRAY[]::TEXT[];
    v_attachment_urls TEXT[] := ARRAY[]::TEXT[];
    rec RECORD;
BEGIN
    -- 1. Validate retention hours is a strictly positive integer
    IF retention_hours IS NULL OR retention_hours <= 0 THEN
        RAISE EXCEPTION 'retention_hours must be a positive integer. Received: %', retention_hours;
    END IF;

    -- 2. Compute UTC cutoff timestamp
    cutoff_time := timezone('utc'::text, now()) - (retention_hours || ' hours')::INTERVAL;

    -- 3. Collect eligible group messages (STRICTLY type = 'group')
    -- Private messages (type = 'private') are NEVER matched
    FOR rec IN
        SELECT id, message_id, message
        FROM public.messages
        WHERE type = 'group'
          AND created_at <= cutoff_time
    LOOP
        v_message_ids := array_append(v_message_ids, COALESCE(rec.message_id, rec.id::text));
        
        -- If message contains JSON with fileURL, extract it for physical cleanup
        IF rec.message LIKE '%"fileURL"%' THEN
            BEGIN
                -- Safely extract fileURL using regex
                v_attachment_urls := array_append(
                    v_attachment_urls,
                    substring(rec.message from '"fileURL":"([^"]+)"')
                );
            EXCEPTION WHEN OTHERS THEN
                -- Continue if JSON parsing fails
            END;
        END IF;
    END LOOP;

    -- 4. Delete only the identified group records
    IF array_length(v_message_ids, 1) > 0 THEN
        DELETE FROM public.messages
        WHERE type = 'group'
          AND created_at <= cutoff_time;

        GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    END IF;

    RETURN QUERY SELECT v_deleted_count, v_message_ids, v_attachment_urls;
END;
$$;

-- Grant execution permission to authenticated and service roles
GRANT EXECUTE ON FUNCTION public.purge_expired_group_messages(INTEGER) TO anon, authenticated, service_role;

