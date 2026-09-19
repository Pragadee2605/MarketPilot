const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const API_BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '')
export const AI_ENGINE_URL = trimTrailingSlash(
  import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:8000',
)

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`
