import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'uploads';

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Uploads a file to the "uploads" Supabase Storage bucket and returns
 * { file_url } to match the shape the app already expects from
 * db.integrations.Core.UploadFile({ file }).
 */
export async function UploadFile({ file }) {
  if (!file) throw new Error('No file provided');

  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitizeFileName(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { file_url: data.publicUrl, ext };
}
