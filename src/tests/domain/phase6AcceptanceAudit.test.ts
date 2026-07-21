/// <reference types="node" />

import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import {
  createSerializableRegistrySnapshot,
  restoreRegistrySetFromSnapshot,
  type RegistryEntry
} from '@/domain/mods/registry'
import { requireContentId } from '@/domain/mods/ids'
import {
  bootstrapOfficialContent,
  getOfficialContentBootstrapReport
} from '@/domain/mods/officialContentBootstrap'
import { validateRegistrySemantics } from '@/domain/mods/semanticValidation'
import { OFFICIAL_REGISTRY_DEFINITIONS, buildOfficialRegistrySetFromStaticData } from '@/domain/mods/staticAdapters'
import officialContentSnapshot from '../fixtures/mods/official-content-snapshot.json'

describe('phase 6 official registry snapshot acceptance evidence', () => {
  it('closes the strict inventory and runtime audit without weakening future defaults', () => {
    const report = JSON.parse(execFileSync(
      process.execPath,
      ['scripts/audit-mod-phase6.mjs', '--strict'],
      { cwd: process.cwd(), encoding: 'utf8' }
    )) as {
      inventory: {
        totalSymbols: number
        phase6Symbols: number
        phase6StatusCounts: Record<string, number>
        provisionalStatusCount: number
        provisionalStatuses: string[]
      }
      businessDataImports: {
        status: string
        count: number
        categories: string[]
        categoryCounts: Record<string, number>
        findings: Array<{ importer: string, dataFile: string, exportName: string, auditCategory: string }>
        unresolvedRuntimeImports: unknown[]
        namespaceImports: unknown[]
      }
      businessStaticReads: {
        status: string
        count: number
        findings: Array<{ importer: string, dataFile: string, exportName: string }>
      }
      officialStartupSemantics: {
        status: string
        checks: Array<{ id: string, pass: boolean, evidence: string }>
      }
      officialSnapshot: {
        formatVersion: number
        registryCount: number
        entryCount: number
        snapshotHash: string
      }
      strict: {
        requested: boolean
        status: string
        failures: string[]
      }
    }

    expect(report.inventory).toEqual({
      totalSymbols: 629,
      phase6Symbols: 574,
      phase6StatusCounts: {
        'framework-retained': 190,
        verified: 384
      },
      provisionalStatusCount: 0,
      provisionalStatuses: ['baselined', 'inventoried']
    })
    expect(report.inventory.phase6StatusCounts.baselined ?? 0).toBe(0)
    expect(report.inventory.phase6StatusCounts.inventoried ?? 0).toBe(0)
    expect((report.inventory.phase6StatusCounts.verified ?? 0)
      + (report.inventory.phase6StatusCounts['framework-retained'] ?? 0))
      .toBe(report.inventory.phase6Symbols)

    expect(report.businessDataImports.status).toBe('PASS')
    expect(report.businessDataImports.count).toBe(477)
    expect(report.businessDataImports.categories).toEqual([
      'official-adapter-leaf',
      'compatibility-fallback',
      'framework-algorithm',
      'legal-derived',
      'pending-migration-violation'
    ])
    expect(report.businessDataImports.categoryCounts).toEqual({
      'official-adapter-leaf': 87,
      'compatibility-fallback': 150,
      'framework-algorithm': 190,
      'legal-derived': 50,
      'pending-migration-violation': 0
    })
    expect(Object.values(report.businessDataImports.categoryCounts).reduce(
      (total, count) => total + count,
      0
    )).toBe(report.businessDataImports.count)
    expect(new Set(report.businessDataImports.findings.map(finding => finding.auditCategory))).toEqual(
      new Set(report.businessDataImports.categories.filter(
        category => (report.businessDataImports.categoryCounts[category] ?? 0) > 0
      ))
    )
    expect(report.businessDataImports.unresolvedRuntimeImports).toEqual([])
    expect(report.businessDataImports.namespaceImports).toEqual([])

    const findingKey = (finding: { importer: string, dataFile: string, exportName: string }) =>
      `${finding.importer}:${finding.dataFile}:${finding.exportName}`
    const classifiedViolations = report.businessDataImports.findings
      .filter(finding => finding.auditCategory === 'pending-migration-violation')
      .map(findingKey)
      .sort()
    const reportedViolations = report.businessStaticReads.findings.map(findingKey).sort()

    expect(report.businessStaticReads.status).toBe('PASS')
    expect(report.businessStaticReads.count).toBe(0)
    expect(classifiedViolations).toEqual(reportedViolations)
    expect(reportedViolations).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding => finding.exportName === 'BOMBS')).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding => finding.exportName === 'GUILD_SHOP_ITEMS')).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding => finding.exportName === 'ITEMS')).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding => finding.exportName.startsWith('TREASURE_DROP_'))).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding =>
      finding.importer === 'src/stores/useMiningStore.ts' && finding.exportName.startsWith('MONSTER_DROP_')
    )).toEqual([])
    expect(report.businessStaticReads.findings.filter(finding => finding.exportName.startsWith('MONSTER_DROP_'))).toEqual([])

    expect(report.officialStartupSemantics.status).toBe('PASS')
    expect(report.officialStartupSemantics.checks).toEqual([
      expect.objectContaining({ id: 'official-registry-lifecycle', pass: true }),
      expect.objectContaining({ id: 'official-disk-cache-fallback', pass: true }),
      expect.objectContaining({ id: 'official-precompiled-fallback', pass: true }),
      expect.objectContaining({ id: 'application-gate-order', pass: true }),
      expect.objectContaining({ id: 'content-access-published-only', pass: true }),
      expect.objectContaining({ id: 'shared-renderer-entry', pass: true }),
      expect.objectContaining({ id: 'electron-startup-diagnostic', pass: true })
    ])
    expect(report.officialSnapshot).toEqual({
      formatVersion: 2,
      registryCount: 54,
      entryCount: 4242,
      snapshotHash: 'sha256:4e87e4bc1d6310d4467335da77603006bf769fdb5c4da45ad927f7ed85a5c4b3'
    })
    expect(report.strict).toEqual({
      requested: true,
      status: 'PASS',
      failures: []
    })

    const defaultStatuses = JSON.parse(execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        "import { getDefaultInventoryStatus } from './scripts/content-inventory-policy.mjs'; process.stdout.write(JSON.stringify(['content', 'derived', 'adapter', 'algorithm', 'ui', 'barrel', 'unknown'].map(getDefaultInventoryStatus)))"
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    )) as string[]

    expect(defaultStatuses).toEqual([
      'baselined',
      'baselined',
      'baselined',
      'framework-retained',
      'framework-retained',
      'inventoried',
      'inventoried'
    ])
  })

  it('keeps complete, bootstrapped, and restored registries equal without sorting', async () => {
    const bootstrapped = await bootstrapOfficialContent()
    const built = buildOfficialRegistrySetFromStaticData()
    built.freezeEntries()

    expect(bootstrapped.currentPhase).toBe('frozen')
    expect(validateRegistrySemantics(built)).toEqual([])
    expect(validateRegistrySemantics(bootstrapped)).toEqual([])

    const builtSnapshot = createSerializableRegistrySnapshot(built)
    expect(createSerializableRegistrySnapshot(bootstrapped)).toEqual(builtSnapshot)
    expect(builtSnapshot).toEqual(officialContentSnapshot)
    expect(getOfficialContentBootstrapReport()).toEqual({
      source: 'precompiled',
      precompiledStatus: 'official-precompiled-hit',
      diagnostics: []
    })

    for (const registryId of built.registryIds()) {
      expect(bootstrapped.get<RegistryEntry>(registryId).entries().map(record => record.entry.id))
        .toEqual(built.get<RegistryEntry>(registryId).entries().map(record => record.entry.id))
    }

    const restored = restoreRegistrySetFromSnapshot(
      OFFICIAL_REGISTRY_DEFINITIONS,
      officialContentSnapshot as unknown
    )
    const restoredSnapshot = createSerializableRegistrySnapshot(restored)

    expect(restored.currentPhase).toBe('frozen')
    expect(validateRegistrySemantics(restored)).toEqual([])
    expect(restoredSnapshot).toEqual(builtSnapshot)
    expect(bootstrapped.registryIds()).toEqual(built.registryIds())
    expect(restored.registryIds()).toEqual(built.registryIds())

    const registrationOrderMismatches: string[] = []
    for (const registryId of built.registryIds()) {
      const builtRecords = built.get<RegistryEntry>(registryId).entries()
      const bootstrappedRegistry = bootstrapped.get<RegistryEntry>(registryId)
      const restoredRegistry = restored.get<RegistryEntry>(registryId)
      const restoredRecords = restoredRegistry.entries()

      expect(bootstrappedRegistry.entries()).toEqual(builtRecords)
      expect(bootstrappedRegistry.values()).toEqual(built.get<RegistryEntry>(registryId).values())
      expect(restoredRecords).toEqual(builtRecords)
      expect(restoredRegistry.values()).toEqual(built.get<RegistryEntry>(registryId).values())
      expect(bootstrappedRegistry.isFrozen).toBe(true)
      expect(restoredRegistry.isFrozen).toBe(true)
      if (restoredRecords.some((record, index) => record.entry.id !== builtRecords[index]?.entry.id)) {
        registrationOrderMismatches.push(registryId)
      }
      for (const record of builtRecords) {
        expect(bootstrappedRegistry.require(requireContentId(record.entry.id))).toEqual(record.entry)
        expect(restoredRegistry.require(requireContentId(record.entry.id))).toEqual(record.entry)
      }
    }

    expect(registrationOrderMismatches).toEqual([])
  })
})
