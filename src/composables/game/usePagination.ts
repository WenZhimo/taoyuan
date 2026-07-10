import { computed, ref, type Ref } from 'vue'

export const DEFAULT_PAGE_SIZE = 50

const clampPage = (page: number, totalPages: number): number => Math.min(Math.max(1, Math.floor(page)), totalPages)

export function usePagination<T>(items: Ref<readonly T[]>, pageSize = DEFAULT_PAGE_SIZE) {
  const currentPage = ref(1)
  const safePageSize = computed(() => Math.max(1, Math.floor(pageSize)))
  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / safePageSize.value)))
  const safePage = computed(() => clampPage(currentPage.value, totalPages.value))
  const pagedItems = computed(() => {
    const start = (safePage.value - 1) * safePageSize.value
    return items.value.slice(start, start + safePageSize.value)
  })

  const setPage = (page: number) => {
    currentPage.value = clampPage(page, totalPages.value)
  }

  const nextPage = () => {
    setPage(safePage.value + 1)
  }

  const prevPage = () => {
    setPage(safePage.value - 1)
  }

  const resetPage = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    safePage,
    totalPages,
    pagedItems,
    setPage,
    nextPage,
    prevPage,
    resetPage
  }
}
