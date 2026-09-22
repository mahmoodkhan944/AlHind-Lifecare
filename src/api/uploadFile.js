import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'uploads';

// Images larger than this (in either dimension) get scaled down — this is
// generous enough for any hero/cover image the site actually displays full-
// width, while cutting huge camera-resolution uploads (4000px+) down to a
// sane size before they ever hit storage or a visitor's browser.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const WEBP_QUALITY = 0.82;

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Resizes (if needed) and re-encodes an image file in the browser before
 * upload, using the canvas API — no server round-trip, no extra dependency.
 *
 * - PNGs are re-encoded as PNG (keeps transparency), everything else that's
 *   compressible goes to JPEG for the best size reduction on photos.
 * - GIFs and SVGs are left untouched (resizing would break animation /
 *   doesn't apply to vectors).
 * - If anything goes wrong, resolves with the original file — a failed
 *   compression attempt should never block an upload.
 */
export function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type?.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => URL.revokeObjectURL(objectUrl);
    const fallback = () => {
      cleanup();
      resolve(file);
    };

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width <= 0 || height <= 0) {
          fallback();
          return;
        }

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height / width) * MAX_DIMENSION);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width / height) * MAX_DIMENSION);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          fallback();
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png';
        const outputType = isPng ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
        const quality = outputType === 'image/webp' ? WEBP_QUALITY : JPEG_QUALITY;

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob || blob.size >= file.size) {
              // Compression didn't actually help (e.g. already tiny/optimized) — keep the original.
              resolve(file);
              return;
            }
            const newExt = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.replace(/\.[^.]+$/, '');
            resolve(new File([blob], `${baseName}.${newExt}`, { type: outputType }));
          },
          outputType,
          isPng ? undefined : quality
        );
      } catch {
        fallback();
      }
    };
    img.onerror = fallback;
    img.src = objectUrl;
  });
}

/**
 * Uploads a file to the "uploads" Supabase Storage bucket and returns
 * { file_url } to match the shape the app already expects from
 * db.integrations.Core.UploadFile({ file }). Images are compressed
 * client-side first (see compressImage above) — every upload in the app
 * goes through this one function, so this applies everywhere automatically.
 */
export async function UploadFile({ file }) {
  if (!file) throw new Error('No file provided');

  const uploadFile = await compressImage(file);

  const ext = uploadFile.name.includes('.') ? uploadFile.name.split('.').pop() : '';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizeFileName(uploadFile.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
    cacheControl: '3600',
    upsert: false,
    contentType: uploadFile.type || undefined,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { file_url: data.publicUrl, ext };
}

/**
 * Deletes a file from the "uploads" bucket given its public URL (as stored
 * in a record's photo_url / cover_image_url / etc. field) — used when an
 * admin replaces an image or deletes a record, so the old file doesn't sit
 * around in storage forever. Silently does nothing for a URL that isn't
 * actually from this bucket (e.g. an external image link), and never
 * throws — a failed cleanup shouldn't block whatever the admin was doing.
 */
export async function deleteFileByUrl(url) {
  if (!url || typeof url !== 'string') return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // not one of our own uploads — nothing to clean up
  const path = decodeURIComponent(url.slice(idx + marker.length));
  if (!path) return;
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Best-effort cleanup — ignore failures.
  }
}