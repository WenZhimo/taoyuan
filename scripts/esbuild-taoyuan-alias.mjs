import fs from 'node:fs'
import path from 'node:path'

export const createTaoyuanAliasPlugin = root => ({
  name: 'taoyuan-alias',
  setup(build) {
    // Node generators do not execute browser bootstrap code pulled in through
    // legacy adapter cycles, so Vite-owned raw resources stay external.
    build.onResolve({ filter: /\?raw$/ }, args => ({
      path: args.path,
      external: true
    }))
    build.onResolve({ filter: /^@\// }, args => {
      const sourcePath = path.join(root, 'src', args.path.slice(2))
      return {
        path: fs.existsSync(sourcePath)
          ? fs.statSync(sourcePath).isDirectory()
            ? path.join(sourcePath, 'index.ts')
            : sourcePath
          : fs.existsSync(`${sourcePath}.ts`)
            ? `${sourcePath}.ts`
            : `${sourcePath}.vue`
      }
    })
  }
})
