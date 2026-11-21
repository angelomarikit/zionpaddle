import type { ContactInquiry } from '../../types/cms'
import { readLocalContactInquiries } from '../contact'
import { getSupabase, supabaseConfigured } from '../../lib/supabase/client'

export async function fetchStaffContactInquiries(): Promise<{
  items: ContactInquiry[]
  store: 'supabase' | 'local'
}> {
  const sb = getSupabase()
  if (sb && supabaseConfigured) {
    const { data, error } = await sb
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (!error && data) {
      const items: ContactInquiry[] = data.map((row: Record<string, string>) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone ?? undefined,
        topic: row.topic,
        message: row.message,
        createdAt: row.created_at,
        status: row.status as ContactInquiry['status'],
      }))
      return { items, store: 'supabase' }
    }
  }
  return { items: readLocalContactInquiries(), store: 'local' }
}