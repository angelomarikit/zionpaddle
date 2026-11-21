import { createBrowserRouter, Navigate } from 'react-router-dom'
import { StoreLayout } from './StoreLayout'
import { HomePage } from '../routes/HomePage'
import { CollectionsPage } from '../routes/CollectionsPage'
import { CollectionDetailPage } from '../routes/CollectionDetailPage'
import { ProductPage } from '../routes/ProductPage'
import { CartPage } from '../routes/CartPage'
import { NotFoundPage } from '../routes/NotFoundPage'
import { CheckoutPage } from '../routes/CheckoutPage'
import { OrderConfirmationPage } from '../routes/OrderConfirmationPage'
import { ContactPage } from '../routes/ContactPage'
import { AdminLayout } from './AdminLayout'
import { AdminGate } from '../components/admin/AdminGate'
import { AdminLoginPage } from '../routes/admin/AdminLoginPage'
import { AdminDashboardPage } from '../routes/admin/AdminDashboardPage'
import { AdminOrdersPage } from '../routes/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from '../routes/admin/AdminOrderDetailPage'
import { AdminContactPage } from '../routes/admin/AdminContactPage'
import { AdminContentPage } from '../routes/admin/AdminContentPage'
import { AdminProductsListPage } from '../routes/admin/AdminProductsListPage'
import { AdminProductEditPage } from '../routes/admin/AdminProductEditPage'
import { AdminCollectionsListPage } from '../routes/admin/AdminCollectionsListPage'
import { AdminCollectionEditPage } from '../routes/admin/AdminCollectionEditPage'
import { AdminSettingsPage } from '../routes/admin/AdminSettingsPage'
import { RequireStaffPermission } from '../components/admin/RequireStaffPermission'
import { CmsStaticPage } from '../routes/CmsStaticPage'

const adminEnabled = import.meta.env.VITE_ENABLE_ADMIN === 'true'

const adminRoutes = adminEnabled
  ? [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { path: 'login', element: <AdminLoginPage /> },
          {
            element: <AdminGate />,
            children: [
              {
                index: true,
                element: (
                  <RequireStaffPermission perm="dashboard:view">
                    <AdminDashboardPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'orders',
                element: (
                  <RequireStaffPermission perm="orders:view">
                    <AdminOrdersPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'orders/:orderId',
                element: (
                  <RequireStaffPermission perm="orders:view">
                    <AdminOrderDetailPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'contact',
                element: (
                  <RequireStaffPermission perm="inbox:view">
                    <AdminContactPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'products',
                element: (
                  <RequireStaffPermission perm="products:edit">
                    <AdminProductsListPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'products/:slug',
                element: (
                  <RequireStaffPermission perm="products:edit">
                    <AdminProductEditPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'collections',
                element: (
                  <RequireStaffPermission perm="collections:edit">
                    <AdminCollectionsListPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'collections/:slug',
                element: (
                  <RequireStaffPermission perm="collections:edit">
                    <AdminCollectionEditPage />
                  </RequireStaffPermission>
                ),
              },
              {
                path: 'content',
                element: (
                  <RequireStaffPermission perm="content:edit">
                    <AdminContentPage />
                  </RequireStaffPermission>
                ),
              },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'catalog', element: <Navigate to="/admin/products" replace /> },
              { path: 'media', element: <Navigate to="/admin/products" replace /> },
            ],
          },
        ],
      },
    ]
  : [
      {
        path: '/admin/*',
        element: <Navigate to="/" replace />,
      },
    ]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StoreLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'collections/:slug', element: <CollectionDetailPage /> },
      { path: 'products/:slug', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'orders/:orderId', element: <OrderConfirmationPage /> },
      { path: 'about', element: <CmsStaticPage /> },
      { path: 'faq', element: <CmsStaticPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'legal', element: <CmsStaticPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  ...adminRoutes,
])