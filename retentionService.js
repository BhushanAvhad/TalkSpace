const path = require('path');
const fs = require('fs');
const supabase = require('./supabaseClient');

// Mutex flag to prevent concurrent execution
let isCleanupRunning = false;
let cleanupInterval = null;

/**
 * Validates and gets the configured retention hours
 * @returns {number} Retention hours (minimum 1, default 48)
 */
function getRetentionHours() {
  const envVal = process.env.PUBLIC_GROUP_RETENTION_HOURS;
  if (!envVal) return 48;

  const parsed = parseInt(envVal, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(`[RetentionService] Invalid PUBLIC_GROUP_RETENTION_HOURS ("${envVal}"). Defaulting to 48 hours.`);
    return 48;
  }
  return parsed;
}

/**
 * Extracts attached file paths from message content
 * @param {string} messageContent 
 * @returns {string[]} List of sanitized filenames
 */
function extractAttachmentFilenames(messageContent) {
  const filenames = [];
  if (!messageContent || typeof messageContent !== 'string') return filenames;

  // If message is stored as JSON payload
  if (messageContent.trim().startsWith('{') && messageContent.includes('"fileURL"')) {
    try {
      const parsed = JSON.parse(messageContent);
      if (parsed.fileURL) {
        filenames.push(path.basename(parsed.fileURL));
      }
      if (parsed.storedName) {
        filenames.push(path.basename(parsed.storedName));
      }
    } catch (e) {
      // fallback to regex
    }
  }

  // Regex fallback for /api/files/ or /uploads/ in message string
  const urlMatches = messageContent.match(/\/(?:api\/files|uploads)\/([a-zA-Z0-9_\-\.]+)/g);
  if (urlMatches) {
    urlMatches.forEach(url => {
      filenames.push(path.basename(url));
    });
  }

  return [...new Set(filenames)];
}

/**
 * Performs a two-stage cleanup:
 * 1. Identifies and deletes expired group messages (STRICTLY type = 'group' AND created_at <= cutoff)
 * 2. Safely removes associated physical attachments only if no retained messages reference them
 * 
 * POLICY:
 * - Public group messages expire after 48 hours (configurable).
 * - Private messages are LIFETIME and NEVER touched by this service.
 * 
 * @param {Object} options
 * @param {boolean} options.dryRun - If true, only inspects and counts without deleting
 * @param {Object} [options.io] - Socket.IO instance to notify active clients
 * @param {string} [options.uploadDir] - Upload directory path
 * @returns {Promise<{ success: boolean, deletedMessages: number, deletedFiles: number, durationMs: number }>}
 */
