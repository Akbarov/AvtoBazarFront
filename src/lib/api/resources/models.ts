import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { VehicleModelRequest, VehicleModelResponse } from '@/types/api'

export const modelsApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<VehicleModelResponse>> => {
    const { data } = await api.post<PageableResponse<VehicleModelResponse>>(endpoints.control.modelsPageable, req)
    return data
  },
  create: async (body: VehicleModelRequest): Promise<VehicleModelResponse> => {
    const { data } = await api.post<VehicleModelResponse>(endpoints.control.models, body)
    return data
  },
  update: async (id: string, body: VehicleModelRequest): Promise<VehicleModelResponse> => {
    const { data } = await api.put<VehicleModelResponse>(endpoints.control.model(id), body)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(endpoints.control.model(id))
  },
}
