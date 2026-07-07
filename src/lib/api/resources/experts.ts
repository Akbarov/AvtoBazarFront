import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { ExpertProfileResponse, ExpertStatusReasonRequest } from '@/types/api'

export const expertsApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<ExpertProfileResponse>> => {
    const { data } = await api.post<PageableResponse<ExpertProfileResponse>>(endpoints.control.expertsPageable, req)
    return data
  },
  approve: async (userId: string): Promise<ExpertProfileResponse> => {
    const { data } = await api.post<ExpertProfileResponse>(endpoints.control.expertApprove(userId))
    return data
  },
  reject: async (userId: string, reason?: string): Promise<ExpertProfileResponse> => {
    const body: ExpertStatusReasonRequest = { reason }
    const { data } = await api.post<ExpertProfileResponse>(endpoints.control.expertReject(userId), body)
    return data
  },
  suspend: async (userId: string, reason?: string): Promise<ExpertProfileResponse> => {
    const body: ExpertStatusReasonRequest = { reason }
    const { data } = await api.post<ExpertProfileResponse>(endpoints.control.expertSuspend(userId), body)
    return data
  },
}
