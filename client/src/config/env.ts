// Falls back to the current hostname so the app works from localhost,
// LAN IPs (phone/tablet testing), or any deployed host without rebuilds.
const apiUrl =
  import.meta.env.VITE_API_URL ?? `${window.location.protocol}//${window.location.hostname}:3000/api`

export const env = {
  apiUrl,
} as const
