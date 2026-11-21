import type { ShippingQuote } from '../../types/order'

const REGION_ZONES: Record<string, number> = {
  NCR: 0,
  CALABARZON: 1,
  Central: 1,
  Luzon: 2,
  Visayas: 3,
  Mindanao: 4,
}

function zoneForProvince(province: string): number {
  const p = province.trim().toLowerCase()
  if (p.includes('metro manila') || p === 'ncr') return REGION_ZONES.NCR
  if (
    p.includes('cavite') ||
    p.includes('laguna') ||
    p.includes('batangas') ||
    p.includes('rizal') ||
    p.includes('quezon')
  )
    return REGION_ZONES.CALABARZON
  if (p.includes('cebu') || p.includes('iloilo') || p.includes('bohol')) return REGION_ZONES.Visayas
  if (p.includes('davao') || p.includes('bukidnon') || p.includes('misamis')) return REGION_ZONES.Mindanao
  if (
    p.includes('pampanga') ||
    p.includes('bulacan') ||
    p.includes('pangasinan') ||
    p.includes('nueva ecija')
  )
    return REGION_ZONES.Central
  return REGION_ZONES.Luzon
}

/** Mock J&T quote — replace with carrier API when credentials are available. */
export function quoteJtShipping(params: {
  province: string
  totalWeightGrams: number
  itemCount: number
}): ShippingQuote[] {
  const zone = zoneForProvince(params.province)
  const weightKg = Math.max(0.5, params.totalWeightGrams / 1000)
  const weightFactor = Math.ceil(weightKg) * 45
  const zoneBase = [95, 120, 145, 175, 210][zone] ?? 145
  const standard = zoneBase + weightFactor + params.itemCount * 12
  const economy = Math.round(standard * 0.82)

  return [
    {
      carrier: 'J&T Express',
      service: 'Standard',
      etaDays: zone <= 1 ? '2–4' : zone <= 2 ? '3–5' : '4–7',
      feePhp: standard,
    },
    {
      carrier: 'J&T Express',
      service: 'Economy',
      etaDays: zone <= 1 ? '4–6' : '5–9',
      feePhp: economy,
    },
  ]
}