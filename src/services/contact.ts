import type { ContactInquiry } from '../types/cms'
import { getSupabase, supabaseConfigured } from '../lib/supabase/client'
import { getMigratedStorageItem } from '../lib/storage/migrateKey'

const LOCAL_CONTACT_KEY = 'zion-contact-inquiries'
const LEGACY_CONTACT_KEY = 'dayo-contact-inquiries'

function saveLocal(inquiry: ContactInquiry) {
  const existing: ContactInquiry[] = JSON.parse(
    getMigratedStorageItem(LOCAL_CONTACT_KEY, LEGACY_CONTACT_KEY) ?? '[]',
  )
  const row = { ...inquiry, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'new' as const }
  localStorage.setItem(LOCAL_CONTACT_KEY, JSON.stringify([row, ...existing]))
  return row
}

export async function submitContactInquiry(
  inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>,
): Promise<{ ok: true; store: 'supabase' | 'local' }> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { error } = await sb.from('contact_inquiries').insert({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? null,
      topic: inquiry.topic,
      message: inquiry.message,
    })
    if (!error) return { ok: true, store: 'supabase' }
  }
  saveLocal(inquiry)
  return { ok: true, store: 'local' }
}

export function readLocalContactInquiries(): ContactInquiry[] {
  try {
    return JSON.parse(getMigratedStorageItem(LOCAL_CONTACT_KEY, LEGACY_CONTACT_KEY) ?? '[]')
  } catch {
    return []
  }
}