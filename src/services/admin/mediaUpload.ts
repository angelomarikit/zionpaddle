import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'
import { friendlyAdminError } from '../../lib/admin/messages'

const BUCKET = 'store-media'

export async function uploadStoreImage(
  file: File,
  path: string,
): Promise<{ url?: string; error?: string }> {
  if (file.size > 5_000_000) {
    return { error: 'Please choose an image smaller than 5 MB.' }
  }
  const sb = getSupabase()
  if (!sb || !supabaseConfigured) {
    const dataUrl = await readAsDataUrl(file)
    return { url: dataUrl }
  }
  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) {
    return { error: 'Your session has expired. Please sign in again.' }
  }
  const safePath = path.replace(/[^a-zA-Z0-9._/-]/g, '-').toLowerCase()
  const contentType = mimeTypeForFile(file)
  const { error } = await sb.storage.from(BUCKET).upload(safePath, file, {
    upsert: true,
    cacheControl: '3600',
    contentType,
  })
  if (error) return { error: friendlyAdminError(error.message) }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(safePath)
  return { url: data.publicUrl }
}

function mimeTypeForFile(file: File): string {
  const t = file.type?.trim().toLowerCase()
  if (t && (t.startsWith('image/') || t === 'video/mp4')) return t
  const ext = file.name.split('.').pop()?.toLowerCase()
  const byExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
  }
  return (ext && byExt[ext]) || 'image/jpeg'
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}