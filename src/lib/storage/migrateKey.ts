/** Copy legacy localStorage value into the current key when rebranding storage prefixes. */
export function getMigratedStorageItem(nextKey: string, legacyKey: string): string | null {
  let raw = localStorage.getItem(nextKey)
  if (!raw) {
    raw = localStorage.getItem(legacyKey)
    if (raw) localStorage.setItem(nextKey, raw)
  }
  return raw
}