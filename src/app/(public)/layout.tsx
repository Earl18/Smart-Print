import { Suspense } from 'react'
import { KioskVisitBar } from '@/components/site/KioskVisitBar'
import { PublicFooter } from '@/components/site/PublicFooter'
import { PublicHeader } from '@/components/site/PublicHeader'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={null}>
        <KioskVisitBar />
      </Suspense>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
