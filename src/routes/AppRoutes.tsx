import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { FullScreenLoader } from '@/components/common/FullScreenLoader'
import { LoginPage } from '@/features/auth/LoginPage'
import { AdminDeniedGate } from '@/features/auth/AdminDeniedGate'

// Feature routes are code-split so the initial bundle stays small.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const VehiclesListPage = lazy(() => import('@/features/vehicles/VehiclesListPage').then((m) => ({ default: m.VehiclesListPage })))
const VehicleDetailPage = lazy(() => import('@/features/vehicles/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })))
const BrandsPage = lazy(() => import('@/features/brands/BrandsPage').then((m) => ({ default: m.BrandsPage })))
const ModelsPage = lazy(() => import('@/features/models/ModelsPage').then((m) => ({ default: m.ModelsPage })))
const SoatoListPage = lazy(() => import('@/features/soato/SoatoListPage').then((m) => ({ default: m.SoatoListPage })))
const SoatoImportPage = lazy(() => import('@/features/soato/SoatoImportPage').then((m) => ({ default: m.SoatoImportPage })))
const UsersPage = lazy(() => import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })))
const MediaLibraryPage = lazy(() => import('@/features/media/MediaLibraryPage').then((m) => ({ default: m.MediaLibraryPage })))

// Suspense boundary inside the shell so lazy pages show the loader without unmounting the chrome.
function SuspendedOutlet() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Outlet />
    </Suspense>
  )
}

export function AppRoutes() {
  const { status } = useAuth()

  if (status === 'loading' || status === 'checking') return <FullScreenLoader />
  if (status === 'anonymous') return <LoginPage />
  if (status === 'denied') return <AdminDeniedGate />

  // status === 'admin'
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<SuspendedOutlet />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/soato" element={<SoatoListPage />} />
          <Route path="/soato/import" element={<SoatoImportPage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
