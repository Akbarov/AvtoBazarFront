import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { VehicleBrandRequest, VehicleBrandResponse } from '@/types/api'

export const brandsApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<VehicleBrandResponse>> => {
    const { data } = await api.post<PageableResponse<VehicleBrandResponse>>(endpoints.control.brandsPageable, req)
    return data
  },
  create: async (body: VehicleBrandRequest): Promise<VehicleBrandResponse> => {
    const { data } = await api.post<VehicleBrandResponse>(endpoints.control.brands, body)
    return data
  },
  update: async (id: string, body: VehicleBrandRequest): Promise<VehicleBrandResponse> => {
    const { data } = await api.put<VehicleBrandResponse>(endpoints.control.brand(id), body)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(endpoints.control.brand(id))
  },
}
