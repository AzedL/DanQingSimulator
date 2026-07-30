import { describe, expect, it } from 'vitest'
import {
  CARD_IDS,
  Core,
  type CardId,
  type CoreOptions,
  type DamageOutput,
} from '.'

describe('kernel 公共入口', () => {
  it('导出创建模拟所需的 Core、配置类型、输出类型和卡片 ID', () => {
    const cardId: CardId = CARD_IDS.zhuoZhuoTianYan
    const options: CoreOptions = {
      cards: [{ id: cardId, level: 0 }],
      duration: 1,
      burstDps: 0,
      sustainedDps: 0,
      useRandom: false,
    }

    const core = new Core(options)
    core.exec()
    const output: DamageOutput = core.damage.output()

    expect(output.damageMap['灼灼天炎']).toBe(105000)
  })
})
