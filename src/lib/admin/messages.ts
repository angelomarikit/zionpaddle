export function friendlyAdminError(message?: string): string {
  if (!message) return 'Something went wrong. Please try again.'
  const lower = message.toLowerCase()
  if (lower.includes('jwt') || lower.includes('session')) return 'Your session has expired. Please sign in again.'
  if (lower.includes('row-level') || lower.includes('permission')) return 'You do not have access to perform this action.'
  if (lower.includes('duplicate') || lower.includes('unique')) return 'This URL name is already in use. Choose a different one.'
  if (lower.includes('payload') || lower.includes('too large')) return 'The file is too large. Please use an image under 5 MB.'
  if (lower.includes('mime') || lower.includes('content type') || lower.includes('invalidrequest'))
    return 'This file type is not allowed. Use JPEG, PNG, WebP, or GIF under 5 MB.'
  if (lower.includes('bucket') && lower.includes('not found'))
    return 'Store media storage is not set up. Run migration 011_store_media_storage.sql in Supabase.'
  if (lower.includes('row-level') || lower.includes('security policy') || lower.includes('not authorized'))
    return 'Upload blocked: your account needs an admin or staff profile in Supabase. Run migrations 011 and 017, then sign in again.'
  return 'We could not complete that action. Please try again in a moment.'
}

export const STORE_OFFLINE_HINT =
  'Your live store database is not linked yet. Changes on this screen are kept on this device until your store is fully connected.'

export const STORE_ONLINE_HINT = 'Changes are saved to your store and appear on the website after you publish.'