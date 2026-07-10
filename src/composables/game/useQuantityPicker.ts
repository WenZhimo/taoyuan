import { computed, ref, type Ref } from 'vue'

export interface UseQuantityPickerOptions {
  initialQuantity?: number
  maxQuantity: Ref<number> | (() => number)
}

const readMaxQuantity = (maxQuantity: UseQuantityPickerOptions['maxQuantity']): number =>
  typeof maxQuantity === 'function' ? maxQuantity() : maxQuantity.value

export function clampQuantity(value: number, maxQuantity: number): number {
  const safeMax = Math.max(1, Math.floor(maxQuantity))
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(1, Math.floor(value)), safeMax)
}

export function parseQuantityInput(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export function useQuantityPicker({ initialQuantity = 1, maxQuantity }: UseQuantityPickerOptions) {
  const quantity = ref(1)
  const max = computed(() => Math.max(1, Math.floor(readMaxQuantity(maxQuantity))))
  const canDecrease = computed(() => quantity.value > 1)
  const canIncrease = computed(() => quantity.value < max.value)

  const setQuantity = (value: number) => {
    quantity.value = clampQuantity(value, max.value)
  }

  const addQuantity = (delta: number) => {
    setQuantity(quantity.value + delta)
  }

  const setMinQuantity = () => {
    setQuantity(1)
  }

  const setMaxQuantity = () => {
    setQuantity(max.value)
  }

  const setQuantityFromInput = (value: string) => {
    setQuantity(parseQuantityInput(value, quantity.value))
  }

  const resetQuantity = (value = initialQuantity) => {
    setQuantity(value)
  }

  resetQuantity(initialQuantity)

  return {
    canDecrease,
    canIncrease,
    max,
    quantity,
    addQuantity,
    resetQuantity,
    setMaxQuantity,
    setMinQuantity,
    setQuantity,
    setQuantityFromInput
  }
}
