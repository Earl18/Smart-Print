'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DataColumn<T> {
  key: string
  header: string
  /** Cell render for the desktop table. */
  render: (row: T) => ReactNode
  /** Shown in the stacked mobile card; defaults to plain text via `text`. */
  text?: (row: T) => string
  /** Hide a column on phones (e.g. secondary metadata). */
  hideOnMobile?: boolean
}

/**
 * Shared data table. Renders a real table from md upward and stacks each
 * row into a labelled card on phones — dashboards stay usable at 320px.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  cardTitle,
  cardSub,
  empty = 'Nothing here yet.',
  onRowClick,
}: {
  columns: Array<DataColumn<T>>
  rows: T[]
  rowKey: (row: T) => string
  cardTitle: (row: T) => ReactNode
  cardSub?: (row: T) => ReactNode
  empty?: string
  onRowClick?: (row: T) => void
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border-[3px] border-black bg-white p-6 text-center font-semibold text-black/60">
        {empty}
      </p>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="kb-scroll hidden overflow-x-auto rounded-2xl border-[3px] border-black bg-white shadow-[5px_5px_0_#000] md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-[3px] border-black bg-kpaper">
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-display text-xs font-bold uppercase tracking-wide">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b-2 border-black/15 last:border-b-0',
                  onRowClick && 'cursor-pointer hover:bg-klime/30',
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle font-medium">
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: stacked cards */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            <button
              type="button"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'w-full rounded-2xl border-[3px] border-black bg-white p-4 text-left shadow-[4px_4px_0_#000]',
                onRowClick && 'active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-base font-bold">{cardTitle(row)}</span>
                {cardSub ? <span className="shrink-0 text-right text-xs font-bold text-black/60">{cardSub(row)}</span> : null}
              </div>
              <dl className="mt-3 space-y-1.5">
                {columns
                  .filter((c) => !c.hideOnMobile)
                  .map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="shrink-0 font-bold text-black/55">{c.header}</dt>
                      <dd className="text-right font-semibold">{c.text ? c.text(row) : null}</dd>
                    </div>
                  ))}
              </dl>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
