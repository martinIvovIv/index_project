const API_BASE = import.meta.env.VUE_APP_BACKEND_API_URI ?? 'http://localhost:3003/api/v1/projects'

export async function apiRequest<T>(path = '', options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        `Request failed with status ${response.status}`,
    )
  }

  return payload as T
}
