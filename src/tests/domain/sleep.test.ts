import { describe, expect, it } from 'vitest'
import { calculateNapStaminaRecovery, getMaxNapMinutes, normalizeNapMinutes, resolveNapMinutes } from '@/domain/sleep/napRules'

describe('nap rules', () => {
  it('normalizes requested nap duration to positive whole minutes', () => {
    expect(normalizeNapMinutes(30.8)).toBe(30)
    expect(normalizeNapMinutes(0)).toBe(1)
    expect(normalizeNapMinutes(Number.NaN)).toBe(1)
  })

  it('does not allow a nap to reach the 2 AM passout boundary', () => {
    expect(getMaxNapMinutes(25, 26)).toBe(59)
    expect(resolveNapMinutes(25, 120, 26)).toMatchObject({
      requestedMinutes: 120,
      maxMinutes: 59,
      actualMinutes: 59,
      canNap: true,
      interrupted: true
    })
  })

  it('prevents napping when the passout boundary has already arrived', () => {
    expect(resolveNapMinutes(26, 30, 26)).toMatchObject({
      maxMinutes: 0,
      actualMinutes: 0,
      canNap: false,
      interrupted: false
    })
  })

  it('restores stamina from actual elapsed minutes without exceeding the missing amount', () => {
    expect(calculateNapStaminaRecovery({ minutes: 60, stamina: 50, maxStamina: 100 })).toBe(12)
    expect(calculateNapStaminaRecovery({ minutes: 10, stamina: 99, maxStamina: 100 })).toBe(1)
    expect(calculateNapStaminaRecovery({ minutes: 60, stamina: 100, maxStamina: 100 })).toBe(0)
    expect(calculateNapStaminaRecovery({ minutes: 0, stamina: 50, maxStamina: 100 })).toBe(0)
  })

  it('keeps repeated nap calculations cheap for UI previews', () => {
    const iterations = 200_000
    const start = performance.now()
    let total = 0

    for (let i = 0; i < iterations; i++) {
      total += resolveNapMinutes(18 + (i % 8), 240, 26).actualMinutes
    }

    expect(total).toBeGreaterThan(0)
    expect(performance.now() - start).toBeLessThan(300)
  })
})
