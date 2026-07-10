import { describe, expect, it } from 'vitest'
import { getResourceSleepOptionsForLocation, isResourceSleepGroup } from '@/domain/sleep/sleepOptions'

describe('resource sleep options', () => {
  it('allows sleeping bag rest in resource locations', () => {
    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'mine',
      hasSleepingBag: true
    })).toEqual({
      wakePanel: 'mining',
      wakeLocationGroup: 'mine',
      forceRecoveryMode: 'late'
    })

    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'nature',
      hasSleepingBag: true
    })).toMatchObject({ wakePanel: 'forage', wakeLocationGroup: 'nature' })

    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'hanhai',
      hasSleepingBag: true
    })).toMatchObject({ wakePanel: 'hanhai', wakeLocationGroup: 'hanhai' })
  })

  it('does not allow resource sleep without a sleeping bag', () => {
    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'mine',
      hasSleepingBag: false
    })).toBeNull()
  })

  it('does not treat non-resource locations as sleeping bag locations', () => {
    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'farm',
      hasSleepingBag: true
    })).toBeNull()

    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: null,
      currentLocationGroup: 'village_area',
      hasSleepingBag: true
    })).toBeNull()
  })

  it('prefers the route group when the visible route is a resource location', () => {
    expect(getResourceSleepOptionsForLocation({
      routeLocationGroup: 'mine',
      currentLocationGroup: 'farm',
      hasSleepingBag: true
    })).toMatchObject({ wakePanel: 'mining', wakeLocationGroup: 'mine' })
  })

  it('identifies only resource sleep groups', () => {
    expect(isResourceSleepGroup('nature')).toBe(true)
    expect(isResourceSleepGroup('mine')).toBe(true)
    expect(isResourceSleepGroup('hanhai')).toBe(true)
    expect(isResourceSleepGroup('farm')).toBe(false)
    expect(isResourceSleepGroup(null)).toBe(false)
  })

  it('keeps repeated option resolution cheap', () => {
    const iterations = 500_000
    const start = performance.now()
    let allowedCount = 0

    for (let i = 0; i < iterations; i++) {
      if (getResourceSleepOptionsForLocation({
        routeLocationGroup: i % 2 === 0 ? 'mine' : null,
        currentLocationGroup: i % 3 === 0 ? 'hanhai' : 'farm',
        hasSleepingBag: i % 5 !== 0
      })) {
        allowedCount++
      }
    }

    expect(allowedCount).toBeGreaterThan(0)
    expect(performance.now() - start).toBeLessThan(500)
  })
})
