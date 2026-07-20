import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'

const root = process.cwd()
const mode = process.argv.includes('--write')
  ? 'write'
  : process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--probe')
      ? 'probe'
      : null

if (!mode) throw new Error('Expected one of --write, --check, or --probe')

const tempDir = path.join(root, 'node_modules', '.cache', 'taoyuan-official-precompiled')
const bundlePath = path.join(tempDir, `run-${mode}.mjs`)
const aliasPlugin = {
  name: 'taoyuan-alias',
  setup(build) {
    // The generator never invokes the browser bootstrap path. Leave Vite raw
    // imports untouched when legacy data adapters pull that path into the bundle.
    build.onResolve({ filter: /\?raw$/ }, args => ({
      path: args.path,
      external: true
    }))
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

fs.mkdirSync(tempDir, { recursive: true })

await esbuild.build({
  stdin: {
    contents: `
      import fs from 'node:fs'
      import path from 'node:path'
      import { createEnvironmentHash } from '${path.join(root, 'src/domain/mods/environmentHash.ts').replaceAll('\\', '/')}'
      import { sha256Utf8 } from '${path.join(root, 'src/domain/mods/hash.ts').replaceAll('\\', '/')}'
      import {
        createOfficialPrecompiledRegistryArtifact,
        restoreOfficialPrecompiledRegistryArtifact
      } from '${path.join(root, 'src/domain/mods/officialPrecompiled.ts').replaceAll('\\', '/')}'
      import { createSerializableRegistrySnapshot } from '${path.join(root, 'src/domain/mods/registry.ts').replaceAll('\\', '/')}'
      import {
        OFFICIAL_REGISTRY_DEFINITIONS,
        buildOfficialRegistrySetFromStaticData
      } from '${path.join(root, 'src/domain/mods/staticAdapters.ts').replaceAll('\\', '/')}'

      const root = ${JSON.stringify(root.replaceAll('\\', '/'))}
      const mode = ${JSON.stringify(mode)}
      const artifactPath = path.join(root, 'src/generated/mods/official-precompiled-registry.json')
      const metadataPath = path.join(root, 'src/generated/mods/official-precompiled-metadata.json')
      const serialize = value => JSON.stringify(value, null, 2) + '\\n'

      const registrySet = buildOfficialRegistrySetFromStaticData()
      registrySet.freezeEntries()
      const artifact = createOfficialPrecompiledRegistryArtifact(registrySet)
      const expectedEnvironmentHash = createEnvironmentHash(artifact.environment)
      const serializedArtifact = serialize(artifact)
      const restored = restoreOfficialPrecompiledRegistryArtifact(
        OFFICIAL_REGISTRY_DEFINITIONS,
        JSON.parse(serializedArtifact),
        expectedEnvironmentHash
      )
      const restoredSnapshot = createSerializableRegistrySnapshot(restored)
      if (JSON.stringify(restoredSnapshot) !== JSON.stringify(artifact.snapshot)) {
        throw new Error('Official precompiled artifact failed restore equivalence validation')
      }

      const officialPackage = artifact.environment.packages[0]
      if (!officialPackage) throw new Error('Official precompiled artifact has no package identity')
      const metadata = {
        artifactFormatVersion: artifact.artifactFormatVersion,
        contentHash: officialPackage.contentHash,
        schemaSetHash: artifact.environment.schemaSetHash,
        environmentHash: artifact.environmentHash,
        snapshotHash: artifact.snapshot.snapshotHash,
        registryCount: artifact.snapshot.registries.length,
        entryCount: artifact.snapshot.registries.reduce((total, registry) => total + registry.entries.length, 0)
      }
      const serializedMetadata = serialize(metadata)

      if (mode === 'write') {
        fs.mkdirSync(path.dirname(artifactPath), { recursive: true })
        fs.writeFileSync(artifactPath, serializedArtifact, 'utf8')
        fs.writeFileSync(metadataPath, serializedMetadata, 'utf8')
        process.stdout.write('Generated official precompiled registry artifact.\\n')
      } else if (mode === 'check') {
        const actualArtifact = fs.readFileSync(artifactPath, 'utf8')
        const actualMetadata = fs.readFileSync(metadataPath, 'utf8')
        if (actualArtifact !== serializedArtifact || actualMetadata !== serializedMetadata) {
          throw new Error('Official precompiled registry artifact is stale; run pnpm run mod:precompile')
        }
        process.stdout.write('Verified official precompiled registry artifact.\\n')
      } else {
        const actualArtifact = fs.readFileSync(artifactPath, 'utf8')
        const actualMetadata = fs.readFileSync(metadataPath, 'utf8')
        process.stdout.write(JSON.stringify({
          platform: process.platform,
          artifactMatches: actualArtifact === serializedArtifact,
          metadataMatches: actualMetadata === serializedMetadata,
          artifactHash: sha256Utf8(serializedArtifact),
          ...metadata
        }, null, 2) + '\\n')
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
