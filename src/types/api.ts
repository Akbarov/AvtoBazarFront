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

export type Role = 'ADMIN' | 'USER'

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
