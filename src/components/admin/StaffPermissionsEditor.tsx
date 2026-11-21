import { STAFF_PERMISSION_GROUPS, type StaffPermissions } from '../../types/staff'

export function StaffPermissionsEditor({
  value,
  onChange,
  disabled,
}: {
  value: StaffPermissions
  onChange: (next: StaffPermissions) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-4">
      {STAFF_PERMISSION_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold uppercase tracking-wide text-admin-muted">{group.label}</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {group.items.map((item) => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm hover:bg-admin-subtle">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-admin-input"
                    checked={value[item.key] === true}
                    disabled={disabled}
                    onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
                  />
                  <span className="text-admin-ink">{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}