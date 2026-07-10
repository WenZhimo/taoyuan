import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_SIZE, usePagination } from '@/composables/game/usePagination'

describe('usePagination', () => {
  it('uses the shared default page size and returns the first page', () => {
    const items = ref(Array.from({ length: DEFAULT_PAGE_SIZE + 5 }, (_, index) => index + 1))

    const pagination = usePagination(items)

    expect(pagination.totalPages.value).toBe(2)
    expect(pagination.safePage.value).toBe(1)
    expect(pagination.pagedItems.value).toHaveLength(DEFAULT_PAGE_SIZE)
    expect(pagination.pagedItems.value[0]).toBe(1)
  })

  it('clamps page changes without mutating the item list', () => {
    const items = ref([1, 2, 3, 4, 5])
    const pagination = usePagination(items, 2)

    pagination.setPage(99)
    expect(pagination.safePage.value).toBe(3)
    expect(pagination.currentPage.value).toBe(3)
    expect(pagination.pagedItems.value).toEqual([5])

    pagination.nextPage()
    expect(pagination.safePage.value).toBe(3)

    pagination.setPage(-10)
    expect(pagination.safePage.value).toBe(1)
    expect(items.value).toEqual([1, 2, 3, 4, 5])
  })

  it('keeps the requested page stable when items still cover it', () => {
    const items = ref([1, 2, 3, 4, 5, 6])
    const pagination = usePagination(items, 2)

    pagination.setPage(2)
    items.value = [1, 2, 3, 4, 5]

    expect(pagination.currentPage.value).toBe(2)
    expect(pagination.safePage.value).toBe(2)
    expect(pagination.pagedItems.value).toEqual([3, 4])
  })

  it('uses a safe page when the list shrinks below the selected page', () => {
    const items = ref([1, 2, 3, 4, 5, 6])
    const pagination = usePagination(items, 2)

    pagination.setPage(3)
    items.value = [1]

    expect(pagination.currentPage.value).toBe(3)
    expect(pagination.safePage.value).toBe(1)
    expect(pagination.pagedItems.value).toEqual([1])
  })

  it('supports next, previous, and reset helpers', () => {
    const items = ref([1, 2, 3, 4, 5])
    const pagination = usePagination(items, 2)

    pagination.nextPage()
    expect(pagination.safePage.value).toBe(2)

    pagination.prevPage()
    expect(pagination.safePage.value).toBe(1)

    pagination.setPage(3)
    pagination.resetPage()
    expect(pagination.safePage.value).toBe(1)
  })

  it('keeps repeated large-list page changes cheap', () => {
    const items = ref(Array.from({ length: 100_000 }, (_, index) => index))
    const pagination = usePagination(items)
    const iterations = 10_000
    const start = performance.now()
    let checksum = 0

    for (let i = 0; i < iterations; i++) {
      pagination.setPage((i % pagination.totalPages.value) + 1)
      checksum += pagination.pagedItems.value[0] ?? 0
    }

    expect(checksum).toBeGreaterThan(0)
    expect((performance.now() - start) / iterations).toBeLessThan(0.2)
  })
})
