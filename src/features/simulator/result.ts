import type { CoreOptions, DamageOutput } from '../../kernel'
import { fixed } from '../../kernel/utils/math'
import { split } from '../../kernel/utils/key'

export interface SimulationDamageDetail {
  key: string
  dps: number
  proportion: number
}

export function calculateDps(
  output: DamageOutput,
  options: CoreOptions,
) {
  const duration = Math.max(options.duration, 1)
  return fixed(output.totalDamage / duration)
}

export function buildDamageDetails(
  output: DamageOutput,
  options: CoreOptions,
) {
  const duration = Math.max(options.duration, 1)
  const totalDps = calculateDps(output, options)
  const result: SimulationDamageDetail[] = [
    { key: 'total', dps: totalDps, proportion: 100 },
  ]

  Object.entries(output.damageMap).forEach(([key, damage]) => {
    const dps = damage / duration
    result.push({
      key,
      dps: fixed(dps),
      proportion: totalDps === 0 ? 0 : fixed((dps * 100) / totalDps),
    })
  })

  return result
}

export function mergeDamageDetails(result: SimulationDamageDetail[]) {
  const merged = new Map<string, SimulationDamageDetail>()

  result.forEach((item) => {
    const key = split(item.key)
    const current = merged.get(key)
    if (!current) {
      merged.set(key, { ...item, key })
      return
    }

    current.dps = fixed(current.dps + item.dps)
    current.proportion = fixed(current.proportion + item.proportion)
  })

  return [...merged.values()]
}
