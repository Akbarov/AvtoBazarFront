// Variant C: refreshToken survives reloads (localStorage),
// accessToken is kept in-memory only and restored via a silent refresh.
// Admin identity is cached in localStorage so the topbar renders immediately after F5.
import type { AuthResponse } from '@/types/api'

const REFRESH_KEY = 'ab.refreshToken'
const IDENTITY_KEY = 'ab.identity'

export interface AdminIdentity {
  userId: string
  fullName: string
  phoneNumber: string
}

let accessToken: string | null = null

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token
  },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_KEY),

  getIdentity: (): AdminIdentity | null => {
    const raw = localStorage.getItem(IDENTITY_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as AdminIdentity
    } catch {
      return null
    }
  },

  /** Store the token pair + identity from an AuthResponse. */
  setSession: (auth: AuthResponse) => {
    accessToken = auth.accessToken
    localStorage.setItem(REFRESH_KEY, auth.refreshToken)
    const identity: AdminIdentity = {
      userId: auth.userId,
      fullName: auth.fullName,
      phoneNumber: auth.phoneNumber,
    }
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
  },

  /** Update tokens only (after a refresh). */
  updateTokens: (accessTokenValue: string, refreshToken: string) => {
    accessToken = accessTokenValue
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },

  clear: () => {
    accessToken = null
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(IDENTITY_KEY)
  },
}
