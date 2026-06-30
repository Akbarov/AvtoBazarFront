import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api/resources/auth'
import { setOnAuthFailure } from '@/lib/api/client'
import { tokenStore, type AdminIdentity } from './tokenStore'

export type AuthStatus =
  | 'loading' // restoring the session on startup
  | 'anonymous' // not signed in
  | 'checking' // have a token, running the ADMIN probe
  | 'admin' // full access
  | 'denied' // signed in but not ADMIN

interface AuthContextValue {
  status: AuthStatus
  identity: AdminIdentity | null
  /** After a successful verify: store the session and run the ADMIN gate. */
  completeLogin: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [identity, setIdentity] = useState<AdminIdentity | null>(tokenStore.getIdentity())

  const signOut = useCallback(() => {
    tokenStore.clear()
    setIdentity(null)
    setStatus('anonymous')
  }, [])

  const runAdminGate = useCallback(async () => {
    setStatus('checking')
    try {
      const isAdmin = await authApi.probeAdmin()
      setStatus(isAdmin ? 'admin' : 'denied')
    } catch {
      // network/other — treat as non-admin (safer) without signing out
      setStatus('denied')
    }
  }, [])

  const completeLogin = useCallback(async () => {
    setIdentity(tokenStore.getIdentity())
    await runAdminGate()
  }, [runAdminGate])

  // Sign out when the refresh ultimately fails (wired into the HTTP client).
  useEffect(() => {
    setOnAuthFailure(() => {
      tokenStore.clear()
      setIdentity(null)
      setStatus('anonymous')
    })
  }, [])

  // Restore the session on startup: a refresh token exists -> run the ADMIN probe (interceptor fetches access).
  useEffect(() => {
    if (tokenStore.getRefreshToken()) {
      void runAdminGate()
    } else {
      setStatus('anonymous')
    }
  }, [runAdminGate])

  const value = useMemo<AuthContextValue>(
    () => ({ status, identity, completeLogin, signOut }),
    [status, identity, completeLogin, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
