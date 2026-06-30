import { AxiosError } from 'axios'
import { toCamelCase } from '@/lib/utils'
import type { ErrorResponse } from '@/types/api'

export interface ParsedApiError {
  /** Text for the toast. */
  message: string
  /** Domain code (StatusEnum, e.g. '100022') or null. */
  code: string | null
  /** Field errors: field name (camelCase) -> message. */
  fieldErrors: Record<string, string>
  httpStatus?: number
}

/**
 * Parses the backend error payload (ErrorResponse).
 * - validations[] is present ONLY on 400 (bean-validation); the snake_case key is under field 'key'.
 * - domain 422 errors carry status.code + a top-level message, without validations.
 */
export function parseApiError(error: unknown, fallback = 'Something went wrong'): ParsedApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined
    const fieldErrors: Record<string, string> = {}
    if (data?.validations) {
      for (const v of data.validations) {
        fieldErrors[toCamelCase(v.key)] = v.message
      }
    }
    return {
      message: data?.status?.message || data?.message || fallback,
      code: data?.status?.code ?? null,
      fieldErrors,
      httpStatus: error.response?.status,
    }
  }
  return { message: fallback, code: null, fieldErrors: {} }
}
