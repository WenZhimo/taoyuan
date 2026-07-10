export type MorningEffectLike =
  | { type: 'loseCrop' }
  | { type: 'gainItem'; itemId: string; qty: number }
  | { type: 'gainMoney'; amount: number }
  | { type: 'gainFriendship'; amount: number }

export interface MorningNarrationLike {
  message: string
  effect?: MorningEffectLike
}

export interface MorningEventCropPlot {
  state: string
  cropId: string | null
  growthDays: number
  watered: boolean
  harvestCount: number
  seedGenetics: unknown | null
}

export interface MorningEventNpcState {
  friendship: number
}

export interface MorningRandomEventEndDayInput<TChoiceEvent> {
  narrations: readonly MorningNarrationLike[]
  noLossNarrations: readonly MorningNarrationLike[]
  choiceEvents: readonly TChoiceEvent[]
  easterEggs: readonly MorningNarrationLike[]
  getPlots: () => readonly MorningEventCropPlot[]
  getNpcStates: () => readonly MorningEventNpcState[]
  getCropName: (cropId: string) => string | undefined
  addItem: (itemId: string, quantity: number) => unknown
  earnMoney: (amount: number) => void
  showChoiceEvent: (event: TChoiceEvent) => void
  addLog: (message: string) => void
  random?: () => number
}

export interface MorningRandomEventEndDayResult {
  eventType: 'none' | 'narration' | 'choice' | 'easter'
  effectApplied: boolean
}

function applyMorningEffect({
  effect,
  getPlots,
  getNpcStates,
  getCropName,
  addItem,
  earnMoney,
  addLog,
  random
}: Pick<
  MorningRandomEventEndDayInput<unknown>,
  'getPlots' | 'getNpcStates' | 'getCropName' | 'addItem' | 'earnMoney' | 'addLog'
> & {
  effect?: MorningEffectLike
  random: () => number
}): boolean {
  if (!effect) return false

  switch (effect.type) {
    case 'loseCrop': {
      const growing = getPlots().filter(
        plot => plot.state === 'growing' || plot.state === 'harvestable'
      )
      if (growing.length === 0) return false

      const target = growing[Math.floor(random() * growing.length)]!
      const cropName = getCropName(target.cropId ?? '') ?? '作物'
      target.state = 'tilled'
      target.cropId = null
      target.growthDays = 0
      target.watered = false
      target.harvestCount = 0
      target.seedGenetics = null
      addLog(`一株${cropName}被糟蹋了。`)
      return true
    }
    case 'gainItem':
      addItem(effect.itemId, effect.qty)
      return true
    case 'gainMoney':
      earnMoney(effect.amount)
      return true
    case 'gainFriendship':
      for (const state of getNpcStates()) state.friendship += effect.amount
      return true
  }
}

export function processMorningRandomEventEndDay<TChoiceEvent>({
  narrations,
  noLossNarrations,
  choiceEvents,
  easterEggs,
  getPlots,
  getNpcStates,
  getCropName,
  addItem,
  earnMoney,
  showChoiceEvent,
  addLog,
  random = Math.random
}: MorningRandomEventEndDayInput<TChoiceEvent>): MorningRandomEventEndDayResult {
  const roll = random()
  if (roll >= 0.05) return { eventType: 'none', effectApplied: false }

  if (roll < 0.002) {
    const egg = easterEggs[Math.floor(random() * easterEggs.length)]!
    addLog(egg.message)
    const effectApplied = applyMorningEffect({
      effect: egg.effect,
      getPlots,
      getNpcStates,
      getCropName,
      addItem,
      earnMoney,
      addLog,
      random
    })
    return { eventType: 'easter', effectApplied }
  }

  if (roll < 0.01) {
    const event = choiceEvents[Math.floor(random() * choiceEvents.length)]!
    showChoiceEvent(event)
    return { eventType: 'choice', effectApplied: false }
  }

  const hasCrops = getPlots().some(
    plot => plot.state === 'growing' || plot.state === 'harvestable'
  )
  const pool = hasCrops ? narrations : noLossNarrations
  const narration = pool[Math.floor(random() * pool.length)]!
  addLog(narration.message)
  const effectApplied = applyMorningEffect({
    effect: narration.effect,
    getPlots,
    getNpcStates,
    getCropName,
    addItem,
    earnMoney,
    addLog,
    random
  })
  return { eventType: 'narration', effectApplied }
}
