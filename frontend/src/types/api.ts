/**
 * Types shared with the FastAPI backend.
 *
 * These mirror the Pydantic schemas in backend/app/schemas/. Keeping them in
 * one file makes the API contract easy to review when a backend schema changes.
 */

export type CheckState = 'ok' | 'warning' | 'error'

export interface HealthResponse {
  status: 'ok'
  service: string
  version: string
  environment: string
  timestamp: string
}

export interface SystemCheck {
  id: string
  label: string
  status: CheckState
  detail: string
  hint: string | null
}

export interface AppInfo {
  name: string
  version: string
  environment: string
  debug: boolean
}

export interface SystemStatus {
  overall: CheckState
  app: AppInfo
  checks: SystemCheck[]
  config_warnings: string[]
}

/** Shape of every failed API response (see backend/app/core/errors.py). */
export interface ApiErrorPayload {
  code: string
  message: string
  details?: unknown
  request_id?: string | null
}

export interface ApiErrorEnvelope {
  error: ApiErrorPayload
}
