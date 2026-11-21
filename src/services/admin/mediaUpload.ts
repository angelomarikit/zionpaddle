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
  const safePath = path.replace(/[^a-zA-Z0-9._/-]/g, '-')
  const { error } = await sb.storage.from(BUCKET).upload(safePath, file, { upsert: true, cacheControl: '3600' })
  if (error) return { error: friendlyAdminError(error.message) }
  const { data } = sb.storage.from(BUCKET).getPublicUrl(safePath)
  return { url: data.publicUrl }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}