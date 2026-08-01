import { afterEach, describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../../core/Core'
import {
  getTianGongDamageBoost,
  TIAN_GONG_CARD_IDS,
} from '..'
import type { CardId } from '../Card'
import { CARD_IDS } from '../cardIds'
import { ShangGuanCe } from './dq/ShangGuanCe'
import { settleFracture } from './dq/ZuoGui'
import { HanChaoBingYong } from './ly/HanChaoBingYong'
import { HanJingCi } from './ly/HanJingCi'
import { LinShuangHanYong } from './ly/LinShuangHanYong'
import { ShuangCiHanYu } from './ly/ShuangCiHanYu'
import { ShuangHanPoLie } from './ly/ShuangHanPoLie'

function createCore(
  options: CardOptions[],
  duration: number,
  useRandom = false,
  sustainedDps = 0,
) {
  return new Core({
    cards: options,
    duration,
    burstDps: 0,
    sustainedDps,
    useRandom,
  })
}

function card<T>(core: Core, id: CardId) {
  return core.cardsMap.get(id) as T
}

function damage(core: Core, key: string) {
  const value = core.damage.output().damageMap[key] ?? 0
  if (key === '本体伤害扣减') return value

  return Number(
    (
      value /
      (1 + getTianGongDamageBoost(core, TIAN_GONG_CARD_IDS.ice))
    ).toFixed(9),
  )
}

function count(core: Core, key: string) {
  return core.damage.output().countMap[key] ?? 0
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('玄冰技能', () => {
  it('凝冰霜华施法4秒逐秒扣减本体伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.ningBingShuangHua, level: 0 }],
      4,
      false,
      100,
    )

    core.exec()

    expect(damage(core, '本体伤害扣减')).toBe(-400)
    expect(count(core, '本体伤害扣减')).toBe(4)
  })

  it('凝冰霜华立即造成首次伤害并在之后3秒各造成2次伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.ningBingShuangHua, level: 0 }],
      4,
    )

    core.exec()

    expect(damage(core, '凝冰霜华')).toBe(495005)
    expect(count(core, '凝冰霜华')).toBe(7)
    expect(core.damage.output().damageMapList.map((item) => item['凝冰霜华'])).toEqual([
      70715,
      212145,
      353575,
      495005,
    ])
  })

  it('凝冰霜华将霜刺寒雨增伤与洞察增伤乘算并消费洞察', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ningBingShuangHua, level: 0 },
        { id: CARD_IDS.shuangCiHanYu, level: 5 },
      ],
      4,
    )
    core.damage.addInsight(3)

    core.exec()

    expect(damage(core, '凝冰霜华')).toBeCloseTo(495005 * 1.3 * 1.09)
    expect(core.damage.insightLayers).toBe(0)
  })
})

