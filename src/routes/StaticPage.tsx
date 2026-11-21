import type { ReactNode } from 'react'
import { SectionShell } from '../components/tempo/SectionShell'

type Props = { title: string; children: ReactNode }

export function StaticPage({ title, children }: Props) {
  return (
    <SectionShell surface="cream" className="min-h-[50vh] pt-28">
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="prose prose-sm mt-8 max-w-2xl text-cream-muted">{children}</div>
    </SectionShell>
  )
}