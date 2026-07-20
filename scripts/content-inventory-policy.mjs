export const PROVISIONAL_INVENTORY_STATUSES = Object.freeze([
  'baselined',
  'inventoried'
])

export const getDefaultInventoryStatus = classification => {
  switch (classification) {
    case 'content':
    case 'derived':
    case 'adapter':
      return 'baselined'
    case 'algorithm':
    case 'ui':
      return 'framework-retained'
    case 'barrel':
    default:
      return 'inventoried'
  }
}

export const isProvisionalInventoryStatus = status =>
  PROVISIONAL_INVENTORY_STATUSES.includes(status)
