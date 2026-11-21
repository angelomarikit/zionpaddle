import { getSupabase, supabaseConfigured } from './client'

/** Signed URL for private bucket objects (payment proofs, draft media). */
export async function getSignedMediaUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null
  const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
  if (error || !data?.signedUrl) return null
  return data.signedUrl
}

export function publicMediaUrl(bucket: string, path: string): string | null {
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) return null
  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}