/// <reference types="node" />

import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  configureElectronProgramDirectoryUserData,
  ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON,
  ElectronProgramDirectoryUserDataPolicyError,
  resolveElectronProgramDirectoryUserDataPath,
  type ElectronProgramDirectoryUserDataApp,
  type ElectronProgramDirectoryUserDataFileSystem
} from '@/domain/mods/electronProgramDirectoryUserDataPolicy'

const createApp = (
  options: {
    readonly isPackaged?: boolean
    readonly userDataPath: string
    readonly setPathImpl?: (name: 'userData', value: string) => void
  }
): ElectronProgramDirectoryUserDataApp & {
  readonly getPathMock: ReturnType<typeof vi.fn>
  readonly setPathMock: ReturnType<typeof vi.fn>
} => {
  let currentUserDataPath = options.userDataPath
  const getPathMock = vi.fn((name: 'userData') => {
    expect(name).toBe('userData')
    return currentUserDataPath
  })
  const setPathMock = vi.fn((name: 'userData', value: string) => {
    expect(name).toBe('userData')
    if (options.setPathImpl) {
      options.setPathImpl(name, value)
      return
    }
    currentUserDataPath = value
  })
  return {
    isPackaged: options.isPackaged ?? true,
    getPath: getPathMock,
    setPath: setPathMock,
    getPathMock,
    setPathMock
  }
}

const createFileSystem = (
  options: {
    readonly existingPaths?: readonly string[]
    readonly failAccess?: boolean
    readonly failCopy?: boolean
  } = {}
): ElectronProgramDirectoryUserDataFileSystem & {
  readonly mkdirSyncMock: ReturnType<typeof vi.fn>
  readonly accessSyncMock: ReturnType<typeof vi.fn>
  readonly existsSyncMock: ReturnType<typeof vi.fn>
  readonly cpSyncMock: ReturnType<typeof vi.fn>
} => {
  const existingPaths = new Set((options.existingPaths ?? []).map(value => path.resolve(value)))
  const mkdirSyncMock = vi.fn()
  const accessSyncMock = vi.fn(() => {
    if (options.failAccess) throw new Error('EACCES: C:/Users/LENOVO/AppData/Roaming/taoyuan')
  })
  const existsSyncMock = vi.fn((filePath: string) => existingPaths.has(path.resolve(filePath)))
  const cpSyncMock = vi.fn(() => {
    if (options.failCopy) throw new Error('copy failed')
  })
  return {
    writeAccessMode: 2,
    mkdirSync: mkdirSyncMock,
    accessSync: accessSyncMock,
    existsSync: existsSyncMock,
    cpSync: cpSyncMock,
    mkdirSyncMock,
    accessSyncMock,
    existsSyncMock,
    cpSyncMock
  }
}

const testRoot = path.resolve('E:/projects/taoyuan/.tmp/electron-userdata-policy-test')

