import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Route table.
 *
 * Three shells, one per audience:
 *   - PublicLayout → marketing pages (header + footer)
 *   - AuthLayout (inside each auth page) → split sign-in screens
 *   - AppShell     → product workspace (sidebar + topbar)
 *
 * Every screen is lazily imported. A visitor landing on the marketing page does
 * not download the auth forms, the settings panels or react-hook-form/zod, which
 * keeps the first paint small and fast on a laptop that is also encoding video.
 */
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const SignupPage = lazy(() =>
  import('@/pages/auth/SignupPage').then((module) => ({ default: module.SignupPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/pages/app/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ProjectsPage = lazy(() =>
  import('@/pages/app/ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
)
const ClipsPage = lazy(() =>
  import('@/pages/app/ClipsPage').then((module) => ({ default: module.ClipsPage })),
)
const QueuePage = lazy(() =>
  import('@/pages/app/QueuePage').then((module) => ({ default: module.QueuePage })),
)
const TemplatesPage = lazy(() =>
  import('@/pages/app/TemplatesPage').then((module) => ({ default: module.TemplatesPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/app/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

/** Neutral loading state used between route chunks (never a fake skeleton of data). */
function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-2.5 text-fg-subtle">
      <Spinner className="size-4" label="Loading page" />
      <span className="text-[13px]">Loading…</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ----------------------------------------------------- public ---- */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ------------------------------------------------------- auth ---- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ------------------------------------------------ application ---- */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/clips" element={<ClipsPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
