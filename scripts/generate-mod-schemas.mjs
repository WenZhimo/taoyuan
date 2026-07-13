import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'

const root = process.cwd()
const outputDir = path.join(root, 'docs-source', '模组系统实施计划', 'generated-schemas')
const tempDir = path.join(root, 'node_modules', '.cache', 'taoyuan-mod-schemas')
const bundlePath = path.join(tempDir, 'generate.mjs')
const aliasPlugin = {
  name: 'taoyuan-alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, args => ({
      path: fs.existsSync(path.join(root, 'src', args.path.slice(2)))
        ? fs.statSync(path.join(root, 'src', args.path.slice(2))).isDirectory()
          ? path.join(root, 'src', args.path.slice(2), 'index.ts')
          : path.join(root, 'src', args.path.slice(2))
        : fs.existsSync(path.join(root, 'src', `${args.path.slice(2)}.ts`))
          ? path.join(root, 'src', `${args.path.slice(2)}.ts`)
          : path.join(root, 'src', `${args.path.slice(2)}.vue`)
    }))
  }
}

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(tempDir, { recursive: true })

await esbuild.build({
  stdin: {
    contents: `
      import fs from 'node:fs'
      import path from 'node:path'
      import { PUBLIC_JSON_SCHEMAS } from '${path.join(root, 'src/domain/mods/schemas.ts').replaceAll('\\', '/')}'

      const outputDir = ${JSON.stringify(outputDir.replaceAll('\\', '/'))}
      fs.mkdirSync(outputDir, { recursive: true })
      for (const [fileName, schema] of Object.entries(PUBLIC_JSON_SCHEMAS)) {
        const output = {
          ...schema,
          '$comment': 'Generated from src/domain/mods/schemas.ts. Do not edit by hand.'
        }
        fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(output, null, 2) + '\\n', 'utf8')
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
console.log(`Generated JSON schemas in ${path.relative(root, outputDir).replaceAll('\\', '/')}`)
