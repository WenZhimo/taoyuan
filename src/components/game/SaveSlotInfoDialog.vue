<template>
  <div
    class="fixed inset-0 z-70 flex items-center justify-center bg-bg/80 p-4"
    data-testid="save-slot-info-dialog"
    @click.self="$emit('close')"
  >
    <div class="game-panel w-full max-w-lg max-h-[80vh] flex flex-col relative">
      <button
        class="absolute top-2 right-2 text-muted hover:text-text"
        aria-label="关闭存档信息"
        @click="$emit('close')"
      >
        <X :size="14" />
      </button>
      <Divider title class="my-4" :label="`存档 ${slot + 1} 信息`" />
      <div v-if="loading" class="text-xs text-muted text-center py-6">读取存档信息中...</div>
      <div v-else-if="info === null" class="text-xs text-danger text-center py-6">
        无法读取该存档信息，原存档未修改。
      </div>
      <div v-else class="flex-1 min-h-0 overflow-y-auto space-y-3 text-xs pr-1">
        <div class="grid grid-cols-2 gap-2">
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-muted">角色</p>
            <p class="text-text break-words">{{ info.playerName ?? '未命名' }}</p>
          </div>
          <div class="border border-accent/20 rounded-xs p-2">
            <p class="text-muted">保存时间</p>
            <p class="text-text break-all">{{ info.savedAt ?? '未知' }}</p>
          </div>
        </div>
        <div class="border border-accent/20 rounded-xs p-2">
          <p class="text-muted mb-1">内容环境</p>
          <p class="text-text break-all" data-testid="save-slot-info-environment-hash">
            {{ info.contentEnvironment?.environmentHash ?? '旧存档，尚未记录内容环境' }}
          </p>
        </div>
        <div class="border border-accent/20 rounded-xs p-2" data-testid="save-slot-info-packages">
          <p class="text-muted mb-1">使用的数据包</p>
          <div v-if="info.contentEnvironment?.packages.length" class="space-y-1">
            <div
              v-for="pkg in info.contentEnvironment.packages"
              :key="pkg.packageId"
              class="flex items-start justify-between gap-3"
            >
              <span class="text-text break-all">{{ pkg.packageId }}</span>
              <span class="text-muted shrink-0">v{{ pkg.version }}</span>
            </div>
          </div>
          <p v-else class="text-muted">未记录数据包信息</p>
        </div>
      </div>
      <div class="flex justify-center mt-3 shrink-0">
        <Button :icon="X" class="justify-center" @click="$emit('close')">关闭</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { X } from 'lucide-vue-next'
  import Button from '@/components/game/Button.vue'
  import Divider from '@/components/game/Divider.vue'
  import { useSaveStore, type SaveSlotInfo } from '@/stores/useSaveStore'

  const props = defineProps<{ slot: number }>()
  defineEmits<{ close: [] }>()

  const saveStore = useSaveStore()
  const info = ref<SaveSlotInfo | null>(null)
  const loading = ref(true)

  const loadInfo = async(): Promise<void> => {
    loading.value = true
    info.value = await saveStore.inspectSlot(props.slot)
    loading.value = false
  }

  onMounted(() => {
    void loadInfo()
  })
  watch(() => props.slot, () => {
    void loadInfo()
  })
</script>
