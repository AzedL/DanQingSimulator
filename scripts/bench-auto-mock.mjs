import { performance } from 'node:perf_hooks'
import { createServer } from 'vite'

const cliCases = process.argv.slice(2).map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
const RUNS = Number(process.env.AUTO_MOCK_BENCH_RUNS ?? 3)
const WARMUP_RUNS = Number(process.env.AUTO_MOCK_BENCH_WARMUP ?? 1)
const CASES = (cliCases.length ? cliCases : [8, 10, 12, 14]).map((costRemain) => ({
  name: `default-${costRemain}`,
  costRemain,
  excludeYouMingQuan: true,
}))

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatMs(value) {
  return `${value.toFixed(2)} ms`
}

function buildOptions(defaultCards, defaults) {
  return {
    cards: defaultCards,
    coreAttribute: Number(defaults.coreAttribute),
    basicDamage: Number(defaults.basicDamage),
    coreAttributeExtraGain: Number(defaults.coreAttributeExtraGain) / 100,
    buffs: {
      taXue: defaults.taXue,
      anJi: defaults.anJi,
    },
    duration: 600,
    useRandom: false,
  }
}

function createAutoMock(AutoMockClass, options, costRemain, excludeYouMingQuan) {
  const excludes = excludeYouMingQuan ? ['youMingQuan'] : []
  const instance = new AutoMockClass(costRemain, options, excludes)

  if (typeof instance.getLength === 'function') {
    return {
      autoMock: instance,
      length: instance.getLength(),
    }
  }

  const legacy = new AutoMockClass()
  const length = legacy.getCardsCombo(costRemain, options, excludes)
  return {
    autoMock: legacy,
    length,
  }
}

function runAutoMock(AutoMockClass, options, costRemain, excludeYouMingQuan) {
  const { autoMock, length } = createAutoMock(AutoMockClass, options, costRemain, excludeYouMingQuan)
  const start = performance.now()
  const result = autoMock.exec()
  const elapsed = performance.now() - start
  return { elapsed, length, result }
}

function serializeTopResult(result) {
  return result.map((item) => {
    if ('coreOptions' in item && typeof item.dps === 'number') {
      return {
        dps: item.dps,
        cards: item.coreOptions.cards.map((card) => `${card.id}:${card.level}`).join(','),
      }
    }

    return {
      dps: item.dps.getDPS(),
      cards: item.coreOptions.cards.map((card) => `${card.id}:${card.level}`).join(','),
    }
  })
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
  const [{ AutoMock }, { OldAutoMock }, defaultsModule] = await Promise.all([
    vite.ssrLoadModule('/src/autoMock/AutoMock.ts'),
    vite.ssrLoadModule('/src/autoMock/OldAutoMock.ts'),
    vite.ssrLoadModule('/src/domain/config/simulatorDefaults.ts'),
  ])

  const options = buildOptions(defaultsModule.DEFAULT_CARD_LOADOUT, defaultsModule.BASIC_CONFIG_DEFAULTS)

  console.log('AutoMock benchmark: old implementation vs current implementation')
  console.log(`Warmup runs per case: ${WARMUP_RUNS}`)
  console.log(`Measured runs per case: ${RUNS}`)
  console.log(`Cases: ${CASES.map((item) => item.costRemain).join(', ')}`)
  console.log('')

  for (const testCase of CASES) {
    let oldLength = 0
    let newLength = 0
    let sameTop = false
    const oldTimes = []
    const newTimes = []

    for (let i = 0; i < WARMUP_RUNS; i++) {
      runAutoMock(OldAutoMock, options, testCase.costRemain, testCase.excludeYouMingQuan)
      runAutoMock(AutoMock, options, testCase.costRemain, testCase.excludeYouMingQuan)
    }

    for (let i = 0; i < RUNS; i++) {
      const oldRun = runAutoMock(OldAutoMock, options, testCase.costRemain, testCase.excludeYouMingQuan)
      const newRun = runAutoMock(AutoMock, options, testCase.costRemain, testCase.excludeYouMingQuan)
      oldTimes.push(oldRun.elapsed)
      newTimes.push(newRun.elapsed)
      oldLength = oldRun.length
      newLength = newRun.length
      sameTop = JSON.stringify(serializeTopResult(oldRun.result)) === JSON.stringify(serializeTopResult(newRun.result))
    }

    const oldAvg = average(oldTimes)
    const newAvg = average(newTimes)
    console.log(
      [
        `case=${testCase.name}`,
        `candidates=${oldLength}`,
        `sameCount=${oldLength === newLength}`,
        `sameTop=${sameTop}`,
        `old=${formatMs(oldAvg)}`,
        `current=${formatMs(newAvg)}`,
        `speedupCurrent=${(oldAvg / newAvg).toFixed(2)}x`,
      ].join(' | '),
    )
  }
} finally {
  await vite.close()
}
