/// <reference types="node" />

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import * as dataIndex from '@/data'

type FinalStatus = 'verified' | 'framework-retained'

interface InventorySymbol {
  exportName: string
  syntaxKind: string
  status: string
}

interface InventoryEntry {
  file: string
  symbols: InventorySymbol[]
}

interface ContentInventory {
  entries: InventoryEntry[]
}

const expectedBarrelModules: Array<{
  module: string
  status: FinalStatus
}> = [
  { module: './crops', status: 'verified' },
  { module: './items', status: 'verified' },
  { module: './fish', status: 'verified' },
  { module: './npcs', status: 'verified' },
  { module: './mine', status: 'verified' },
  { module: './recipes', status: 'verified' },
  { module: './events', status: 'verified' },
  { module: './forage', status: 'verified' },
  { module: './upgrades', status: 'verified' },
  { module: './processing', status: 'verified' },
  { module: './achievements', status: 'verified' },
  { module: './heartEvents', status: 'verified' },
  { module: './timeConstants', status: 'framework-retained' },
  { module: './animals', status: 'verified' },
  { module: './fruitTrees', status: 'verified' },
  { module: './buildings', status: 'verified' },
  { module: './farmMaps', status: 'verified' },
  { module: './quests', status: 'verified' },
  { module: './weapons', status: 'verified' },
  { module: './travelingMerchant', status: 'verified' },
  { module: './shops', status: 'verified' },
  { module: './storyQuests', status: 'verified' },
  { module: './rings', status: 'verified' },
  { module: './hats', status: 'verified' },
  { module: './shoes', status: 'verified' },
  { module: './themes', status: 'framework-retained' },
  { module: './breeding', status: 'verified' },
  { module: './market', status: 'verified' },
  { module: './museum', status: 'verified' },
  { module: './guild', status: 'verified' },
  { module: './npcTips', status: 'framework-retained' },
  { module: './secretNotes', status: 'verified' },
  { module: './hanhai', status: 'verified' },
  { module: './fishPond', status: 'verified' },
  { module: './pondBreeds', status: 'verified' },
  { module: './equipmentSets', status: 'verified' },
  { module: './hiddenNpcs', status: 'verified' },
  { module: './hiddenNpcHeartEvents', status: 'verified' },
  { module: './specialItems', status: 'verified' }
]

const root = process.cwd()
const indexPath = path.join(root, 'src', 'data', 'index.ts')
const inventoryPath = path.join(root, 'docs-source', '模组系统实施计划', 'content-inventory.json')
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8')) as ContentInventory
const inventoryByFile = new Map(inventory.entries.map(entry => [entry.file, entry]))

const getBarrelModules = (): string[] => {
  const source = fs.readFileSync(indexPath, 'utf8')
  const sourceFile = ts.createSourceFile(indexPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  return sourceFile.statements
    .filter(ts.isExportDeclaration)
    .map(statement => statement.moduleSpecifier)
    .filter((specifier): specifier is ts.StringLiteral => Boolean(specifier && ts.isStringLiteral(specifier)))
    .map(specifier => specifier.text)
}

describe('phase 6 data barrel inventory closure', () => {
  it('audits every index.ts export source independently', () => {
    const modules = getBarrelModules()

    expect(modules).toEqual(expectedBarrelModules.map(entry => entry.module))
    expect(new Set(modules).size).toBe(39)

    for (const expected of expectedBarrelModules) {
      const moduleName = expected.module.slice(2)
      const sourceFile = `src/data/${moduleName}.ts`
      const sourcePath = path.join(root, sourceFile)
      const sourceEntry = inventoryByFile.get(sourceFile)
      const indexSymbol = inventoryByFile.get('src/data/index.ts')?.symbols.find(
        symbol => symbol.exportName === `* from ${expected.module}`
      )

      expect(fs.existsSync(sourcePath), sourceFile).toBe(true)
      expect(sourceEntry?.symbols.length, sourceFile).toBeGreaterThan(0)
      expect(sourceEntry?.symbols.filter(symbol => ['baselined', 'inventoried'].includes(symbol.status)), sourceFile)
        .toEqual([])
      expect(indexSymbol?.status, expected.module).toBe(expected.status)

      const sourceText = fs.readFileSync(sourcePath, 'utf8')
      expect(sourceText, `${sourceFile} must not import the compatibility barrel`)
        .not.toMatch(/from\s+['"](?:@\/data|\.\/index)['"]/)

      for (const symbol of sourceEntry?.symbols ?? []) {
        if (!['const', 'function'].includes(symbol.syntaxKind)) continue
        expect(symbol.exportName in dataIndex, `${expected.module}:${symbol.exportName}`).toBe(true)
      }
    }
  })

  it('keeps the barrel policy mixed instead of treating all sources as one ownership class', () => {
    const counts = expectedBarrelModules.reduce<Record<FinalStatus, number>>((result, entry) => {
      result[entry.status] += 1
      return result
    }, { verified: 0, 'framework-retained': 0 })

    expect(counts).toEqual({ verified: 36, 'framework-retained': 3 })
  })
})
