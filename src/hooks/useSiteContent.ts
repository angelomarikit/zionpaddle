import { useQuery } from '@tanstack/react-query'
import { fetchSitePages, fetchSiteSections, sectionToSiteMedia } from '../services/cms/siteContent'

export function useSiteContent() {
  const sectionsQuery = useQuery({
    queryKey: ['cms', 'sections'],
    queryFn: fetchSiteSections,
    staleTime: 30_000,
  })

  const pagesQuery = useQuery({
    queryKey: ['cms', 'pages'],
    queryFn: fetchSitePages,
    staleTime: 30_000,
  })

  const sections = sectionsQuery.data?.sections ?? []
  const pages = pagesQuery.data?.pages ?? []
  const siteMedia = sectionToSiteMedia(sections)
  const editorial = sections.find((s) => s.sectionKey === 'editorial')
  const announcement = sections.find((s) => s.sectionKey === 'announcement')
  const heroSection = sections.find((s) => s.sectionKey === 'hero')

  return {
    sections,
    pages,
    siteMedia,
    editorial,
    announcement,
    heroSection,
    store: sectionsQuery.data?.store ?? 'local',
    isLoading: sectionsQuery.isLoading || pagesQuery.isLoading,
  }
}