describe('玄冰丹青', () => {
  it('燕虹首次立即生效并按6秒冷却生成冰箭', () => {
    const core = createCore([{ id: CARD_IDS.yanHong, level: 0 }], 13)

    core.exec()

    expect(damage(core, '冰箭-燕虹')).toBe(4830 * 3)
    expect(count(core, '冰箭-燕虹')).toBe(3)
  })

  it('文敏首次等待冷却加1秒并按燕虹等级生成3枚冰箭', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yanHong, level: 0 },
        { id: CARD_IDS.wenMin, level: 0 },
      ],
      17,
    )

    core.exec()

    expect(core.damage.output().countMapList[15]['冰箭-文敏']).toBeUndefined()
    expect(count(core, '冰箭-文敏')).toBe(3)
    expect(damage(core, '冰箭-文敏')).toBe(4830 * 3 * 1.28)
  })

  it('未携带燕虹时文敏使用负1级燕虹伤害', () => {
    const core = createCore([{ id: CARD_IDS.wenMin, level: 0 }], 17)

    core.exec()

    expect(damage(core, '冰箭-文敏')).toBe(4485 * 3 * 1.28)
  })

  it('文敏与左归对冰箭的增伤乘算并按期望触发碎裂', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yanHong, level: 0 },
        { id: CARD_IDS.wenMin, level: 0 },
        { id: CARD_IDS.zuoGui, level: 0 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '冰箭-燕虹')).toBeCloseTo(4830 * 1.28 * 1.14)
    expect(damage(core, '碎裂')).toBeCloseTo(8484 * 0.3)
    expect(count(core, '碎裂')).toBeCloseTo(0.3)
  })

  it('左归在随机模式逐次判定碎裂', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const core = createCore(
      [
        { id: CARD_IDS.yanHong, level: 0 },
        { id: CARD_IDS.zuoGui, level: 0 },
      ],
      1,
      true,
    )

    core.exec()

    expect(damage(core, '碎裂')).toBe(8484)
    expect(count(core, '碎裂')).toBe(1)
  })

  it('齐昊分四次结算20次玄冰风暴伤害', () => {
    const core = createCore([{ id: CARD_IDS.qiHao, level: 0 }], 3)

    core.exec()

    expect(damage(core, '玄冰风暴')).toBe(128000)
    expect(count(core, '玄冰风暴')).toBe(20)
  })

  it('玄冰风暴随四次伤害分别累加四分之一玄冰值', () => {
    const first = createCore(
      [
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.shangGuanCe, level: 0 },
      ],
      2,
    )
    const complete = createCore(
      [
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.shangGuanCe, level: 0 },
      ],
      3,
    )
    const onStorm = vi.spyOn(
      card<ShangGuanCe>(complete, CARD_IDS.shangGuanCe),
      'onStorm',
    )

    first.exec()
    complete.exec()

    expect(
      card<ShangGuanCe>(first, CARD_IDS.shangGuanCe).iceValue,
    ).toBe(700)
    expect(
      card<ShangGuanCe>(complete, CARD_IDS.shangGuanCe).iceValue,
    ).toBe(1400)
    expect(onStorm.mock.calls).toEqual([
      [0.25],
      [0.25],
      [0.25],
      [0.25],
    ])
  })

  it('每枚冰箭使齐昊冷却缩短2秒', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yanHong, level: 0 },
        { id: CARD_IDS.qiHao, level: 0 },
      ],
      47,
    )

    core.exec()

    expect(count(core, '玄冰风暴')).toBe(40)
  })

  it('左归提高玄冰风暴伤害并对20次命中判定碎裂', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.zuoGui, level: 0 },
        { id: CARD_IDS.shangGuanCe, level: 0 },
      ],
      3,
    )

    core.exec()

    expect(damage(core, '玄冰风暴')).toBeCloseTo(128000 * 1.14)
    expect(damage(core, '碎裂')).toBeCloseTo(8484 * 20 * 0.3)
    expect(card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).iceValue).toBe(
      1400 + 140 * 20 * 0.3,
    )
  })

  it('上官策保留溢出的玄冰值并允许玄冰激化重叠触发', () => {
    const core = createCore([{ id: CARD_IDS.shangGuanCe, level: 0 }], 2)
    const shangGuanCe = card<ShangGuanCe>(core, CARD_IDS.shangGuanCe)

    shangGuanCe.addIceValue(25000)
    core.exec()

    expect(shangGuanCe.iceValue).toBe(5000)
    expect(damage(core, '玄冰激化')).toBe((43534 + 85327) * 2)
    expect(count(core, '玄冰激化')).toBe(4)
  })
})

