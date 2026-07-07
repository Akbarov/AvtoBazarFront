// ============================================================
// DTO types verified against the real backend code (uz.avtobazar.*).
// See ADMIN_PANEL_IMPLEMENTATION_PLAN.md §5.
// ============================================================

// --- auth ---
export interface AuthResponse {
  userId: string
  phoneNumber: string
  fullName: string
  accessToken: string
  refreshToken: string
  verified: boolean
  active: boolean
  // NOTE: no roles — ADMIN is determined by probing a guarded endpoint
}

export interface TelegramLoginLinkResponse {
  botUsername: string
  deepLink: string
}

export interface TelegramLoginRequest {
  code: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type Role = 'ADMIN' | 'USER' | 'EXPERT'

export interface RoleUpdateRequest {
  userId: string
  role: Role
}

export interface UserRoleResponse {
  userId: string
  phoneNumber: string
  fullName: string
  roles: Role[]
  verified: boolean
  active: boolean
  // NOTE: no createdAt
}

// --- vehicle ---
export interface VehicleOwnerResponse {
  id: string
  fullName: string
  phoneNumber: string
  verified: boolean
  registeredAt: number
}

export interface VehicleResponse {
  id: string
  ownerId: string
  owner: VehicleOwnerResponse
  soatoId: string
  category: string
  brandId: string
  brandName: string
  modelId: string
  modelName: string
  year: number
  price: number
  currency: string
  mileage: number
  engineVolume: number
  engineType: string
  transmission: string
  driveType: string
  bodyType: string
  color: string
  description: string
  features: string[]
  negotiable: boolean
  active: boolean
  verified: boolean
  expertInspected: boolean
  favorite: boolean
  viewCount: number
  imageUrls: string[]
  createdAt: number
  // NOTE: no location name (soatoId only), no bodyPaintCondition
}

// --- brand / model (B3: now includes all three languages) ---
export interface VehicleBrandResponse {
  id: string
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  logoUrl: string
  popular: boolean
}

export interface VehicleBrandRequest {
  nameUz: string
  nameRu?: string
  nameEn?: string
  logoUrl?: string
  popular?: boolean
}

export interface VehicleModelResponse {
  id: string
  brandId: string
  brandName: string
  parentId: string | null
  parentName: string | null
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  position: string
  popular: boolean
  children: VehicleModelResponse[]
}

export interface VehicleModelRequest {
  brandId: string
  parentId?: string
  nameUz: string
  nameRu?: string
  nameEn?: string
  position?: string
  popular?: boolean
}

// --- soato ---
export type SoatoType = 'REGION' | 'DISTRICT'

export interface SoatoResponse {
  id: string
  name: string
  nameUz: string
  nameRu: string
  nameEn: string
  soatoCode: number
  nationalCode: number
  type: SoatoType
  parentId: string | null
  parentName: string | null
}

export interface SoatoRequest {
  nameUz: string
  nameRu?: string
  nameEn?: string
  soatoCode: number
  nationalCode?: number
  type: SoatoType
  parentId?: string
}

// --- media ---
export type VehicleFileType = 'IMAGE' | 'VIDEO'

export interface VehicleFilesResponse {
  id: string
  vehicleId: string
  fileUrl: string
  originalFileName: string
  contentType: string
  fileSize: number
  fileType: VehicleFileType
  orderNumber: number
  primary: boolean
  createdAt: number
}

// --- enums ---
export interface EnumItemResponse {
  value: string
  label: string
}

export interface ColorEnumItemResponse {
  value: string
  label: string
  code: string | null // hex; null for OTHER
}

// --- experts ---
export type ExpertSpecialization =
  | 'BODY'
  | 'ENGINE'
  | 'TRANSMISSION'
  | 'ELECTRICAL'
  | 'SUSPENSION'
  | 'DIAGNOSTICS'
  | 'GENERAL'

export type ExpertProfileStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'

export interface ExpertProfileResponse {
  id: string
  userId: string
  fullName: string | null
  phoneNumber: string | null
  bio: string | null
  bioUz: string | null
  bioRu: string | null
  bioEn: string | null
  specializations: ExpertSpecialization[]
  experienceYears: number | null
  certifications: string[] | null
  soatoId: string | null
  status: ExpertProfileStatus
  statusReason: string | null
  feeAmount: number | null
  currency: string | null
  avgRating: number | null
  reviewsCount: number | null
  completedInspections: number | null
  createdAt: number
}

export interface ExpertStatusReasonRequest {
  reason?: string
}

// --- inspections ---
export type InspectionStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export type InspectionRequesterRole = 'SELLER' | 'BUYER'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

export interface InspectionRequestResponse {
  id: string
  vehicleId: string
  requesterId: string
  requesterName: string | null
  requesterRole: InspectionRequesterRole
  expertId: string | null
  expertName: string | null
  specialization: ExpertSpecialization
  status: InspectionStatus
  statusName: string // localized by Accept-Language
  scheduledAt: number | null
  locationAddress: string | null
  soatoId: string | null
  latitude: number | null
  longitude: number | null
  price: number | null
  currency: string | null
  paymentStatus: PaymentStatus
  note: string | null
  cancelReason: string | null
  createdAt: number
}

export interface InspectionAssignRequest {
  expertId: string
  price?: number
  currency?: string
}

export interface InspectionReasonRequest {
  reason?: string
}

// --- inspection reports ---
export type InspectionVerdict = 'RECOMMENDED' | 'MINOR_ISSUES' | 'MAJOR_ISSUES' | 'AVOID'
export type ReportVisibility = 'PUBLIC' | 'PRIVATE_TO_REQUESTER'
export type ChecklistItemStatus = 'OK' | 'MINOR' | 'MAJOR' | 'NOT_APPLICABLE'
export type InspectionFileType = 'IMAGE' | 'VIDEO' | 'DOCUMENT'

export interface InspectionChecklistItem {
  key: string
  status: ChecklistItemStatus | null
  rating: number | null
  note: string | null
}

export interface InspectionChecklistSection {
  key: string
  score: number | null
  items: InspectionChecklistItem[] | null
}

export interface InspectionChecklist {
  sections: InspectionChecklistSection[] | null
}

export interface InspectionFileResponse {
  id: string
  reportId: string | null
  fileUrl: string
  originalFileName: string | null
  contentType: string | null
  fileSize: number | null
  fileType: InspectionFileType
  sectionKey: string | null
  orderNumber: number | null
}

export interface InspectionReportResponse {
  id: string
  requestId: string
  vehicleId: string
  expertId: string
  expertName: string | null
  overallVerdict: InspectionVerdict
  verdictName: string // localized by Accept-Language
  overallScore: number | null
  summary: string | null
  checklist: InspectionChecklist | null
  mileageAtInspection: number | null
  inspectedAt: number | null
  visibility: ReportVisibility
  published: boolean
  publishedAt: number | null
  locked: boolean
  files: InspectionFileResponse[]
  createdAt: number
}

export interface ChecklistTemplateItem {
  key: string
  name: string
}

export interface ChecklistTemplateSection {
  key: string
  name: string
  items: ChecklistTemplateItem[]
}

export interface ChecklistTemplateResponse {
  specialization: ExpertSpecialization
  sections: ChecklistTemplateSection[]
}

// --- errors ---
export interface ValidationResponse {
  key: string // NOTE: 'key', not 'field'; name is snake_case
  message: string
}

export interface ErrorResponse {
  path: string
  status: { code: string | null; message: string }
  message: string
  validations: ValidationResponse[] | null
}
