import { api } from '../client'
import { endpoints } from '../endpoints'
import type { ColorEnumItemResponse, EnumItemResponse } from '@/types/api'

export const enumsApi = {
  get: async (name: string): Promise<EnumItemResponse[]> => {
    const { data } = await api.get<EnumItemResponse[]>(endpoints.public.enums(name))
    return data
  },
  colors: async (): Promise<ColorEnumItemResponse[]> => {
    const { data } = await api.get<ColorEnumItemResponse[]>(endpoints.public.enums('colors'))
    return data
  },
}
