import type { ColorMode, DocMeta, PaperSize, PriceBreakdown } from './types'

export const COPIES_MIN = 1
export const COPIES_MAX = 10

/** Price per page in pesos. */
export const RATES: Record<PaperSize, Record<ColorMode, number>> = {
  A4: { bw: 5, color: 10 },
  Letter: { bw: 5, color: 10 },
  A3: { bw: 10, color: 15 },
}

export const PAPER_SIZES: Array<{ id: PaperSize; label: string; dims: string }> = [
  { id: 'A4', label: 'A4', dims: '210 × 297 mm' },
  { id: 'Letter', label: 'Letter', dims: '8.5 × 11 in' },
  { id: 'A3', label: 'A3', dims: '297 × 420 mm' },
]

export function perPageRate(paper: PaperSize, color: ColorMode): number {
  return RATES[paper][color]
}

export function computePrice(
  prefs: { paper: PaperSize; color: ColorMode; copies: number },
  doc: DocMeta,
): PriceBreakdown {
  const perPage = perPageRate(prefs.paper, prefs.color)
  const perCopy = perPage * doc.pages
  const subtotal = perCopy * prefs.copies
  return {
    pages: doc.pages,
    perPage,
    perCopy,
    copies: prefs.copies,
    subtotal,
    total: subtotal,
  }
}
