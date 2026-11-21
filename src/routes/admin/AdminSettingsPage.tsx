import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { inviteStaffMember, listStaffProfiles, updateStaffProfile } from '../../services/admin/staffAdmin'
import { friendlyAdminError, STORE_OFFLINE_HINT } from '../../lib/admin/messages'
import { ALL_PERMISSION_KEYS, permissionsForRole } from '../../lib/staff/permissions'
import { useStaffPermissions } from '../../hooks/useStaffPermissions'
import { StaffPermissionsEditor } from '../../components/admin/StaffPermissionsEditor'
import { STAFF_PERMISSION_GROUPS, type StaffPermissionKey, type StaffPermissions } from '../../types/staff'
import type { StaffProfile } from '../../types/cms'
import { AdminCard, AdminPage, adminField, adminLabel } from '../../components/admin/AdminShell'
import { supabaseConfigured } from '../../lib/supabase/client'

export function AdminSettingsPage() {
  const { canManageStaff, permissions, profile, isAdmin } = useStaffPermissions()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: listStaffProfiles,
    enabled: canManageStaff && supabaseConfigured,
  })

  if (!canManageStaff) {
    return (
      <AdminPage title="Settings">
        <AdminCard className="p-6">
          <h2 className="font-semibold">Your access</h2>
          <p className="mt-2 text-sm text-admin-muted">
            Signed in as <strong>{profile?.email}</strong> ({profile?.role === 'admin' ? 'Account owner' : 'Staff'}).
          </p>
          <AccessSummary permissions={permissions} isAdmin={isAdmin} />
        </AdminCard>
      </AdminPage>
    )
  }

  return (
    <AdminPage title="Settings">
      {!supabaseConfigured ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {STORE_OFFLINE_HINT}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminCard className="p-5">
          <h2 className="font-semibold">Staff</h2>
          <p className="mt-1 text-sm text-admin-muted">
            Add teammates and choose what each person can do in the admin.
          </p>
          {isLoading ? <p className="mt-4 text-sm text-admin-muted">Loading team…</p> : null}
          {error ? <p className="mt-4 text-sm text-[#d72c0d]">{friendlyAdminError(String(error))}</p> : null}
          {data?.error ? <p className="mt-4 text-sm text-[#d72c0d]">{friendlyAdminError(data.error)}</p> : null}

          <ul className="mt-4 divide-y divide-platinum-200">
            {(data?.staff ?? []).map((member) => (
              <StaffRow
                key={member.user_id}
                member={member}
                isSelf={member.user_id === profile?.user_id}
                onSaved={() => void queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })}
              />
            ))}
          </ul>
        </AdminCard>

        <AddStaffCard
          onAdded={() => {
            void queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
          }}
        />
      </div>
    </AdminPage>
  )
}

