import type { LocationGroup } from '@/types'

export interface ResourceSleepOptionsInput {
  routeLocationGroup: LocationGroup | null
  currentLocationGroup: LocationGroup
  hasSleepingBag: boolean
}

export interface ResourceSleepOptions {
  wakePanel: string
  wakeLocationGroup: LocationGroup
  forceRecoveryMode: 'late'
}

export const RESOURCE_SLEEP_GROUPS: readonly LocationGroup[] = ['nature', 'mine', 'hanhai']

export const RESOURCE_SLEEP_WAKE_PANEL: Readonly<Partial<Record<LocationGroup, string>>> = {
  nature: 'forage',
  mine: 'mining',
  hanhai: 'hanhai'
}

export const isResourceSleepGroup = (locationGroup: LocationGroup | null | undefined): locationGroup is LocationGroup => {
  return !!locationGroup && RESOURCE_SLEEP_GROUPS.includes(locationGroup)
}

export const getResourceSleepOptionsForLocation = ({
  routeLocationGroup,
  currentLocationGroup,
  hasSleepingBag
}: ResourceSleepOptionsInput): ResourceSleepOptions | null => {
  const locationGroup = isResourceSleepGroup(routeLocationGroup)
    ? routeLocationGroup
    : isResourceSleepGroup(currentLocationGroup)
      ? currentLocationGroup
      : null

  if (!locationGroup || !hasSleepingBag) return null

  return {
    wakePanel: RESOURCE_SLEEP_WAKE_PANEL[locationGroup] ?? 'farm',
    wakeLocationGroup: locationGroup,
    forceRecoveryMode: 'late'
  }
}
