import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import { createTaoyuanAliasPlugin } from './esbuild-taoyuan-alias.mjs'

const root = process.cwd()
const tempDir = path.join(root, 'node_modules', '.cache', 'taoyuan-mod-fixtures')
const bundlePath = path.join(tempDir, 'generate.mjs')
const aliasPlugin = createTaoyuanAliasPlugin(root)

fs.mkdirSync(tempDir, { recursive: true })

await esbuild.build({
  stdin: {
    contents: `
      import fs from 'node:fs'
      import path from 'node:path'
      import { buildOfficialRegistrySetFromStaticData } from '${path.join(root, 'src/domain/mods/staticAdapters.ts').replaceAll('\\', '/')}'
      import { createSerializableRegistrySnapshot } from '${path.join(root, 'src/domain/mods/registry.ts').replaceAll('\\', '/')}'
      import { createCanonicalFileManifestHash, hashCanonicalJson, hashPayloadJson, sha256Utf8 } from '${path.join(root, 'src/domain/mods/hash.ts').replaceAll('\\', '/')}'

      const root = ${JSON.stringify(root.replaceAll('\\', '/'))}
      const writeJson = (relativePath, value) => {
        const full = path.join(root, relativePath)
        fs.mkdirSync(path.dirname(full), { recursive: true })
        fs.writeFileSync(full, JSON.stringify(value, null, 2) + '\\n', 'utf8')
      }

      const registrySet = buildOfficialRegistrySetFromStaticData()
      registrySet.freezeEntries()
      writeJson('src/tests/fixtures/mods/official-content-snapshot.json', createSerializableRegistrySnapshot(registrySet))

      writeJson('src/tests/fixtures/mods/hash-golden-vectors.json', {
        algorithm: 'sha256',
        canonicalization: 'RFC 8785 JSON Canonicalization Scheme subset',
        vectors: {
          objectKeyOrder: {
            inputA: { b: 2, a: 1 },
            inputB: { a: 1, b: 2 },
            expected: hashCanonicalJson({ b: 2, a: 1 })
          },
          pathNormalization: {
            inputA: [
              { path: 'data\\\\items.json', size: 3, sha256: sha256Utf8('abc') },
              { path: 'manifest.json', size: 2, sha256: sha256Utf8('{}') }
            ],
            inputB: [
              { path: 'manifest.json', size: 2, sha256: sha256Utf8('{}') },
              { path: 'data/items.json', size: 3, sha256: sha256Utf8('abc') }
            ],
            expected: createCanonicalFileManifestHash([
              { path: 'data\\\\items.json', size: 3, sha256: sha256Utf8('abc') },
              { path: 'manifest.json', size: 2, sha256: sha256Utf8('{}') }
            ])
          },
          lineEndings: {
            lf: sha256Utf8('a\\nb\\n'),
            crlf: sha256Utf8('a\\r\\nb\\r\\n')
          },
          payloadJson: {
            input: '{"b":2,"a":1}',
            expected: hashPayloadJson('{"b":2,"a":1}')
          }
        }
      })

      writeJson('src/tests/fixtures/saves/legacy-v1-baseline.json', {
        game: {
          year: 1,
          season: 'autumn',
          day: 13,
          hour: 22,
          weather: 'rainy',
          tomorrowWeather: 'sunny',
          currentLocation: 'mine',
          currentLocationGroup: 'mine',
          farmMapType: 'standard',
          dailyLuck: 0.05
        },
        player: {
          playerName: '旧档玩家',
          gender: 'female',
          money: 12345,
          stamina: 80,
          maxStamina: 160,
          staminaCapLevel: 1,
          hp: 72,
          baseMaxHp: 100
        },
        inventory: {
          items: [
            { itemId: 'cabbage', quantity: 42, quality: 'normal' },
            { itemId: 'cabbage', quantity: 3, quality: 'supreme' },
            { itemId: 'sleeping_bag', quantity: 1, quality: 'normal' }
          ],
          weapons: [
            { defId: 'rusty_sword', enchantmentId: 'sharp' }
          ],
          equippedWeaponIndex: 0,
          rings: [],
          hats: [],
          shoes: [],
          pendingUpgrade: { toolType: 'pickaxe', targetTier: 'iron', daysRemaining: 1 }
        },
        farm: {
          farmSize: 4,
          plots: [
            { id: 0, state: 'planted', cropId: 'cabbage', growthDays: 3, watered: true, unwateredDays: 0, fertilizer: 'compost' },
            { id: 1, state: 'tilled', cropId: null, growthDays: 0, watered: false, unwateredDays: 0, fertilizer: null },
            { id: 2, state: 'wasteland', cropId: null, growthDays: 0, watered: false, unwateredDays: 0, fertilizer: null },
            { id: 3, state: 'harvestable', cropId: 'potato', growthDays: 6, watered: true, unwateredDays: 0, fertilizer: null }
          ],
          sprinklers: [],
          fruitTrees: [],
          greenhousePlots: [
            { id: 0, state: 'planted', cropId: 'tomato', growthDays: 5, watered: true, unwateredDays: 0, fertilizer: 'bone_meal' }
          ],
          greenhouseLevel: 1,
          wildTrees: [],
          nextFruitTreeId: 0,
          nextWildTreeId: 0,
          lightningRods: 0,
          scarecrows: 1
        },
        cooking: {
          unlockedRecipes: ['fried_egg', 'vegetable_soup'],
          activeBuff: null
        },
        mining: {
          defeatedBosses: ['boss_slime_king'],
          deepestFloor: 45,
          currentFloor: 18,
          inMine: true,
          inCombat: true,
          combatMonster: { id: 'slime', name: '史莱姆', hp: 12, attack: 4, defense: 0, expReward: 5, drops: [], description: '测试怪物' },
          combatLog: ['旧档战斗中'],
          skullCavernUnlocked: true,
          skullDeepestFloor: 12,
          skullSafePoint: 10
        },
        npc: {
          npcStates: [{ npcId: 'chen_bo', friendship: 120, giftsThisWeek: 1, talkedToday: true }],
          seenHeartEvents: ['chen_bo_2']
        },
        quest: {
          boardQuests: [],
          activeQuests: [{
            id: 'legacy_delivery',
            type: 'delivery',
            npcId: 'chen_bo',
            npcName: '陈伯',
            description: '交付青菜',
            targetItemId: 'cabbage',
            targetItemName: '青菜',
            targetQuantity: 5,
            collectedQuantity: 2,
            moneyReward: 500,
            friendshipReward: 20,
            daysRemaining: 2,
            accepted: true
          }],
          completedQuestCount: 3,
          storyState: {
            activeQuestId: 'spring_1',
            completedQuestIds: [],
            objectiveProgress: {}
          }
        },
        fishPond: {
          ponds: Array.from({ length: 55 }, (_, index) => ({
            id: index,
            fishId: 'carp',
            quantity: 1,
            level: 1
          }))
        },
        processing: {
          cellarItems: Array.from({ length: 52 }, (_, index) => ({
            id: index,
            itemId: 'wine',
            quality: 'normal',
            value: 100,
            daysAged: index
          }))
        },
        savedAt: '2026-07-13T00:00:00.000Z'
      })
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
console.log('Generated mod baseline fixtures.')
