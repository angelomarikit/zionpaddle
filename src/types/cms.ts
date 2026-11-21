export type ContactInquiry = {
  id?: string
  name: string
  email: string
  phone?: string
  topic: string
  message: string
  createdAt?: string
  status?: 'new' | 'read' | 'replied'
}

import type { StaffPermissions } from './staff'

export type StaffProfile = {
  user_id: string
  email: string
  role: 'admin' | 'staff'
  display_name?: string
  permissions?: StaffPermissions
  created_at?: string
}