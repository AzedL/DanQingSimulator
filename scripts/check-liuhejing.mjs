import { createServer } from 'vite'

const DURATION = 3600
const RANDOM_RUNS = 20

const BASE_OPTIONS = {
  coreAttribute: 60000,
  basicDamage: 90000,
  treasureLevel: 10,
  buffs: {
    taXue: false,
    anJi: false,
  },
  duration: DURATION,
}

function buildOptions(cards, useRandom) {
  return {
    ...BASE_OPTIONS,
    cards,
    useRandom,
  }
}

function toDamageMap(detail) {
  const map = {}
  for (const item of detail) {
    if (item.key === 'total') continue
    map[item.key] = item.dps
  }
  return map
}

function summarizeCore(core) {
  return {
    totalDps: core.dps.getDPS(),
    detailMap: toDamageMap(core.dps.getDetail()),
  }
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function averageDetailMaps(results) {
  const sums = {}
  for (const result of results) {
    for (const [key, value] of Object.entries(result.detailMap)) {
      sums[key] = (sums[key] || 0) + value
    }
  }

  const averageMap = {}
  for (const [key, value] of Object.entries(sums)) {
    averageMap[key] = Number((value / results.length).toFixed(2))
  }
  return averageMap
}

function buildRows(deterministicMap, randomAverageMap) {
  const keys = Array.from(new Set([...Object.keys(deterministicMap), ...Object.keys(randomAverageMap)]))

  return keys
    .map((key) => {
      const deterministic = Number((deterministicMap[key] ?? 0).toFixed(2))
      const randomAverage = Number((randomAverageMap[key] ?? 0).toFixed(2))
      const relativeErrorPct =
        deterministic === 0 ? null : Number((((randomAverage - deterministic) / deterministic) * 100).toFixed(3))

      return {
        key,
        deterministic,
        randomAverage,
        relativeErrorPct,
      }
    })
    .sort((a, b) => Math.abs(b.relativeErrorPct ?? -Infinity) - Math.abs(a.relativeErrorPct ?? -Infinity))
}

const vite = await createServer({
  configFile: 'vite.config.ts',
  server: {
    middlewareMode: true,
    hmr: false,
  },
  appType: 'custom',
})

try {
  const [simulationModule, cardCatalogModule] = await Promise.all([
    vite.ssrLoadModule('/src/engine/Simulation.ts'),
    vite.ssrLoadModule('/src/domain/cards/cardCatalog.ts'),
  ])

  const { deriveSimulationCoreOptions, runSimulation } = simulationModule
  const { orderedCardCatalog } = cardCatalogModule

  const cards = orderedCardCatalog
    .filter((card) => card.id !== 'liuWeiMoHu')
    .map((card) => ({ id: card.id, level: 6 }))

  const deterministicCore = runSimulation(deriveSimulationCoreOptions(buildOptions(cards, false))).core
  const deterministic = summarizeCore(deterministicCore)

  const randomResults = Array.from({ length: RANDOM_RUNS }, () => {
    const core = runSimulation(deriveSimulationCoreOptions(buildOptions(cards, true))).core
    return summarizeCore(core)
  })

  const randomAverageTotalDps = Number(average(randomResults.map((item) => item.totalDps)).toFixed(2))
  const randomAverageMap = averageDetailMaps(randomResults)
  const rows = buildRows(deterministic.detailMap, randomAverageMap)

  console.log(
    JSON.stringify(
      {
        scenario: 'all-cards-level-6-without-liuWeiMoHu',
        duration: DURATION,
        randomRuns: RANDOM_RUNS,
        cardCount: cards.length,
        deterministicTotalDps: Number(deterministic.totalDps.toFixed(2)),
        randomAverageTotalDps,
        totalRelativeErrorPct: Number((((randomAverageTotalDps - deterministic.totalDps) / deterministic.totalDps) * 100).toFixed(3)),
        rows,
      },
      null,
      2,
    ),
  )
} finally {
  await vite.close()
}
