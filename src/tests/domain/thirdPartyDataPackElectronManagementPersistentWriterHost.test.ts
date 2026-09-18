import { describe, expect, it } from 'vitest'
import {
  createThirdPartyDataPackElectronManagementPersistentWriterHost,
  THIRD_PARTY_DATA_PACK_ELECTRON_MANAGEMENT_SETTINGS_LOCKFILE_PERSISTENT_WRITER_HOST_MODE
} from '@/domain/mods/thirdPartyDataPackElectronManagementPersistentWriterHost'
import type { ThirdPartyDataPackDisablePersistentRecord } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import type { ThirdPartyDataPackDisableStartupPersistentStateSnapshot } from '@/domain/mods/thirdPartyDataPackDisableTransaction'
import type { ThirdPartyDataPackLockfileDraft } from '@/domain/mods/thirdPartyDataPackLockfileDraft'
import type { PackageId } from '@/domain/mods/ids'

const draft = {} as ThirdPartyDataPackLockfileDraft
const record = { lockfileDraft: draft } as ThirdPartyDataPackDisablePersistentRecord
const startupSnapshot = {} as ThirdPartyDataPackDisableStartupPersistentStateSnapshot
const envelope = {
  requestedCommandId: 'disable' as const,
  targetPackageId: 'management_writer_host_test_pack' as PackageId,
  record,
  startupSnapshot
}

describe('third-party data-pack Electron management persistent writer host', () => {
  it('writes mod-lock, settings and startup state through the real host in order', async() => {
    const calls: string[] = []
    const host = createThirdPartyDataPackElectronManagementPersistentWriterHost({
      writeModLock: async receivedDraft => {
        calls.push(receivedDraft === draft ? 'mod-lock' : 'wrong-draft')
        return { status: 'written' }
      },
      writeSettings: async receivedRecord => {
        calls.push(receivedRecord === record ? 'settings' : 'wrong-record')
        return { status: 'written' }
      },
      writeStartupState: async receivedSnapshot => {
        calls.push(receivedSnapshot === startupSnapshot ? 'startup' : 'wrong-snapshot')
        return { status: 'written' }
      }
    })

    const result = await host(envelope)

    expect(result).toMatchObject({
      status: 'written',
      settingsLockfilePersistentWriterHostMode:
        THIRD_PARTY_DATA_PACK_ELECTRON_MANAGEMENT_SETTINGS_LOCKFILE_PERSISTENT_WRITER_HOST_MODE,
      settingsWritten: true,
      lockfileWritten: true,
      startupStateWritten: true,
      diagnostics: []
    })
    expect(calls).toEqual(['mod-lock', 'settings', 'startup'])
  })

  it('stops before startup state when settings persistence is blocked', async() => {
    const calls: string[] = []
    const host = createThirdPartyDataPackElectronManagementPersistentWriterHost({
      writeModLock: async() => {
        calls.push('mod-lock')
        return { status: 'written' }
      },
      writeSettings: async() => {
        calls.push('settings')
        return { status: 'blocked' }
      },
      writeStartupState: async() => {
        calls.push('startup')
        return { status: 'written' }
      }
    })

    const result = await host(envelope)

    expect(result).toMatchObject({
      status: 'blocked',
      lockfileWritten: true,
      settingsWritten: false,
      startupStateWritten: false,
      diagnostics: ['settings-write-blocked']
    })
    expect(calls).toEqual(['mod-lock', 'settings'])
  })
})