async function executeRetentionCleanup(options = {}) {
  const { dryRun = false, io = null, uploadDir = path.join(__dirname, 'uploads') } = options;

  if (isCleanupRunning) {
    console.warn('[RetentionService] Cleanup already running. Skipping concurrent trigger.');
    return { success: false, reason: 'concurrent_execution_blocked', deletedMessages: 0, deletedFiles: 0, durationMs: 0 };
  }

  isCleanupRunning = true;
  const startTime = Date.now();
  const retentionHours = getRetentionHours();
  const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();

  console.log(`[RetentionService] ${dryRun ? '[DRY-RUN] ' : ''}Starting cleanup check at ${new Date().toISOString()}`);
  console.log(`[RetentionService] Retention window: ${retentionHours} hours (Cutoff: ${cutoffDate})`);

  let deletedMessagesCount = 0;
  let deletedFilesCount = 0;

  try {
    // Stage 1: Identify eligible expired group messages
    // STRICT FILTER: type = 'group' AND created_at <= cutoffDate
    const { data: expiredMessages, error: queryError } = await supabase
      .from('messages')
      .select('id, message_id, sender, type, message, created_at')
      .eq('type', 'group')
      .lte('created_at', cutoffDate)
      .order('created_at', { ascending: true });

    if (queryError) {
      console.error('[RetentionService] Failed to query expired messages from Supabase:', queryError.message);
      return { success: false, error: queryError.message, deletedMessages: 0, deletedFiles: 0, durationMs: Date.now() - startTime };
    }

    const count = expiredMessages ? expiredMessages.length : 0;
    console.log(`[RetentionService] Found ${count} expired public group message(s) older than ${retentionHours} hours.`);

    if (count === 0) {
      console.log('[RetentionService] No records eligible for purge. System is clean.');
      return { success: true, deletedMessages: 0, deletedFiles: 0, durationMs: Date.now() - startTime };
    }

    // Collect all candidate attachment filenames from the expired messages
    const candidateFilenames = new Set();
    expiredMessages.forEach(msg => {
      const names = extractAttachmentFilenames(msg.message);
      names.forEach(name => candidateFilenames.add(name));
    });

    console.log(`[RetentionService] Identified ${candidateFilenames.size} candidate attachment file(s) for physical review.`);

    if (dryRun) {
      console.log(`[RetentionService] [DRY-RUN] Would delete ${count} group messages and inspect ${candidateFilenames.size} physical files.`);
      return { success: true, dryRun: true, deletedMessages: count, deletedFiles: candidateFilenames.size, durationMs: Date.now() - startTime };
    }

    // Stage 2: Delete expired group messages from Supabase
    // CRITICAL SAFETY: Strictly scope delete to type = 'group' AND created_at <= cutoffDate
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('type', 'group')
      .lte('created_at', cutoffDate);

    if (deleteError) {
      console.error('[RetentionService] Failed to delete expired group messages from Supabase:', deleteError.message);
      return { success: false, error: deleteError.message, deletedMessages: 0, deletedFiles: 0, durationMs: Date.now() - startTime };
    }

    deletedMessagesCount = count;
    console.log(`[RetentionService] Successfully purged ${deletedMessagesCount} expired group messages from database.`);

    // Stage 3: Two-stage safe physical file removal
    // Only delete files that are NOT referenced by any retained group OR private message
    for (const filename of candidateFilenames) {
      try {
        const safeBaseName = path.basename(filename);
        const filePath = path.join(uploadDir, safeBaseName);

        // Security check: ensure path stays strictly inside uploadDir
        if (!filePath.startsWith(uploadDir)) {
          console.warn(`[RetentionService] Suspicious file path detected and skipped: ${filename}`);
          continue;
        }

        if (!fs.existsSync(filePath)) {
          continue; // File already gone or was never stored locally
        }

        // Verify if any remaining message in the database (group OR private) still references this file
        const { data: referencingMessages, error: refError } = await supabase
          .from('messages')
          .select('id, type')
          .ilike('message', `%${safeBaseName}%`)
          .limit(1);

        if (refError) {
          console.error(`[RetentionService] Error checking references for file ${safeBaseName}:`, refError.message);
          continue; // Skip file if check fails
        }

        if (referencingMessages && referencingMessages.length > 0) {
          console.log(`[RetentionService] Preserving file "${safeBaseName}" because it is still referenced by retained message ID ${referencingMessages[0].id} (type: ${referencingMessages[0].type}).`);
          continue;
        }

        // Safe to delete physical file
        fs.unlinkSync(filePath);
        deletedFilesCount++;
        console.log(`[RetentionService] Safely deleted orphaned attachment file: ${safeBaseName}`);
      } catch (fileErr) {
        console.error(`[RetentionService] Error during physical deletion of "${filename}":`, fileErr.message);
      }
    }

    // Notify connected clients in #general so their UI updates smoothly
    if (io && deletedMessagesCount > 0) {
      io.emit('groupHistoryPurged', {
        purgedCount: deletedMessagesCount,
        cutoffDate,
        timestamp: new Date().toISOString()
      });
    }

    const durationMs = Date.now() - startTime;
    console.log(`[RetentionService] Cleanup finished successfully in ${durationMs}ms. Deleted ${deletedMessagesCount} message(s) and ${deletedFilesCount} file(s).`);

    return {
      success: true,
      deletedMessages: deletedMessagesCount,
      deletedFiles: deletedFilesCount,
      durationMs
    };
  } catch (err) {
    console.error('[RetentionService] Unhandled error during cleanup execution:', err);
    return { success: false, error: err.message, deletedMessages: deletedMessagesCount, deletedFiles: deletedFilesCount, durationMs: Date.now() - startTime };
  } finally {
    isCleanupRunning = false;
  }
}

/**
 * Starts the automatic hourly retention scheduler
 * Executes every 60 minutes
 * 
 * @param {Object} io - Socket.IO instance
 * @param {string} [uploadDir] - Configured upload directory
 */
function startRetentionScheduler(io, uploadDir) {
  if (cleanupInterval) {
    console.log('[RetentionScheduler] Scheduler already active.');
    return;
  }

  const ONE_HOUR = 60 * 60 * 1000;
  console.log('[RetentionScheduler] Initializing automatic hourly cleanup scheduler...');

  // Run the first check after 5 minutes of server startup (to prevent boot-time load spike)
  setTimeout(() => {
    executeRetentionCleanup({ dryRun: false, io, uploadDir });
  }, 5 * 60 * 1000);

  // Recurring hourly scheduler
  cleanupInterval = setInterval(() => {
    executeRetentionCleanup({ dryRun: false, io, uploadDir });
  }, ONE_HOUR);

  console.log('[RetentionScheduler] Hourly scheduler active (Interval: 1 hour, Policy: 48h group retention).');
}

/**
 * Stops the retention scheduler
 */
function stopRetentionScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[RetentionScheduler] Scheduler stopped.');
  }
}

module.exports = {
  getRetentionHours,
  executeRetentionCleanup,
  startRetentionScheduler,
  stopRetentionScheduler,
};

