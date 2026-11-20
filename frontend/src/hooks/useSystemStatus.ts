import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchSystemStatus, toApiError, type ApiError } from '@/services/api'
import type { SystemStatus } from '@/types/api'

interface UseSystemStatusResult {
  status: SystemStatus | null
  error: ApiError | null
  isLoading: boolean
  lastCheckedAt: Date | null
  refresh: () => void
}

/**
 * Loads `/system/status` and exposes loading/error state.
 *
 * Uses an AbortController so unmounting (or navigating away) cancels the
 * in-flight request instead of updating state on a dead component.
 */
export function useSystemStatus(): UseSystemStatusResult {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)

  // Bumped by refresh() to re-run the effect without remounting.
  const [reloadToken, setReloadToken] = useState(0)
  const controllerRef = useRef<AbortController | null>(null)

  const refresh = useCallback(() => setReloadToken((value) => value + 1), [])

  useEffect(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setIsLoading(true)
    fetchSystemStatus(controller.signal)
      .then((data) => {
        setStatus(data)
        setError(null)
        setLastCheckedAt(new Date())
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(toApiError(cause))
        setStatus(null)
        setLastCheckedAt(new Date())
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [reloadToken])

  return { status, error, isLoading, lastCheckedAt, refresh }
}
