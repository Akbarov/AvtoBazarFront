import { api } from '../client'
import { ADMIN_GATE_PROBE, endpoints } from '../endpoints'
import { countOnly } from '../pageable'
import type { AuthResponse, TelegramLoginLinkResponse, TelegramLoginRequest } from '@/types/api'

export const authApi = {
  telegramLink: async (): Promise<TelegramLoginLinkResponse> => {
    const { data } = await api.get<TelegramLoginLinkResponse>(endpoints.auth.telegramLink)
    return data
  },

  verifyCode: async (code: string): Promise<AuthResponse> => {
    const body: TelegramLoginRequest = { code }
    const { data } = await api.post<AuthResponse>(endpoints.auth.telegramVerify, body)
    return data
  },

  /**
   * ADMIN probe: call a genuinely guarded endpoint.
   * 200 -> ADMIN, 403 -> not admin. The response body is irrelevant.
   */
  probeAdmin: async (): Promise<boolean> => {
    try {
      await api.post(ADMIN_GATE_PROBE, countOnly())
      return true
    } catch (e) {
      const status = (e as { response?: { status?: number } }).response?.status
      if (status === 403) return false
      throw e
    }
  },
}
