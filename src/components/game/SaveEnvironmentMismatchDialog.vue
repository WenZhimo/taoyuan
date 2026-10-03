<template>
  <div
    class="fixed inset-0 z-70 flex items-center justify-center bg-bg/80 p-4"
    data-testid="save-environment-mismatch-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="save-environment-mismatch-title"
    @click.self="$emit('close')"
  >
    <div class="game-panel w-full max-w-md mx-4 text-center relative max-h-[80vh] flex flex-col">
      <button
        class="absolute top-2 right-2 text-muted hover:text-text"
        aria-label="关闭内容环境提示"
        @click="$emit('close')"
      >
        <X :size="14" />
      </button>
      <div class="flex items-center justify-center gap-2 text-warning mt-4 mb-3">
        <TriangleAlert :size="16" />
        <h2 id="save-environment-mismatch-title" class="text-lg">存档内容环境不匹配</h2>
      </div>
      <p class="text-sm text-text leading-relaxed">
        存档 {{ slot + 1 }} 未切换。当前启用的数据包与该存档不一致，继续加载可能覆盖错误内容，因此本次操作已取消。
      </p>
      <p class="text-xs text-muted leading-relaxed mt-2">
        请先回到主菜单调整数据包启用状态，再重新加载该存档。原存档和当前游戏状态均未修改。
      </p>
      <div class="grid grid-cols-1 gap-2 text-left text-xs mt-4 overflow-y-auto">
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">当前运行时</p>
          <p class="text-text break-all">{{ currentEnvironment.environmentHash }}</p>
          <p class="text-muted mt-1 break-words">{{ formatPackages(currentEnvironment) }}</p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">目标存档</p>
          <p class="text-text break-all">{{ savedEnvironment.environmentHash }}</p>
          <p class="text-muted mt-1 break-words">{{ formatPackages(savedEnvironment) }}</p>
        </div>
      </div>
      <div class="flex justify-center mt-4">
        <Button :icon="X" class="justify-center" data-testid="save-environment-mismatch-close" @click="$emit('close')">
          知道了
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { TriangleAlert, X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import type { SaveContentEnvironmentSummary } from '@/domain/save/saveContentEnvironment'

  defineProps<{
    slot: number
    currentEnvironment: SaveContentEnvironmentSummary
    savedEnvironment: SaveContentEnvironmentSummary
  }>()
  defineEmits<{ close: [] }>()

  const formatPackages = (environment: SaveContentEnvironmentSummary): string =>
    environment.packages.map(pkg => `${pkg.packageId}@${pkg.version}`).join('、')
</script>
