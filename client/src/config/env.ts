const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const env = {
  apiUrl,
} as const
