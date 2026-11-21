export const STAFF_PERMISSION_GROUPS = [
  {
    id: 'store',
    label: 'Store',
    items: [
      { key: 'dashboard:view', label: 'View dashboard' },
      { key: 'orders:view', label: 'View orders' },
      { key: 'orders:payment', label: 'Verify & reject payments' },
      { key: 'orders:fulfill', label: 'Fulfill & unfulfill orders' },
      { key: 'orders:cancel', label: 'Cancel orders' },
      { key: 'orders:risk', label: 'Tag high-risk orders' },
      { key: 'products:edit', label: 'Edit products' },
      { key: 'collections:edit', label: 'Edit collections' },
      { key: 'inbox:view', label: 'View inbox' },
    ] as const,
  },
  {
    id: 'website',
    label: 'Website',
    items: [{ key: 'content:edit', label: 'Edit website content' }] as const,
  },
  {
    id: 'team',
    label: 'Team',
    items: [{ key: 'settings:manage_staff', label: 'Manage staff & permissions' }] as const,
  },
] as const

export type StaffPermissionKey = (typeof STAFF_PERMISSION_GROUPS)[number]['items'][number]['key']

export type StaffPermissions = Partial<Record<StaffPermissionKey, boolean>>