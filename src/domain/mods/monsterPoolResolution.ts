import type { MonsterDef as LegacyMonsterDef } from '@/types'
import { RegistryError } from './registry'
import { getMonsterPoolDefResourceLimitDiagnostics } from './monsterPoolResourceValidation'
import type { MonsterPoolDef } from './schemas'

export const resolveMonsterPoolEntries = (
  pool: Readonly<MonsterPoolDef>,
  getMonster: (id: string) => LegacyMonsterDef | undefined
): readonly LegacyMonsterDef[] => {
  const resourceDiagnostics = getMonsterPoolDefResourceLimitDiagnostics(pool, {
    stage: 'monster-pool.resolve'
  })
  if (resourceDiagnostics[0]) throw new RegistryError(resourceDiagnostics[0])

  const monsters: LegacyMonsterDef[] = []
  for (const entry of pool.entries) {
    const monster = getMonster(entry.monsterId)
    if (!monster) throw new Error(`Missing monster ${entry.monsterId} referenced by pool ${pool.id}`)
    const weight = entry.weight ?? 1
    for (let index = 0; index < weight; index++) monsters.push(monster)
  }
  return monsters
}
