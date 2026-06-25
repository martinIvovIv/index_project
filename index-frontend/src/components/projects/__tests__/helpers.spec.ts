import { describe, expect, it } from 'vitest'

import { formatDate } from '../helpers'

describe('formatDate', () => {
  it('formats an ISO date in en-GB style', () => {
    expect(formatDate('2026-06-25T10:30:00.000Z')).toBe('25 Jun 2026')
  })
})