function StaffRow({
  member,
  isSelf,
  onSaved,
}: {
  member: StaffProfile
  isSelf: boolean
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(member.role)
  const [perms, setPerms] = useState<StaffPermissions>(permissionsForRole(member.role, member.permissions))
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    const resolved = role === 'admin' ? permissionsForRole('admin') : permissionsForRole('staff', perms)
    const result = await updateStaffProfile(member.user_id, { role, permissions: resolved })
    setBusy(false)
    if (result.error) {
      window.alert(friendlyAdminError(result.error))
      return
    }
    setOpen(false)
    onSaved()
  }

  return (
    <li className="py-4">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="font-medium text-admin-ink">
            {member.display_name || member.email}
            {isSelf ? <span className="ml-2 text-xs font-normal text-admin-muted">(you)</span> : null}
          </p>
          <p className="text-sm text-admin-muted">{member.email}</p>
        </div>
        <span className="rounded-full bg-gold-400/35 px-2.5 py-0.5 text-xs font-medium text-admin-ink">
          {member.role === 'admin' ? 'Owner' : 'Staff'}
        </span>
      </button>
      {open ? (
        <div className="mt-4 rounded-lg border border-admin-border bg-admin-subtle p-4">
          <label className="block text-sm">
            <span className={adminLabel}>Access level</span>
            <select
              className={adminField}
              value={role}
              disabled={isSelf}
              onChange={(e) => {
                const next = e.target.value as 'admin' | 'staff'
                setRole(next)
                setPerms(permissionsForRole(next, next === 'staff' ? perms : undefined))
              }}
            >
              <option value="staff">Staff — custom restrictions</option>
              <option value="admin">Account owner — full access</option>
            </select>
          </label>
          {role === 'staff' ? (
            <div className="mt-4">
              <StaffPermissionsEditor value={perms} onChange={setPerms} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-admin-muted">Owners can access every area, including staff settings.</p>
          )}
          <button
            type="button"
            disabled={busy || isSelf}
            onClick={() => void save()}
            className="mt-4 rounded-lg bg-admin-gold px-4 py-2 text-sm font-semibold text-white hover:bg-admin-gold-dark disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save permissions'}
          </button>
          {isSelf ? (
            <p className="mt-2 text-xs text-admin-muted">You cannot change your own owner/staff role here.</p>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

function AddStaffCard({ onAdded }: { onAdded: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')
  const [perms, setPerms] = useState<StaffPermissions>(permissionsForRole('staff'))
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!email.trim() || password.length < 8) {
      window.alert('Enter an email and a password with at least 8 characters.')
      return
    }
    setBusy(true)
    const result = await inviteStaffMember({
      email: email.trim(),
      password,
      role,
      displayName: displayName.trim(),
      permissions: role === 'staff' ? perms : undefined,
    })
    setBusy(false)
    if (result.error) {
      window.alert(friendlyAdminError(result.error))
      return
    }
    setEmail('')
    setPassword('')
    setDisplayName('')
    onAdded()
    window.alert('Staff account created. They can sign in with the email and password you set.')
  }

  return (
    <AdminCard className="p-5 h-fit">
      <h2 className="font-semibold">Add staff</h2>
      <p className="mt-1 text-sm text-admin-muted">
        Creates a sign-in for your teammate. Turn off email confirmation in Supabase Auth for instant access, or they
        confirm via email first.
      </p>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className={adminLabel}>Name (optional)</span>
          <input className={adminField} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="block">
          <span className={adminLabel}>Email</span>
          <input
            type="email"
            className={adminField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className={adminLabel}>Temporary password</span>
          <input
            type="password"
            className={adminField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className={adminLabel}>Access level</span>
          <select
            className={adminField}
            value={role}
            onChange={(e) => {
              const next = e.target.value as 'admin' | 'staff'
              setRole(next)
              if (next === 'staff') setPerms(permissionsForRole('staff'))
            }}
          >
            <option value="staff">Staff</option>
            <option value="admin">Account owner</option>
          </select>
        </label>
      </div>
      {role === 'staff' ? (
        <div className="mt-4 max-h-[340px] overflow-y-auto">
          <StaffPermissionsEditor value={perms} onChange={setPerms} />
        </div>
      ) : null}
      <button
        type="button"
        disabled={busy || !supabaseConfigured}
        onClick={() => void submit()}
        className="mt-4 w-full rounded-lg bg-admin-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-admin-gold-dark disabled:opacity-50"
      >
        {busy ? 'Creating…' : 'Create staff account'}
      </button>
    </AdminCard>
  )
}

function AccessSummary({ permissions, isAdmin }: { permissions: StaffPermissions; isAdmin: boolean }) {
  if (isAdmin) {
    return <p className="mt-3 text-sm text-admin-muted">You have full access to all admin areas.</p>
  }
  const labels = new Map<string, string>()
  for (const g of STAFF_PERMISSION_GROUPS) {
    for (const item of g.items) labels.set(item.key, item.label)
  }

  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {ALL_PERMISSION_KEYS.map((key: StaffPermissionKey) => (
        <li
          key={key}
          className={`rounded-lg border px-3 py-2 text-sm ${
            permissions[key] ? 'border-admin-border text-admin-ink' : 'border-platinum-200 text-admin-chrome line-through'
          }`}
        >
          {labels.get(key) ?? key}
        </li>
      ))}
    </ul>
  )
}