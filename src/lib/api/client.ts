import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '@/lib/auth/tokenStore'
import { endpoints } from './endpoints'
import type { AuthResponse, RefreshTokenRequest } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE ?? ''

// Current UI language -> Accept-Language. Updated by i18n on language change.
let currentLang = 'uz'
export function setApiLang(lang: string) {
  currentLang = lang
}

// Callback for "session is permanently dead" — set by AuthContext (sign out + redirect).
let onAuthFailure: (() => void) | null = null
export function setOnAuthFailure(cb: () => void) {
  onAuthFailure = cb
}

export const api = axios.create({ baseURL: BASE_URL })

// Bare client for refresh (no interceptors — avoids a 401 loop).
const bare = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  config.headers.set('Accept-Language', currentLang)
  return config
})

// --- single-flight refresh ---
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) throw new Error('no refresh token')
  const body: RefreshTokenRequest = { refreshToken }
  const { data } = await bare.post<AuthResponse>(endpoints.auth.refresh, body)
  tokenStore.updateTokens(data.accessToken, data.refreshToken)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const status = error.response?.status

    // 401 -> try a silent refresh + retry once.
    if (status === 401 && original && !original._retried && tokenStore.getRefreshToken()) {
      original._retried = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => (refreshPromise = null))
        const newToken = await refreshPromise
        original.headers.set('Authorization', `Bearer ${newToken}`)
        return api(original)
      } catch {
        tokenStore.clear()
        onAuthFailure?.()
        return Promise.reject(error)
      }
    }

    // 401 with no way to refresh -> sign out.
    if (status === 401) {
      tokenStore.clear()
      onAuthFailure?.()
    }
    return Promise.reject(error)
  },
)
