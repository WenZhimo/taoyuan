import { computed, ref, watch, type Ref } from 'vue'
import { _registerDayLabelGetter, clearAllLogs, clearDayLogs, logHistory, type LogEntry } from '@/composables/useGameLog'

export interface GameLogGroup {
  label: string
  messages: string[]
}

export const groupLogEntriesByDay = (entries: readonly LogEntry[]): GameLogGroup[] => {
  const groups: GameLogGroup[] = []
  let currentLabel: string | null = null

  for (const entry of entries) {
    if (entry.dayLabel !== currentLabel) {
      currentLabel = entry.dayLabel
      groups.push({ label: currentLabel, messages: [] })
    }
    groups[groups.length - 1]!.messages.push(entry.msg)
  }

  for (const group of groups) group.messages.reverse()
  return groups.reverse()
}

interface UseGameLogsOptions {
  showLogModal: Ref<boolean>
  getDayLabel: () => string
}

export const useGameLogs = ({ showLogModal, getDayLabel }: UseGameLogsOptions) => {
  const clearLogTarget = ref<string | null | undefined>(undefined)
  const groupedLogs = computed(() => groupLogEntriesByDay(logHistory.value))

  const requestClearLogs = (dayLabel: string | null) => {
    clearLogTarget.value = dayLabel
  }

  const executeClearLogs = () => {
    if (clearLogTarget.value === null) clearAllLogs()
    else if (clearLogTarget.value) clearDayLogs(clearLogTarget.value)
    clearLogTarget.value = undefined
  }

  watch(showLogModal, isOpen => {
    if (!isOpen) clearLogTarget.value = undefined
  })

  _registerDayLabelGetter(getDayLabel)

  return {
    clearLogTarget,
    groupedLogs,
    requestClearLogs,
    executeClearLogs
  }
}
