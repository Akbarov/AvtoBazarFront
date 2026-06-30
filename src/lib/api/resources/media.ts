import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { VehicleFilesResponse } from '@/types/api'

export const mediaApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<VehicleFilesResponse>> => {
    const { data } = await api.post<PageableResponse<VehicleFilesResponse>>(endpoints.control.mediaPageable, req)
    return data
  },
  remove: async (fileId: string): Promise<void> => {
    await api.delete(endpoints.control.mediaDelete(fileId))
  },
}
