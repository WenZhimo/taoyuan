export const NAP_STAMINA_RECOVERY_PER_HOUR = 0.12

export interface NapResolution {
  requestedMinutes: number
  maxMinutes: number
  actualMinutes: number
  canNap: boolean
  interrupted: boolean
}

export interface NapRecoveryInput {
  minutes: number
  stamina: number
  maxStamina: number
  recoveryPerHour?: number
}

export const normalizeNapMinutes = (minutes: number): number => {
  if (!Number.isFinite(minutes)) return 1
  return Math.max(1, Math.floor(minutes))
}

export const getMaxNapMinutes = (currentHour: number, passoutHour: number): number => {
  const minutesUntilPassout = Math.floor((passoutHour - currentHour) * 60)
  return Math.max(0, minutesUntilPassout - 1)
}

export const resolveNapMinutes = (currentHour: number, requestedMinutes: number, passoutHour: number): NapResolution => {
  const normalizedRequested = normalizeNapMinutes(requestedMinutes)
  const maxMinutes = getMaxNapMinutes(currentHour, passoutHour)
  const actualMinutes = Math.min(normalizedRequested, maxMinutes)

  return {
    requestedMinutes: normalizedRequested,
    maxMinutes,
    actualMinutes,
    canNap: actualMinutes > 0,
    interrupted: normalizedRequested > actualMinutes && actualMinutes > 0
  }
}

export const calculateNapStaminaRecovery = ({
  minutes,
  stamina,
  maxStamina,
  recoveryPerHour = NAP_STAMINA_RECOVERY_PER_HOUR
}: NapRecoveryInput): number => {
  if (minutes <= 0) return 0
  const missing = Math.max(0, maxStamina - stamina)
  const recovery = Math.floor(maxStamina * recoveryPerHour * (minutes / 60))
  return Math.min(missing, Math.max(1, recovery))
}
