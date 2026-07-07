import { api } from '../client'
import { endpoints } from '../endpoints'
import type { PageableRequest, PageableResponse } from '../pageable'
import type {
  ChecklistTemplateResponse,
  InspectionAssignRequest,
  InspectionReasonRequest,
  InspectionReportResponse,
  InspectionRequestResponse,
} from '@/types/api'

export const inspectionsApi = {
  pageable: async (req: PageableRequest): Promise<PageableResponse<InspectionRequestResponse>> => {
    const { data } = await api.post<PageableResponse<InspectionRequestResponse>>(
      endpoints.control.inspectionsPageable,
      req,
    )
    return data
  },
  getById: async (id: string): Promise<InspectionRequestResponse> => {
    const { data } = await api.get<InspectionRequestResponse>(endpoints.public.inspection(id))
    return data
  },
  assign: async (id: string, body: InspectionAssignRequest): Promise<InspectionRequestResponse> => {
    const { data } = await api.post<InspectionRequestResponse>(endpoints.control.inspectionAssign(id), body)
    return data
  },
  reject: async (id: string, reason?: string): Promise<InspectionRequestResponse> => {
    const body: InspectionReasonRequest = { reason }
    const { data } = await api.post<InspectionRequestResponse>(endpoints.control.inspectionReject(id), body)
    return data
  },
  reportByRequest: async (requestId: string): Promise<InspectionReportResponse> => {
    const { data } = await api.get<InspectionReportResponse>(endpoints.public.inspectionReportByRequest(requestId))
    return data
  },
  checklistTemplate: async (specialization: string): Promise<ChecklistTemplateResponse> => {
    const { data } = await api.get<ChecklistTemplateResponse>(endpoints.public.checklistTemplate(specialization))
    return data
  },
}
