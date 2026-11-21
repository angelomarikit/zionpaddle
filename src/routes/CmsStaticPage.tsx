import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSitePageBySlug } from '../services/cms/siteContent'
import type { SitePageSlug } from '../types/siteCms'
import { SectionShell } from '../components/tempo/SectionShell'
import { NotFoundPage } from './NotFoundPage'

const validSlugs = new Set<SitePageSlug>(['about', 'faq', 'legal'])

export function CmsStaticPage() {
  const { pathname } = useLocation()
  const pageSlug = pathname.replace(/^\//, '') as SitePageSlug

  const { data: page, isLoading } = useQuery({
    queryKey: ['cms', 'page', pageSlug],
    enabled: Boolean(pageSlug && validSlugs.has(pageSlug)),
    queryFn: () => fetchSitePageBySlug(pageSlug!),
  })

  if (!pageSlug || !validSlugs.has(pageSlug)) return <NotFoundPage />
  if (isLoading) {
    return (
      <SectionShell surface="cream" className="min-h-[50vh] pt-28">
        <p className="text-cream-muted">Loading…</p>
      </SectionShell>
    )
  }
  if (!page) return <NotFoundPage />

  return (
    <SectionShell surface="cream" className="min-h-[50vh] pt-28">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      <div className="prose prose-sm mt-8 max-w-2xl whitespace-pre-wrap text-cream-muted">{page.body}</div>
    </SectionShell>
  )
}