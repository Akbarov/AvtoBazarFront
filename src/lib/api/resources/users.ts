import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { Role, RoleUpdateRequest, UserRoleResponse } from '@/types/api'

export const usersApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<UserRoleResponse>> => {
    const { data } = await api.post<PageableResponse<UserRoleResponse>>(endpoints.control.usersPageable, req)
    return data
  },
  grantRole: async (userId: string, role: Role): Promise<UserRoleResponse> => {
    const body: RoleUpdateRequest = { userId, role }
    const { data } = await api.post<UserRoleResponse>(endpoints.control.grantRole, body)
    return data
  },
  revokeRole: async (userId: string, role: Role): Promise<UserRoleResponse> => {
    const body: RoleUpdateRequest = { userId, role }
    const { data } = await api.post<UserRoleResponse>(endpoints.control.revokeRole, body)
    return data
  },
}
