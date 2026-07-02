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
  // multipart upload to S3; returns the stored file (fileUrl is what we persist on the entity).
  upload: async (file: File): Promise<VehicleFilesResponse> => {
    const form = new FormData()
    form.append('files', file)
    const { data } = await api.post<VehicleFilesResponse[]>(endpoints.public.vehicleMediaUpload, form)
    return data[0]
  },
}
