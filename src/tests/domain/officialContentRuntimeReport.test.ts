import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEnvironmentHash } from '@/domain/mods/environmentHash'
import {
  bootstrapOfficialContent
} from '@/domain/mods/officialContentBootstrap'
import { createOfficialContentRuntimeReport } from '@/domain/mods/officialContentRuntimeReport'
import {
  applyOfficialPrecompiledProbeFault,
  getOfficialPrecompiledProbeFault
} from '@/domain/mods/officialPrecompiledRuntime'
import {
  isContentRuntimeProbeRequested,
  publishContentRuntimeProbe
} from '@/runtime/contentRuntimeProbe'
import committedArtifact from '@/generated/mods/official-precompiled-registry.json'
import committedMetadata from '@/generated/mods/official-precompiled-metadata.json'

const originalUrl = window.location.href

afterEach(() => {
  window.history.replaceState({}, '', originalUrl)
  document.body.replaceChildren()
  Reflect.deleteProperty(window, 'electronAPI')
  Reflect.deleteProperty(window, '__TAOYUAN_CONTENT_RUNTIME_REPORT__')
})

describe('official content runtime report', () => {
  it('reports the loaded production identity, order and public query checks', async () => {
    await bootstrapOfficialContent()

    const report = createOfficialContentRuntimeReport()

    expect(report).toMatchObject({
      schemaVersion: 1,
      runtimeSource: 'precompiled',
      precompiledStatus: 'official-precompiled-hit',
      diagnostics: [],
      registryPhase: 'frozen',
      snapshotFormatVersion: 2,
      registryCount: 54,
      entryCount: 4242,
      hashes: {
        artifactHash: committedMetadata.artifactHash,
        artifactHashSource: 'loaded-product',
        contentHash: committedMetadata.contentHash,
        schemaSetHash: committedMetadata.schemaSetHash,
        environmentHash: committedMetadata.environmentHash,
        snapshotHash: committedMetadata.snapshotHash
      },
      queryChecks: {
        itemName: '青菜',
        recipeName: '炒青菜',
        cropName: '青菜'
      }
    })
    expect(report.registryIds).toEqual(
      committedArtifact.snapshot.registries.map(registry => registry.registryId)
    )
  })

  it.each([
    ['missing', 'missing'],
    ['corrupt', 'corrupt'],
    ['environment-mismatch', 'environment-mismatch']
  ] as const)('accepts the %s fault only in explicit probe mode', (_name, fault) => {
    expect(getOfficialPrecompiledProbeFault(
      `?taoyuanContentProbe=1&taoyuanPrecompiledFault=${fault}`
    )).toBe(fault)
    expect(getOfficialPrecompiledProbeFault(`?taoyuanPrecompiledFault=${fault}`)).toBeNull()
  })

  it('creates isolated missing, corrupt and environment mismatch inputs', () => {
    const text = JSON.stringify(committedArtifact)

    expect(applyOfficialPrecompiledProbeFault(text, 'missing')).toBeNull()
    expect(() => JSON.parse(applyOfficialPrecompiledProbeFault(text, 'corrupt')!)).toThrow()

    const mismatch = JSON.parse(
      applyOfficialPrecompiledProbeFault(text, 'environment-mismatch')!
    ) as typeof committedArtifact
    expect(mismatch.environment.gameVersion).toBe('probe-environment-mismatch')
    expect(mismatch.environmentHash).toBe(createEnvironmentHash(mismatch.environment))
    expect(mismatch.environmentHash).not.toBe(committedMetadata.environmentHash)
  })

  it('publishes a bounded browser and Electron envelope only in probe mode', async () => {
    await bootstrapOfficialContent()
    expect(isContentRuntimeProbeRequested()).toBe(false)
    expect(publishContentRuntimeProbe()).toBeNull()

    window.history.replaceState({}, '', '/?taoyuanContentProbe=1')
    document.title = '桃源乡'
    for (const label of ['新的旅程', '导入存档', '关于游戏']) {
      const button = document.createElement('button')
      button.textContent = label
      document.body.append(button)
    }
    const reportContentRuntimeProbe = vi.fn()
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      value: { reportContentRuntimeProbe }
    })

    const envelope = publishContentRuntimeProbe()

    expect(envelope).toMatchObject({
      schemaVersion: 1,
      runtime: {
        runtimeSource: 'precompiled',
        registryCount: 54,
        entryCount: 4242
      },
      ui: {
        documentTitle: '桃源乡',
        locationProtocol: 'http:',
        mainMenuReady: true,
        startupFailureVisible: false
      }
    })
    expect(reportContentRuntimeProbe).toHaveBeenCalledWith(envelope)
    expect((window as Window & {
      __TAOYUAN_CONTENT_RUNTIME_REPORT__?: unknown
    }).__TAOYUAN_CONTENT_RUNTIME_REPORT__).toBe(envelope)
  })
})