describe('Electron program-directory userdata policy', () => {
  it('does nothing outside packaged Electron', () => {
    const app = createApp({
      isPackaged: false,
      userDataPath: path.join(testRoot, 'system-user-data')
    })
    const fileSystem = createFileSystem()

    const result = configureElectronProgramDirectoryUserData({
      app,
      fileSystem,
      programDirectoryPath: path.join(testRoot, 'program')
    })

    expect(result).toMatchObject({
      status: 'skipped',
      fallbackAllowed: false,
      migratedEntries: []
    })
    expect(app.getPathMock).not.toHaveBeenCalled()
    expect(app.setPathMock).not.toHaveBeenCalled()
    expect(fileSystem.mkdirSyncMock).not.toHaveBeenCalled()
    expect(fileSystem.accessSyncMock).not.toHaveBeenCalled()
    expect(fileSystem.cpSyncMock).not.toHaveBeenCalled()
    expect(Object.isFrozen(result)).toBe(true)
  })

  it('configures packaged Electron to executable-directory userdata and migrates only missing legacy entries', () => {
    const programDirectoryPath = path.join(testRoot, 'program')
    const previousUserDataPath = path.join(testRoot, 'system-user-data')
    const userDataPath = path.join(programDirectoryPath, 'userdata')
    const legacyLocalStorage = path.join(previousUserDataPath, 'Local Storage')
    const legacySettings = path.join(previousUserDataPath, 'settings.json')
    const existingTargetSettings = path.join(userDataPath, 'settings.json')
    const app = createApp({ userDataPath: previousUserDataPath })
    const fileSystem = createFileSystem({
      existingPaths: [legacyLocalStorage, legacySettings, existingTargetSettings]
    })

    const result = configureElectronProgramDirectoryUserData({
      app,
      fileSystem,
      programDirectoryPath,
      migrateExistingData: true,
      migrationEntries: ['Local Storage', 'settings.json']
    })

    expect(result).toEqual({
      status: 'configured',
      reason: 'Electron userData is configured to executable-directory userdata',
      fallbackAllowed: false,
      programDirectoryPath,
      previousUserDataPath,
      userDataPath,
      migratedEntries: ['Local Storage']
    })
    expect(fileSystem.mkdirSyncMock).toHaveBeenCalledWith(userDataPath, { recursive: true })
    expect(fileSystem.accessSyncMock).toHaveBeenCalledWith(userDataPath, 2)
    expect(fileSystem.cpSyncMock).toHaveBeenCalledExactlyOnceWith(
      legacyLocalStorage,
      path.join(userDataPath, 'Local Storage'),
      { recursive: true }
    )
    expect(app.setPathMock).toHaveBeenCalledWith('userData', userDataPath)
    expect(app.getPath('userData')).toBe(userDataPath)
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.migratedEntries)).toBe(true)
  })

  it('refuses to fall back when executable-directory userdata is not writable', () => {
    const programDirectoryPath = path.join(testRoot, 'program')
    const previousUserDataPath = path.join(testRoot, 'system-user-data')
    const app = createApp({ userDataPath: previousUserDataPath })
    const fileSystem = createFileSystem({ failAccess: true })

    expect(() => configureElectronProgramDirectoryUserData({
      app,
      fileSystem,
      programDirectoryPath,
      migrateExistingData: true,
      migrationEntries: ['Local Storage', 'settings.json']
    })).toThrow(ElectronProgramDirectoryUserDataPolicyError)

    try {
      configureElectronProgramDirectoryUserData({
        app,
        fileSystem,
        programDirectoryPath
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ElectronProgramDirectoryUserDataPolicyError)
      expect((error as ElectronProgramDirectoryUserDataPolicyError).code)
        .toBe('program-directory-userdata-unavailable')
      expect((error as Error).message).toBe(ELECTRON_PROGRAM_DIRECTORY_USERDATA_REQUIRED_REASON)
      expect(JSON.stringify(error)).not.toContain(previousUserDataPath)
      expect(JSON.stringify(error)).not.toContain(programDirectoryPath)
      expect(JSON.stringify(error)).not.toContain('C:/Users')
    }
    expect(app.setPathMock).not.toHaveBeenCalled()
    expect(app.getPath('userData')).toBe(previousUserDataPath)
    expect(fileSystem.cpSyncMock).not.toHaveBeenCalled()
  })

  it('refuses to continue if Electron does not apply the executable-directory userdata path', () => {
    const programDirectoryPath = path.join(testRoot, 'program')
    const previousUserDataPath = path.join(testRoot, 'system-user-data')
    const app = createApp({
      userDataPath: previousUserDataPath,
      setPathImpl: () => {}
    })
    const fileSystem = createFileSystem()

    expect(() => configureElectronProgramDirectoryUserData({
      app,
      fileSystem,
      programDirectoryPath
    })).toThrow(ElectronProgramDirectoryUserDataPolicyError)

    try {
      configureElectronProgramDirectoryUserData({
        app,
        fileSystem,
        programDirectoryPath
      })
    } catch (error) {
      expect((error as ElectronProgramDirectoryUserDataPolicyError).code)
        .toBe('program-directory-userdata-not-applied')
    }
    expect(app.setPathMock).toHaveBeenCalledWith(
      'userData',
      path.join(programDirectoryPath, 'userdata')
    )
    expect(app.getPath('userData')).toBe(previousUserDataPath)
  })

  it('rejects relative program directories and unsafe migration entries before setting userData', () => {
    const app = createApp({
      userDataPath: path.join(testRoot, 'system-user-data')
    })
    const fileSystem = createFileSystem()

    expect(() => resolveElectronProgramDirectoryUserDataPath('relative-program-directory'))
      .toThrow(ElectronProgramDirectoryUserDataPolicyError)
    expect(() => configureElectronProgramDirectoryUserData({
      app,
      fileSystem,
      programDirectoryPath: path.join(testRoot, 'program'),
      migrateExistingData: true,
      migrationEntries: ['../settings.json']
    })).toThrow(ElectronProgramDirectoryUserDataPolicyError)
    expect(app.setPathMock).not.toHaveBeenCalled()
  })
})