describe('玄冰灵韵', () => {
  it('寒晶刺每累计10枚冰箭立即消耗效果并结算3枚寒晶刺', () => {
    const core = createCore([{ id: CARD_IDS.hanJingCi, level: 3 }], 0)
    const spike = card<HanJingCi>(core, CARD_IDS.hanJingCi)

    spike.onIceArrow(10)

    expect(damage(core, '寒晶刺')).toBe(10992 * 1.75 * 3)
    expect(count(core, '寒晶刺')).toBe(3)
    expect(damage(core, '碎裂-寒晶刺')).toBe(7878 * 3)
    expect(count(core, '碎裂-寒晶刺')).toBe(3)
  })

  it('寒晶刺5在召唤冰霜元素时获得并立即消费2层效果', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.hanJingCi, level: 5 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '寒晶刺')).toBe(10992 * 2.5 * 6)
    expect(count(core, '寒晶刺')).toBe(6)
  })

  it('霜寒破裂3在冰霜元素出现时立即结算并附加3次固定伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.shuangHanPoLie, level: 3 },
      ],
      7,
    )

    core.exec()

    expect(damage(core, '霜寒破裂')).toBe(60632 * 1.75)
    expect(count(core, '霜寒破裂')).toBe(1)
    expect(damage(core, '霜寒破裂3')).toBe(76692)
    expect(count(core, '霜寒破裂3')).toBe(3)
  })

  it('霜寒破裂5使凝冰霜华额外召唤冰霜元素并使用齐昊负1级伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ningBingShuangHua, level: 0 },
        { id: CARD_IDS.shuangHanPoLie, level: 5 },
      ],
      3,
    )

    core.exec()

    expect(damage(core, '霜寒破裂')).toBe(60632 * 2.5)
    expect(damage(core, '玄冰风暴-霜寒破裂')).toBe(118660)
    expect(count(core, '玄冰风暴-霜寒破裂')).toBe(20)
  })

  it('霜寒破裂5携带齐昊时使用当前等级玄冰风暴伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ningBingShuangHua, level: 0 },
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.shuangHanPoLie, level: 5 },
      ],
      3,
    )

    core.exec()

    expect(damage(core, '玄冰风暴-霜寒破裂')).toBe(128000)
  })

  it('凛霜寒涌3同步冻结结算并提高玄冰激化两段伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.linShuangHanYong, level: 3 },
      ],
      2,
    )

    card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).addIceValue(10000)
    core.exec()

    expect(damage(core, '玄冰激化')).toBeCloseTo((43534 + 85327) * 1.5)
    expect(damage(core, '凛霜寒涌')).toBe(75540 * 1.75)
  })

  it('凛霜寒涌5在冻结时累加3000玄冰值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.linShuangHanYong, level: 5 },
      ],
      2,
    )
    const shangGuanCe = card<ShangGuanCe>(core, CARD_IDS.shangGuanCe)

    shangGuanCe.addIceValue(10000)
    core.exec()

    expect(shangGuanCe.iceValue).toBe(3000)
  })

  it('霜刺寒雨5在冻结1秒后结算5次伤害并获得3层洞察', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.shuangCiHanYu, level: 5 },
      ],
      3,
    )

    card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).addIceValue(10000)
    core.exec()

    expect(damage(core, '霜刺寒雨')).toBe(81740 * 2.5)
    expect(count(core, '霜刺寒雨')).toBe(5)
    expect(core.damage.insightLayers).toBe(3)
  })

  it('寒潮冰涌3立即生效并改为20秒冷却且每次累加2000玄冰值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.hanChaoBingYong, level: 3 },
      ],
      21,
    )

    core.exec()

    expect(damage(core, '寒潮冰涌')).toBe(38144 * 1.75 * 2)
    expect(count(core, '寒潮冰涌')).toBe(2)
    expect(card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).iceValue).toBe(4000)
  })

  it('寒潮冰涌5在凝冰霜华4个伤害时点各触发1次且不影响正常冷却', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ningBingShuangHua, level: 0 },
        { id: CARD_IDS.hanChaoBingYong, level: 5 },
      ],
      4,
    )

    core.exec()

    expect(damage(core, '寒潮冰涌')).toBe(38144 * 2.5 * 5)
    expect(count(core, '寒潮冰涌')).toBe(5)
  })

  it('重置后清空玄冰卡片状态并恢复首次触发行为', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yanHong, level: 0 },
        { id: CARD_IDS.qiHao, level: 0 },
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.hanJingCi, level: 1 },
        { id: CARD_IDS.hanChaoBingYong, level: 1 },
      ],
      1,
    )
    const shangGuanCe = card<ShangGuanCe>(core, CARD_IDS.shangGuanCe)

    core.exec()
    shangGuanCe.addIceValue(5000)
    card<HanJingCi>(core, CARD_IDS.hanJingCi).onIceArrow(5)
    core.reset()
    core.exec()

    expect(shangGuanCe.iceValue).toBe(140)
    expect(count(core, '冰箭-燕虹')).toBe(1)
    expect(count(core, '寒潮冰涌')).toBe(1)
  })

  it('低等级灵韵不触发未解锁的升级效果', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ningBingShuangHua, level: 0 },
        { id: CARD_IDS.wenMin, level: 0 },
        { id: CARD_IDS.zuoGui, level: 0 },
        { id: CARD_IDS.hanJingCi, level: 1 },
        { id: CARD_IDS.shuangHanPoLie, level: 1 },
        { id: CARD_IDS.linShuangHanYong, level: 1 },
        { id: CARD_IDS.shuangCiHanYu, level: 1 },
        { id: CARD_IDS.hanChaoBingYong, level: 1 },
      ],
      0,
    )
    const spike = card<HanJingCi>(core, CARD_IDS.hanJingCi)
    const fracture = card<ShuangHanPoLie>(core, CARD_IDS.shuangHanPoLie)
    const cold = card<LinShuangHanYong>(core, CARD_IDS.linShuangHanYong)
    const rain = card<ShuangCiHanYu>(core, CARD_IDS.shuangCiHanYu)
    const tide = card<HanChaoBingYong>(core, CARD_IDS.hanChaoBingYong)

    spike.onFrostElement()
    fracture.onFrostElement()
    fracture.onSkillCast()
    cold.onFreeze()
    rain.onFreeze()
    tide.onSkillDamageGroup()
    settleFracture(core, 0)

    expect(count(core, '寒晶刺')).toBe(0)
    expect(count(core, '霜寒破裂3')).toBe(0)
    expect(cold.activationDamageMultiplier).toBe(1)
    expect(rain.skillDamageMultiplier).toBe(1)
    expect(core.damage.insightLayers).toBe(0)

    core.reset()
  })
})
