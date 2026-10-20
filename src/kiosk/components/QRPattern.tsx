'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

/** Deterministic PRNG so a given payload always renders the same pattern. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const N = 21

function buildGrid(data: string): boolean[][] {
  const rand = mulberry32(hashString(data))
  const grid: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rand() > 0.52))
  const finders: Array<[number, number]> = [
    [0, 0],
    [N - 7, 0],
    [0, N - 7],
  ]
  for (const [fx, fy] of finders) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const ring = x === 0 || x === 6 || y === 0 || y === 6
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
        grid[fy + y][fx + x] = ring || core
      }
    }
  }
  // keep the area right of the bottom-left finder & below the top-right finder readable
  return grid
}

/**
 * Renders a deterministic QR-style pattern for a payload.
 * In the desktop build this is swapped for the payment gateway's real QR
 * bitmap — the component contract stays the same.
 */
export function QRPattern({ data, className, label = 'QR code' }: { data: string; className?: string; label?: string }) {
  const titleId = useId()
  const grid = buildGrid(data)
  return (
    <div className={cn('kb-card-flat inline-block bg-white p-3', className)}>
      <svg
        viewBox={`0 0 ${N} ${N}`}
        shapeRendering="crispEdges"
        className="block size-full"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>{label}</title>
        <rect width={N} height={N} fill="#fff" />
        {grid.map((row, y) =>
          row.map((on, x) =>
            on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#000" /> : null,
          ),
        )}
      </svg>
    </div>
  )
}
