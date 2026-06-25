import { afterEach, describe, expect, it, vi } from 'vitest'

import { apiRequest } from '../apiRequestFunction'

describe('apiRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the projects API base url and returns parsed JSON', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ data: [{ id: 'p1' }] }),
    } as unknown as Response)

    const response = await apiRequest<{ data: Array<{ id: string }> }>()

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3003/api/v1/projects',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )
    expect(response).toEqual({ data: [{ id: 'p1' }] })
  })

  it('returns undefined for 204 responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    const response = await apiRequest('/project-1', { method: 'DELETE' })

    expect(response).toBeUndefined()
  })

  it('throws the backend error message when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      json: vi.fn().mockResolvedValue({
        error: { message: 'A project with this name already exists.' },
      }),
    } as unknown as Response)

    await expect(apiRequest('', { method: 'POST' })).rejects.toThrow(
      'A project with this name already exists.',
    )
  })

  it('falls back to the status message when the error body is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Response)

    await expect(apiRequest('/project-1/tasks')).rejects.toThrow('Request failed with status 500')
  })
})
