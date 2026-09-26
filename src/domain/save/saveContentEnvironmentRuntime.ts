import {
  createOfficialSaveContentEnvironment,
  normalizeSaveContentEnvironment,
  type SaveContentEnvironment
} from './saveContentEnvironment'

let currentSaveContentEnvironment = createOfficialSaveContentEnvironment()

export const getCurrentSaveContentEnvironment = (): SaveContentEnvironment =>
  currentSaveContentEnvironment

export const setCurrentSaveContentEnvironment = (value: unknown): boolean => {
  try {
    currentSaveContentEnvironment = normalizeSaveContentEnvironment(value)
    return true
  } catch {
    return false
  }
}

export const resetCurrentSaveContentEnvironmentForTests = (): void => {
  currentSaveContentEnvironment = createOfficialSaveContentEnvironment()
}
