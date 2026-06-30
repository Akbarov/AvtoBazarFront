import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type { SoatoRequest, SoatoResponse } from '@/types/api'

export const soatoApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<SoatoResponse>> => {
    const { data } = await api.post<PageableResponse<SoatoResponse>>(endpoints.control.soatoPageable, req)
    return data
  },
  create: async (body: SoatoRequest): Promise<SoatoResponse> => {
    const { data } = await api.post<SoatoResponse>(endpoints.control.soato, body)
    return data
  },
  update: async (id: string, body: SoatoRequest): Promise<SoatoResponse> => {
    const { data } = await api.put<SoatoResponse>(endpoints.control.soatoById(id), body)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(endpoints.control.soatoById(id))
  },
  // Public get-by-id, used to resolve a vehicle's location name from its soatoId.
  getById: async (id: string): Promise<SoatoResponse> => {
    const { data } = await api.get<SoatoResponse>(endpoints.public.soatoById(id))
    return data
  },
  // multipart upload; backend returns void (HTTP 200, empty body) — no import summary.
  upload: async (file: File): Promise<void> => {
    const form = new FormData()
    form.append('file', file)
    await api.post(endpoints.control.soatoUpload, form)
  },
}
