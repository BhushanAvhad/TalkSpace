const path = require('path');
const fs = require('fs');
const supabase = require('./supabaseClient');

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'talkspace-files';
const uploadDir = path.join(__dirname, 'uploads');

// Ensure local upload dir exists for staging
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// In-memory permissions cache: filename -> { sender, target, isPrivate }
const filePermissionsCache = new Map();

/**
 * Registers permission for a newly uploaded file
 */
function recordFilePermission(filename, sender, target, isPrivate) {
  if (!filename) return;
  filePermissionsCache.set(filename, {
    sender: (sender || '').toLowerCase(),
    target: (target || '').toLowerCase(),
    isPrivate: !!isPrivate,
  });
}

/**
 * Uploads a local file buffer to Supabase Storage bucket
 * @param {string} filename 
 * @param {string} localFilePath 
 * @param {string} mimeType 
 * @returns {Promise<{ success: boolean, url?: string, storageKey?: string, error?: string }>}
 */
async function uploadToSupabaseStorage(filename, localFilePath, mimeType) {
  try {
    if (!fs.existsSync(localFilePath)) {
      return { success: false, error: 'Local file does not exist for upload.' };
    }

    const fileBuffer = fs.readFileSync(localFilePath);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: mimeType || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.warn(`[StorageService] Supabase Storage upload notice for "${filename}": ${error.message}. Local copy preserved.`);
      return { success: false, error: error.message };
    }

    console.log(`[StorageService] Successfully uploaded "${filename}" to Supabase Storage bucket "${BUCKET_NAME}".`);
    return { success: true, storageKey: data?.path || filename };
  } catch (err) {
    console.warn(`[StorageService] Exception during Supabase Storage upload for "${filename}":`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a file from Supabase Storage and local disk
 * @param {string} filename 
 */
async function deleteFromStorage(filename) {
  const sanitized = path.basename(filename);

  // 1. Delete from local disk if present
  const localPath = path.join(uploadDir, sanitized);
  if (fs.existsSync(localPath)) {
    try {
      fs.unlinkSync(localPath);
    } catch (e) {
      // Local file removal handled
    }
  }

  // 2. Delete from Supabase Storage bucket
  try {
    await supabase.storage.from(BUCKET_NAME).remove([sanitized]);
  } catch (err) {
    console.warn(`[StorageService] Error removing "${sanitized}" from Supabase Storage:`, err.message);
  }

  // Clean cache
  filePermissionsCache.delete(sanitized);
}

/**
 * Checks authorization for a requested file.
 * Returns { authorized: boolean, isPrivate: boolean, localPath: string, filename: string }
 */
async function verifyFileAccess(rawFilename, requestingUser) {
  const filename = path.basename(rawFilename);
  const localPath = path.join(uploadDir, filename);
  const cleanRequester = (requestingUser || '').trim().toLowerCase();

  // 1. Check in-memory cache
  if (filePermissionsCache.has(filename)) {
    const perm = filePermissionsCache.get(filename);
    if (!perm.isPrivate) {
      return { authorized: true, isPrivate: false, localPath, filename };
    }

    const isAuthorized =
      cleanRequester &&
      (cleanRequester === perm.sender || cleanRequester === perm.target);

    return { authorized: !!isAuthorized, isPrivate: true, localPath, filename };
  }

  // 2. If not in memory (e.g. server restart on Render), query Supabase database
  try {
    const { data: matchedRows } = await supabase
      .from('messages')
      .select('sender, target, type, message')
      .ilike('message', `%${filename}%`)
      .limit(1);

    if (matchedRows && matchedRows.length > 0) {
      const row = matchedRows[0];
      const isPrivate = row.type === 'private';
      const sender = (row.sender || '').toLowerCase();
      const target = (row.target || '').toLowerCase();

      // Cache for future requests
      filePermissionsCache.set(filename, { sender, target, isPrivate });

      if (!isPrivate) {
        return { authorized: true, isPrivate: false, localPath, filename };
      }

      const isAuthorized =
        cleanRequester &&
        (cleanRequester === sender || cleanRequester === target);

      return { authorized: !!isAuthorized, isPrivate: true, localPath, filename };
    }
  } catch (dbErr) {
    console.warn('[StorageService] Error querying file permissions from database:', dbErr.message);
  }

  // If not identified as private in database or memory, assume public/avatar attachment
  return { authorized: true, isPrivate: false, localPath, filename };
}

/**
 * Gets a downloadable URL or readable stream for a file (from local disk or Supabase Storage)
 */
async function getFileDelivery(filename, isPrivate) {
  const sanitized = path.basename(filename);
  const localPath = path.join(uploadDir, sanitized);

  // If local file exists, serve it directly
  if (fs.existsSync(localPath)) {
    return { type: 'local', path: localPath };
  }

  // Otherwise, serve from Supabase Storage
  try {
    if (isPrivate) {
      // Generate temporary signed URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(sanitized, 3600);

      if (!error && data?.signedUrl) {
        return { type: 'redirect', url: data.signedUrl };
      }
    } else {
      // Public URL for group messages / avatars
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(sanitized);

      if (data?.publicUrl) {
        return { type: 'redirect', url: data.publicUrl };
      }
    }

    // Direct download stream as fallback
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(sanitized);

    if (!downloadError && downloadData) {
      const buffer = Buffer.from(await downloadData.arrayBuffer());
      return { type: 'buffer', buffer, mimeType: downloadData.type };
    }
  } catch (err) {
    console.warn(`[StorageService] Exception delivering file "${sanitized}" from Supabase Storage:`, err.message);
  }

  return { type: 'notFound' };
}

module.exports = {
  BUCKET_NAME,
  uploadDir,
  recordFilePermission,
  uploadToSupabaseStorage,
  deleteFromStorage,
  verifyFileAccess,
  getFileDelivery,
};

