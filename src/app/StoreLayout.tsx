import { type CSSProperties } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { CartDrawer } from '../components/layout/CartDrawer'
import { AnnouncementBar } from '../components/layout/AnnouncementBar'
import { useSiteContent } from '../hooks/useSiteContent'

export function StoreLayout() {
  const { announcement } = useSiteContent()
  const showAnnouncement = Boolean(announcement?.published && announcement.headline?.trim())
  const chromeStyle = {
    '--dayo-announcement-h': showAnnouncement ? '2rem' : '0px',
  } as CSSProperties

  return (
    <div className="min-h-screen" style={chromeStyle}>
      <div className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBar section={announcement} />
        <SiteHeader />
      </div>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  )
}