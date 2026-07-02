import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { VehicleFilesResponse, VehicleResponse } from '@/types/api'

export const vehiclesApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<VehicleResponse>> => {
    const { data } = await api.post<PageableResponse<VehicleResponse>>(endpoints.control.vehiclesPageable, req)
    return data
  },
  getById: async (id: string): Promise<VehicleResponse> => {
    const { data } = await api.get<VehicleResponse>(endpoints.public.vehicle(id))
    return data
  },
  media: async (vehicleId: string): Promise<VehicleFilesResponse[]> => {
    const { data } = await api.get<VehicleFilesResponse[]>(endpoints.public.vehicleMedia(vehicleId))
    return data
  },
  activate: async (id: string): Promise<VehicleResponse> => {
    const { data } = await api.post<VehicleResponse>(endpoints.control.vehicleActivate(id))
    return data
  },
  deactivate: async (id: string): Promise<VehicleResponse> => {
    const { data } = await api.post<VehicleResponse>(endpoints.control.vehicleDeactivate(id))
    return data
  },
  verify: async (id: string): Promise<VehicleResponse> => {
    const { data } = await api.post<VehicleResponse>(endpoints.control.vehicleVerify(id))
    return data
  },
  unverify: async (id: string): Promise<VehicleResponse> => {
    const { data } = await api.post<VehicleResponse>(endpoints.control.vehicleUnverify(id))
    return data
  },
}
