import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import { createTaoyuanAliasPlugin } from './esbuild-taoyuan-alias.mjs'

const root = process.cwd()
const outputDir = path.join(root, 'docs-source', '模组系统实施计划', 'generated-schemas')
const tempDir = path.join(root, 'node_modules', '.cache', 'taoyuan-mod-schemas')
const bundlePath = path.join(tempDir, 'validate.mjs')
const aliasPlugin = createTaoyuanAliasPlugin(root)

fs.mkdirSync(tempDir, { recursive: true })

await esbuild.build({
  stdin: {
    contents: `
      import fs from 'node:fs'
      import path from 'node:path'
      import { PUBLIC_JSON_SCHEMAS } from '${path.join(root, 'src/domain/mods/schemas.ts').replaceAll('\\', '/')}'
      import { createPublicJsonSchema } from '${path.join(root, 'src/domain/mods/publicSchemas.ts').replaceAll('\\', '/')}'

      const outputDir = ${JSON.stringify(outputDir.replaceAll('\\', '/'))}
      const failures = []
      for (const [fileName, schema] of Object.entries(PUBLIC_JSON_SCHEMAS)) {
        const expected = JSON.stringify(createPublicJsonSchema(schema), null, 2) + '\\n'
        const filePath = path.join(outputDir, fileName)
        const actual = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null
        if (actual !== expected) failures.push(fileName)
      }
      const knownFiles = new Set(Object.keys(PUBLIC_JSON_SCHEMAS))
      const extraFiles = fs.existsSync(outputDir)
        ? fs.readdirSync(outputDir).filter(file => file.endsWith('.schema.json') && !knownFiles.has(file))
        : []
      if (extraFiles.length > 0) failures.push(...extraFiles.map(file => 'extra:' + file))
      if (failures.length > 0) {
        throw new Error('Generated schemas are stale: ' + failures.join(', '))
      }
    `,
    resolveDir: root,
    loader: 'ts'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: bundlePath,
  packages: 'bundle',
  plugins: [aliasPlugin],
  logLevel: 'silent'
})

await import(`${pathToFileURL(bundlePath).href}?t=${Date.now()}`)
console.log(`Validated JSON schemas in ${path.relative(root, outputDir).replaceAll('\\', '/')}`)
