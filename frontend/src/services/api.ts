/**
 * Single HTTP client for the whole frontend.
 *
 * Every request goes through this axios instance so that:
 *  - the base URL is configured in one place (`VITE_API_BASE_URL`, default
 *    `/api/v1` which the Vite dev proxy forwards to FastAPI),
 *  - cookies are sent (`withCredentials`) because authentication uses
 *    HttpOnly cookies rather than tokens in localStorage,
 *  - backend errors are converted into one predictable `ApiError` type instead
 *    of leaking axios internals into components.
 */
import axios, { AxiosError } from 'axios'

import type { ApiErrorEnvelope, HealthResponse, SystemStatus } from '@/types/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

/**
 * FastAPI's interactive docs are served by the backend, not the SPA, so this is
 * an absolute URL. Override it with VITE_API_DOCS_URL when the API is not local.
 */
export const API_DOCS_URL = import.meta.env.VITE_API_DOCS_URL ?? 'http://127.0.0.1:8000/docs'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

export interface AuthUser {
  id: string
  full_name: string
  email: string
}

/** Create an account and establish its HttpOnly session cookie. */
export async function registerAccount(values: {
  fullName: string
  email: string
  password: string
}): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/signup', {
    full_name: values.fullName,
    email: values.email,
    password: values.password,
  })
  return data
}

/** Sign in and establish its HttpOnly session cookie. */
export async function loginAccount(values: { email: string; password: string }): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/login', values)
  return data
}

export async function logoutAccount(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

/** Normalised error thrown by every API helper below. */
export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId?: string | null
  readonly details?: unknown

  constructor(params: {
    message: string
    code: string
    status: number
    requestId?: string | null
    details?: unknown
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.code = params.code
    this.status = params.status
    this.requestId = params.requestId
    this.details = params.details
  }
}

/** Convert any thrown value into an ApiError with a helpful message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorEnvelope>
    const payload = axiosError.response?.data?.error

    if (payload) {
      return new ApiError({
        message: payload.message,
        code: payload.code,
        status: axiosError.response?.status ?? 0,
        requestId: payload.request_id,
        details: payload.details,
      })
    }

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError({
        message: 'The backend took too long to respond.',
        code: 'TIMEOUT',
        status: 0,
      })
    }

    // No response at all: the API is not reachable (usually not started).
    return new ApiError({
      message:
        'Cannot reach the ChauleClips API. Is the backend running on port 8000?',
      code: 'NETWORK_ERROR',
      status: 0,
    })
  }

  return new ApiError({
    message: error instanceof Error ? error.message : 'Unexpected error.',
    code: 'UNKNOWN_ERROR',
    status: 0,
  })
}

/** Cheap liveness check. */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health', { signal })
  return data
}

/** Full environment report (MongoDB, FFmpeg, storage, AI key). */
export async function fetchSystemStatus(signal?: AbortSignal): Promise<SystemStatus> {
  const { data } = await api.get<SystemStatus>('/system/status', { signal })
  return data
}
