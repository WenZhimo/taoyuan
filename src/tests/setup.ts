import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { expect } from 'vitest'

const sourceRoot = path.resolve(process.cwd(), 'src')
const contentAccessPath = path.join(sourceRoot, 'domain', 'mods', 'contentAccess.ts')
const importPattern = /(?:from\s*|import\s*)['"]([^'"]+)['"]/g

const resolveProjectImport = (specifier: string, importer: string): string | null => {
  const basePath = specifier.startsWith('@/')
    ? path.join(sourceRoot, specifier.slice(2))
    : specifier.startsWith('.')
      ? path.resolve(path.dirname(importer), specifier)
      : null
  if (!basePath) return null

  return [basePath, `${basePath}.ts`, `${basePath}.vue`, path.join(basePath, 'index.ts')]
    .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ?? null
}

const dependsOnContentAccess = (entryFile: string): boolean => {
  const pending = [entryFile]
  const visited = new Set<string>()

  while (pending.length > 0) {
    const file = pending.pop()!
    if (file === contentAccessPath) return true
    if (visited.has(file)) continue
    visited.add(file)

    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(importPattern)) {
      const resolved = resolveProjectImport(match[1]!, file)
      if (resolved && !visited.has(resolved)) pending.push(resolved)
    }
  }

  return false
}

const testPath = expect.getState().testPath
if (testPath && dependsOnContentAccess(path.resolve(testPath))) {
  const { bootstrapOfficialContent } = await import('@/domain/mods/officialContentBootstrap')
  await bootstrapOfficialContent()
}
