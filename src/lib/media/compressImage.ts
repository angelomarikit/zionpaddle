const MAX_EDGE_PX = 1600
const JPEG_QUALITY = 0.82
const SKIP_BELOW_BYTES = 350_000

/** Shrink large photos before Supabase upload (faster on slow links). */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }
  if (file.size <= SKIP_BELOW_BYTES && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > MAX_EDGE_PX ? MAX_EDGE_PX / longest : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY)
  })
  if (!blob || blob.size >= file.size * 0.95) return file

  const base = file.name.replace(/\.[^.]+$/, '') || 'upload'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
}