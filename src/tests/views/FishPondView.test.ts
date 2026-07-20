import { nextTick } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { BREED_COUNTS } from '@/data/pondBreedDefinitions'
import { getOfficialPondBreedsByGeneration } from '@/domain/mods/contentAccess'
import { useFishPondStore } from '@/stores/useFishPondStore'
import FishPondView from '@/views/game/FishPondView.vue'

const findButton = (wrapper: VueWrapper, label: string) => {
  const button = wrapper.findAll('button').find(candidate => candidate.text() === label)
  expect(button, `button ${label}`).toBeDefined()
  return button!
}

describe('FishPondView breed compendium', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('derives generation totals and filters from the official breed registry', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const fishPondStore = useFishPondStore()
    fishPondStore.pond.built = true

    const discoveredByGeneration = [1, 2, 3, 4, 5].map(generation =>
      getOfficialPondBreedsByGeneration(generation as 1 | 2 | 3 | 4 | 5)[0]!
    )
    fishPondStore.discoveredBreeds = new Set(discoveredByGeneration.map(breed => breed.breedId))

    const wrapper = mount(FishPondView, {
      global: {
        plugins: [pinia],
        stubs: { Transition: false }
      }
    })

    expect(wrapper.text()).toContain('图鉴 5/400')
    await findButton(wrapper, '图鉴 5/400').trigger('click')
    await nextTick()

    for (const generation of [1, 2, 3, 4, 5] as const) {
      await findButton(wrapper, `${generation}代`).trigger('click')
      await nextTick()

      const expectedCount = BREED_COUNTS[generation]!
      expect(getOfficialPondBreedsByGeneration(generation)).toHaveLength(expectedCount)
      expect(wrapper.text()).toContain(`已发现 1/${expectedCount}`)
      expect(wrapper.findAll('div.truncate')).toHaveLength(expectedCount)
      expect(wrapper.text()).toContain(discoveredByGeneration[generation - 1]!.name)
    }

    wrapper.unmount()
  })
})
