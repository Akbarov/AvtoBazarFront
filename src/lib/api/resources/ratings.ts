import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { UserRatingAdminResponse } from '@/types/api'

export const ratingsApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<UserRatingAdminResponse>> => {
    const { data } = await api.post<PageableResponse<UserRatingAdminResponse>>(endpoints.control.ratingsPageable, req)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(endpoints.control.rating(id))
  },
}
