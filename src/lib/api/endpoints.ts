// Mirror of core.ApiEndpoints on the backend. Do not hardcode path strings in components.
export const API = '/api'
export const CONTROL = '/control'

export const endpoints = {
  auth: {
    telegramLink: `${API}/auth/telegram/link`,
    telegramVerify: `${API}/auth/telegram/verify`,
    refresh: `${API}/auth/refresh`,
  },
  control: {
    usersPageable: `${CONTROL}/auth/pageable`,
    grantRole: `${CONTROL}/auth/grant-role`,
    revokeRole: `${CONTROL}/auth/revoke-role`,
    vehiclesPageable: `${CONTROL}/vehicles/pageable`,
    vehicleActivate: (id: string) => `${CONTROL}/vehicles/${id}/activate`,
    vehicleDeactivate: (id: string) => `${CONTROL}/vehicles/${id}/deactivate`,
    vehicleVerify: (id: string) => `${CONTROL}/vehicles/${id}/verify`,
    vehicleUnverify: (id: string) => `${CONTROL}/vehicles/${id}/unverify`,
    mediaPageable: `${CONTROL}/vehicles/media/pageable`,
    mediaDelete: (fileId: string) => `${CONTROL}/vehicles/media/${fileId}`,
    brands: `${CONTROL}/brands`,
    brandsPageable: `${CONTROL}/brands/pageable`,
    brand: (id: string) => `${CONTROL}/brands/${id}`,
    models: `${CONTROL}/models`,
    modelsPageable: `${CONTROL}/models/pageable`,
    model: (id: string) => `${CONTROL}/models/${id}`,
    soato: `${CONTROL}/soato`,
    soatoPageable: `${CONTROL}/soato/pageable`,
    soatoById: (id: string) => `${CONTROL}/soato/${id}`,
    soatoUpload: `${CONTROL}/soato/upload`,
    expertsPageable: `${CONTROL}/experts/pageable`,
    expert: (id: string) => `${CONTROL}/experts/${id}`,
    expertApprove: (userId: string) => `${CONTROL}/experts/${userId}/approve`,
    expertReject: (userId: string) => `${CONTROL}/experts/${userId}/reject`,
    expertSuspend: (userId: string) => `${CONTROL}/experts/${userId}/suspend`,
    inspectionsPageable: `${CONTROL}/inspections/pageable`,
    inspectionAssign: (id: string) => `${CONTROL}/inspections/${id}/assign`,
    inspectionReject: (id: string) => `${CONTROL}/inspections/${id}/reject`,
  },
  public: {
    vehicle: (id: string) => `${API}/vehicles/${id}`,
    vehicleMedia: (vehicleId: string) => `${API}/vehicles/media/vehicle/${vehicleId}`,
    vehicleMediaUpload: `${API}/vehicles/media`,
    soatoById: (id: string) => `${API}/soato/${id}`,
    enums: (name: string) => `${API}/vehicles/enums/${name}`,
    inspection: (id: string) => `${API}/inspections/${id}`,
    inspectionReport: (id: string) => `${API}/inspections/reports/${id}`,
    inspectionReportByRequest: (requestId: string) => `${API}/inspections/reports/by-request/${requestId}`,
    checklistTemplate: (specialization: string) => `${API}/inspections/reports/templates/${specialization}`,
  },
} as const

// ADMIN gate: probe a genuinely guarded endpoint (see plan §1.2).
// NOT /control/auth/pageable — it historically lacked @PreAuthorize.
export const ADMIN_GATE_PROBE = endpoints.control.brandsPageable
