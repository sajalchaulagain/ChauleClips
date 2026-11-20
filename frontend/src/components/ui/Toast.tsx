import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/utils/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  /** Show a transient notification. Returns nothing: auto-dismisses. */
  notify: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLES: Record<ToastTone, { ring: string; icon: typeof Info; iconClass: string }> = {
  success: { ring: 'border-success/30', icon: CheckCircle2, iconClass: 'text-success' },
  error: { ring: 'border-danger/30', icon: CircleAlert, iconClass: 'text-danger' },
  info: { ring: 'border-line', icon: Info, iconClass: 'text-info' },
}

/**
 * Minimal toast system (no dependency).
 *
 * Live region is polite so screen readers announce messages without hijacking
 * focus from whatever the user is doing.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const style = TONE_STYLES[toast.tone]
  const Icon = style.icon

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4200)
    return () => window.clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={cn(
        'animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-2.5',
        'rounded-control border bg-raised px-3.5 py-2.5 shadow-pop',
        style.ring,
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', style.iconClass)} aria-hidden="true" />
      <p className="flex-1 text-[13px] leading-relaxed text-fg">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

/** Access the toast API. Throws if used outside the provider (a real bug). */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>')
  }
  return context
}
