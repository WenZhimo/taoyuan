<template>
  <div>
    <p class="text-xs text-accent mb-2">
      <Fish :size="14" class="inline" />
      张力钓鱼 — {{ fishName }}
    </p>

    <div
      class="select-none"
      style="touch-action: manipulation"
      tabindex="0"
      @click="pullRod"
    >
      <p class="text-xs text-center mb-2 text-accent bite-flash">鱼上钩了！注意张力！</p>

      <div class="flex space-x-3 items-stretch mb-3">
        <div class="w-8 h-44 bg-bg border border-accent/30 relative overflow-hidden shrink-0">
          <div
            class="absolute left-0 right-0 bg-success/15 border-y border-success/30"
            :style="bestZoneStyle"
          />
          <div
            class="absolute left-0 right-0 bg-danger/15 border-b border-danger/30"
            :style="dangerZoneStyle"
          />
          <div
            class="absolute bottom-0 left-0 right-0 transition-none"
            :class="tensionFillClass"
            :style="{ height: `${tensionPct}%` }"
          />
          <span class="absolute text-center w-full" :style="bestLabelStyle">佳</span>
          <span class="absolute text-center w-full" :style="dangerLabelStyle">断</span>
        </div>

        <div class="flex-1 h-44 bg-bg border border-accent/20 relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 water-ripple" />
          <Waves :size="22" class="absolute left-2 bottom-2 text-accent/30" />
          <div class="absolute transition-none" :style="{ top: `${fishVisualY}%`, left: `${fishVisualX}%` }">
            <Fish :size="18" class="text-accent fish-thrash" />
          </div>
          <span class="absolute bottom-0.5 right-1 text-muted" style="font-size: 9px">{{ difficultyName }}</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 w-full text-center text-xs mb-3">
        <div class="border border-accent/10 rounded-xs py-1">
          <p class="text-muted">张力</p>
          <p :class="tensionPct > dangerMin ? 'text-danger' : 'text-accent'">{{ Math.round(tensionPct) }}%</p>
        </div>
        <div class="border border-accent/10 rounded-xs py-1">
          <p class="text-muted">剩余</p>
          <p>{{ Math.ceil(timeLeft) }}s</p>
        </div>
        <div class="border border-accent/10 rounded-xs py-1">
          <p class="text-muted">目标</p>
          <p class="text-success">{{ Math.round(bestMin) }}-{{ Math.round(bestMax) }}%</p>
        </div>
      </div>

      <Button class="w-full py-2.5 justify-center" :icon="ArrowUp" @click.stop="pullRod">收竿！</Button>
    </div>

    <p class="text-xs text-center mt-2" :class="feedbackClass">{{ feedbackText }}</p>
    <p class="text-xs text-muted text-center mt-1">在绿色区域按空格、Enter、E，或点击收竿</p>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { ArrowUp, Fish, Waves } from 'lucide-vue-next'
  import type { MiniGameRating, MiniGameResult } from '@/types'
  import Button from '@/components/game/Button.vue'

  const props = defineProps<{
    fishName: string
    difficulty: 'easy' | 'normal' | 'hard' | 'legendary'
    hookHeight: number
    fishSpeed: number
    fishChangeDir: number
    gravity: number
    liftSpeed: number
    scoreGain: number
    scoreLoss: number
    timeLimit: number
  }>()

  const emit = defineEmits<{
    complete: [result: MiniGameResult]
  }>()

  const DIFFICULTY_TENSION_SPEED: Record<typeof props.difficulty, number> = {
    easy: 16,
    normal: 20,
    hard: 25,
    legendary: 31
  }

  const DIFFICULTY_BEST_WIDTH: Record<typeof props.difficulty, number> = {
    easy: 16,
    normal: 14,
    hard: 12,
    legendary: 10
  }

  const DIFFICULTY_NAMES: Record<typeof props.difficulty, string> = {
    easy: '简单',
    normal: '普通',
    hard: '困难',
    legendary: '传说'
  }

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

  const tensionPct = ref(0)
  const timeLeft = ref(props.timeLimit)
  const fishVisualX = ref(40)
  const fishVisualY = ref(40)
  const feedbackText = ref('等张力进入绿色区域后收竿。')
  const feedbackClass = ref('text-muted')

  let animationId = 0
  let lastTime = 0
  let startedAt = 0
  let fishMoveElapsed = 0
  let gameActive = false

  const difficultyName = computed(() => DIFFICULTY_NAMES[props.difficulty])

  const bestWidth = computed(() => {
    const rodBonus = Math.max(0, props.hookHeight - 40) * 0.25
    const controlBonus = Math.max(0, props.scoreGain - 0.15) * 20
    return clamp(DIFFICULTY_BEST_WIDTH[props.difficulty] + rodBonus + controlBonus, 8, 28)
  })

  const bestMin = computed(() => clamp(66 - bestWidth.value / 2, 42, 70))
  const bestMax = computed(() => clamp(66 + bestWidth.value / 2, bestMin.value + 6, 82))
  const dangerMin = computed(() => clamp(88 + (0.1 - props.scoreLoss) * 80, 84, 94))
  const catchMin = computed(() => clamp(30 - Math.max(0, props.hookHeight - 40) * 0.15, 20, 34))

  const bestZoneStyle = computed(() => ({
    bottom: `${bestMin.value}%`,
    height: `${bestMax.value - bestMin.value}%`
  }))

  const dangerZoneStyle = computed(() => ({
    bottom: `${dangerMin.value}%`,
    height: `${100 - dangerMin.value}%`
  }))

  const bestLabelStyle = computed(() => ({
    bottom: `${(bestMin.value + bestMax.value) / 2}%`,
    fontSize: '8px',
    color: 'var(--color-success)'
  }))

  const dangerLabelStyle = computed(() => ({
    bottom: `${Math.min(96, dangerMin.value + 3)}%`,
    fontSize: '8px',
    color: 'var(--color-danger)'
  }))

  const tensionFillClass = computed(() => {
    if (tensionPct.value > dangerMin.value) return 'bg-danger/70'
    if (tensionPct.value >= bestMin.value && tensionPct.value <= bestMax.value) return 'bg-success/70'
    if (tensionPct.value >= catchMin.value) return 'bg-success/45'
    return 'bg-accent/40'
  })

  const tensionSpeed = computed(() => {
    const rodControl = Math.max(0, props.hookHeight - 40) * 0.12
    const liftControl = Math.max(0, props.liftSpeed - 3) * 2
    const gravityPressure = Math.max(0, props.gravity - 1.5) * 2
    return Math.max(12, DIFFICULTY_TENSION_SPEED[props.difficulty] + props.fishSpeed * 2.4 + gravityPressure - rodControl - liftControl)
  })

  const getRating = (): MiniGameRating => {
    const pct = tensionPct.value
    const excellentMin = bestMin.value - 10
    const excellentMax = Math.min(dangerMin.value, bestMax.value + 10)

    if (pct > dangerMin.value) return 'poor'
    if (pct >= bestMin.value && pct <= bestMax.value) return 'perfect'
    if (pct >= excellentMin && pct <= excellentMax) return 'excellent'
    if (pct >= catchMin.value) return 'good'
    return 'poor'
  }

  const scoreForRating = (rating: MiniGameRating) => {
    if (rating === 'perfect') return 100
    if (rating === 'excellent') return 85
    if (rating === 'good') return 65
    return Math.max(0, Math.min(40, tensionPct.value))
  }

  const finishGame = (rating: MiniGameRating) => {
    if (!gameActive) return
    gameActive = false
    cancelAnimationFrame(animationId)
    emit('complete', {
      rating,
      score: scoreForRating(rating),
      perfect: rating === 'perfect'
    })
  }

  const pullRod = () => {
    if (!gameActive) return
    const rating = getRating()
    if (rating === 'perfect') {
      feedbackText.value = '完美收竿！'
      feedbackClass.value = 'text-warning'
    } else if (rating === 'excellent') {
      feedbackText.value = '漂亮的收竿！'
      feedbackClass.value = 'text-success'
    } else if (rating === 'good') {
      feedbackText.value = '成功收竿。'
      feedbackClass.value = 'text-success'
    } else {
      feedbackText.value = tensionPct.value > dangerMin.value ? '张力太高，鱼线断了！' : '收竿太早，鱼跑掉了！'
      feedbackClass.value = 'text-danger'
    }
    finishGame(rating)
  }

  const updateFishVisual = (delta: number) => {
    fishMoveElapsed += delta
    if (fishMoveElapsed < 0.16) return
    fishMoveElapsed = 0

    const moveRange = 10 + props.fishSpeed * 2 + props.fishChangeDir * 80
    fishVisualX.value = clamp(fishVisualX.value + (Math.random() - 0.5) * moveRange, 5, 78)
    fishVisualY.value = clamp(fishVisualY.value + (Math.random() - 0.5) * moveRange, 5, 78)
  }

  const gameLoop = (timestamp: number) => {
    if (!gameActive) return
    if (!lastTime) lastTime = timestamp
    const delta = (timestamp - lastTime) / 1000
    lastTime = timestamp

    timeLeft.value = Math.max(props.timeLimit - (timestamp - startedAt) / 1000, 0)
    if (timeLeft.value <= 0) {
      finishGame('poor')
      return
    }

    const wave = 1 + Math.sin(timestamp / 180) * 0.08
    const struggle = Math.max(0.65, wave + (Math.random() - 0.35) * props.fishChangeDir * 4)
    tensionPct.value = Math.min(100, tensionPct.value + tensionSpeed.value * struggle * delta)
    updateFishVisual(delta)

    if (tensionPct.value >= 100) {
      feedbackText.value = '张力太高，鱼线断了！'
      feedbackClass.value = 'text-danger'
      finishGame('poor')
      return
    }

    animationId = requestAnimationFrame(gameLoop)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'Enter' || event.code === 'KeyE' || event.code === 'ArrowUp') {
      event.preventDefault()
      pullRod()
    }
  }

  onMounted(() => {
    gameActive = true
    startedAt = performance.now()
    lastTime = 0
    fishVisualX.value = 30 + Math.random() * 40
    fishVisualY.value = 20 + Math.random() * 60
    window.addEventListener('keydown', handleKeyDown)
    animationId = requestAnimationFrame(gameLoop)
  })

  onUnmounted(() => {
    gameActive = false
    cancelAnimationFrame(animationId)
    window.removeEventListener('keydown', handleKeyDown)
  })
</script>

<style scoped>
  .bite-flash {
    animation: bite-flash 0.5s ease-in-out infinite;
  }
  @keyframes bite-flash {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  .fish-thrash {
    animation: fish-thrash 0.3s ease-in-out infinite;
  }
  @keyframes fish-thrash {
    0%,
    100% {
      transform: scaleX(1);
    }
    50% {
      transform: scaleX(-1);
    }
  }

  .water-ripple {
    background: repeating-linear-gradient(0deg, transparent, transparent 6px, var(--color-accent) 6px, var(--color-accent) 7px);
    animation: water-ripple 3s linear infinite;
  }
  @keyframes water-ripple {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(14px);
    }
  }
</style>
