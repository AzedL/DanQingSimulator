import { afterEach, describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../../core/Core'
import {
  getTianGongDamageBoost,
  TIAN_GONG_CARD_IDS,
} from '..'
import type { CardId } from '../Card'
import { CARD_IDS } from '../cardIds'
import { SKILL_UPGRADES } from '../skillUpgrades'
import { QingWuFuSheng } from './QingWuFuSheng'
import { QingLiangZhu } from './dq/QingLiangZhu'
import { LieDiBeng } from './ly/LieDiBeng'
import { MuYinQingLing } from './ly/MuYinQingLing'
import { triggerPulse } from './shared'

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
      (1 + getTianGongDamageBoost(core, TIAN_GONG_CARD_IDS.wood))
    ).toFixed(9),
  )
}

function count(core: Core, key: string) {
  return core.damage.output().countMap[key] ?? 0
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('苍木技能', () => {
  it('青芜浮生开局预读不扣减本体伤害，后续施法2秒逐秒扣减本体伤害', () => {
    const precast = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      2,
      false,
      100,
    )
    precast.exec()
    expect(damage(precast, '本体伤害扣减')).toBe(0)

    const subsequent = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      122,
      false,
      100,
    )
    subsequent.exec()
    expect(damage(subsequent, '本体伤害扣减')).toBe(-200)
    expect(count(subsequent, '本体伤害扣减')).toBe(2)
  })

  it('青芜浮生在第2秒结算伤害并在之后每3秒攻击1次', () => {
    const core = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      21,
    )

    core.exec()

    expect(damage(core, '青芜浮生')).toBe(279564)
    expect(count(core, '青芜浮生')).toBe(1)
    expect(damage(core, '青芜浮生 · 攻击')).toBe(36667 * 6)
    expect(count(core, '青芜浮生 · 攻击')).toBe(6)
  })

  it('青芜浮生后续以122秒为循环周期在120秒和242秒施法并在124秒和246秒结算直伤', () => {
    const beforeSecondDirect = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      124,
    )
    const afterSecondDirect = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      125,
    )
    const beforeThirdDirect = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      246,
    )
    const afterThirdDirect = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      247,
    )

    beforeSecondDirect.exec()
    afterSecondDirect.exec()
    beforeThirdDirect.exec()
    afterThirdDirect.exec()

    expect(count(beforeSecondDirect, '青芜浮生')).toBe(1)
    expect(count(afterSecondDirect, '青芜浮生')).toBe(2)
    expect(count(beforeThirdDirect, '青芜浮生')).toBe(2)
    expect(count(afterThirdDirect, '青芜浮生')).toBe(3)
  })

  it('青芜浮生消费洞察且洞察只增幅技能直伤', () => {
    const core = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      8,
    )
    core.damage.addInsight(2)

    core.exec()

    expect(damage(core, '青芜浮生')).toBe(279564 * 1.06)
    expect(damage(core, '青芜浮生 · 攻击')).toBe(36667)
    expect(core.damage.insightLayers).toBe(0)
  })

  it('裂地崩替代第1次苍木树人攻击且不改变后续攻击时间', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.lieDiBeng, level: 1 },
      ],
      23,
    )

    core.exec()

    expect(damage(core, '裂地崩')).toBe(207708)
    expect(count(core, '裂地崩')).toBe(1)
    expect(count(core, '青芜浮生 · 攻击')).toBe(5)
  })

  it('裂地崩在2秒前摇后结算直伤并随之附加回响', () => {
    const options: CardOptions[] = [
      { id: CARD_IDS.qingWuFuSheng, level: 0 },
      { id: CARD_IDS.lieDiBeng, level: 3 },
    ]
    const started = createCore(options, 3)
    const settled = createCore(options, 5)
    const echoed = createCore(options, 6)

    started.exec()
    settled.exec()
    echoed.exec()

    expect(count(started, '裂地崩')).toBe(0)
    expect(count(started, '裂地崩 · 回响')).toBe(0)
    expect(count(settled, '裂地崩')).toBe(1)
    expect(count(settled, '裂地崩 · 回响')).toBe(0)
    expect(count(echoed, '裂地崩')).toBe(1)
    expect(count(echoed, '裂地崩 · 回响')).toBe(1)
  })

  it('裂地崩后的普通攻击在第8秒首次结算', () => {
    const options: CardOptions[] = [
      { id: CARD_IDS.qingWuFuSheng, level: 0 },
      { id: CARD_IDS.lieDiBeng, level: 1 },
    ]
    const beforeAttack = createCore(options, 8)
    const attacked = createCore(options, 9)

    beforeAttack.exec()
    attacked.exec()

    expect(count(beforeAttack, '青芜浮生 · 攻击')).toBe(0)
    expect(count(attacked, '青芜浮生 · 攻击')).toBe(1)
  })
})

describe('苍木丹青', () => {
  it('折扇首次在第16秒触发并在之后每15秒触发', () => {
    const core = createCore([{ id: CARD_IDS.zheShan, level: 0 }], 31)

    core.exec()

    expect(damage(core, '脉冲')).toBe(9792 * 2)
    expect(count(core, '脉冲')).toBe(2)
  })

  it('未携带折扇时脉冲使用-1级伤害', () => {
    const core = createCore([], 0)

    triggerPulse(core)

    expect(damage(core, '脉冲')).toBe(9092)
    expect(count(core, '脉冲')).toBe(1)
  })

  it('神木骰进入战斗后在6秒内触发3次脉冲', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_dq, level: 0 }],
      7,
    )

    core.exec()

    expect(damage(core, '脉冲-神木骰')).toBe(9092 * 3)
    expect(count(core, '脉冲-神木骰')).toBe(3)
  })

  it('每次脉冲叠加震荡并沿用已有节奏合并结算', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_dq, level: 0 }],
      17,
    )

    core.exec()

    expect(damage(core, '震荡')).toBe(12005 * 3)
    expect(count(core, '震荡')).toBe(8)
  })

  it('脉冲-神木骰使用折扇等级伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shenMuTou_dq, level: 0 },
        { id: CARD_IDS.zheShan, level: 6 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '脉冲-神木骰')).toBe(13992)
  })

  it('林峰仅增幅脉冲而不增幅震荡', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shenMuTou_dq, level: 0 },
        { id: CARD_IDS.linFeng, level: 0 },
      ],
      17,
    )

    core.exec()

    expect(damage(core, '脉冲-神木骰')).toBe(9092 * 1.56 * 3)
    expect(damage(core, '震荡')).toBe(12005 * 3)
  })

  it('六合镜按等级缩短折扇触发间隔', () => {
    const core = createCore(
      [
        { id: CARD_IDS.zheShan, level: 0 },
        { id: CARD_IDS.liuHeJing, level: 0 },
      ],
      27,
    )

    core.exec()

    expect(count(core, '脉冲')).toBe(2)
  })

  it('六合镜在脉冲1秒和2秒后各触发1次额外脉冲', () => {
    const core = createCore(
      [{ id: CARD_IDS.liuHeJing, level: 0 }],
      2,
    )

    triggerPulse(core)
    core.exec()

    expect(damage(core, '脉冲-六合镜')).toBe(9092 * 0.7 * 2)
    expect(count(core, '脉冲-六合镜')).toBe(2)
  })

  it('六合镜额外脉冲触发其他脉冲效果但不再次触发六合镜', () => {
    const core = createCore(
      [
        { id: CARD_IDS.liuHeJing, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
      ],
      5,
    )

    triggerPulse(core)
    core.exec()

    expect(count(core, '脉冲-六合镜')).toBe(2)
    expect(
      card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu).woodValue,
    ).toBe(280 * 3)
  })

  it('清凉珠保留溢出苍木值并合并结算重叠的苍木激化', () => {
    const core = createCore([{ id: CARD_IDS.qingLiangZhu, level: 0 }], 9)
    const pearl = card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu)

    pearl.addWoodValue(25000)
    core.exec()

    expect(pearl.woodValue).toBe(5000)
    expect(damage(core, '苍木激化')).toBe(24916 * 9 * 2)
    expect(count(core, '苍木激化')).toBe(9)
    expect(damage(core, '苍木激化 · 绽放')).toBe(72108 * 3 * 2)
    expect(count(core, '苍木激化 · 绽放')).toBe(3)
  })
})

describe('苍木灵韵', () => {
  it('前6次脉冲不享受六六大顺且第7次开始消费', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_ly, level: 1 }],
      0,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    expect(damage(core, '脉冲')).toBe(9092 * 6)

    triggerPulse(core)
    expect(damage(core, '脉冲')).toBe(9092 * (6 + 1.4))
  })

  it('六六大顺在期望模式按第N次脉冲仍有层数的概率增伤', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_ly, level: 1 }],
      0,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    const before = damage(core, '脉冲')
    for (let index = 0; index < 6; index++) triggerPulse(core)

    expect(damage(core, '脉冲') - before).toBeCloseTo(
      9092 *
        (1.4 + (1 + 0.4 * 2 / 3) + (1 + 0.4 / 3) + 3),
    )
  })

  it('三级六六大顺按1至6层的概率序列增伤', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_ly, level: 3 }],
      0,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    const before = damage(core, '脉冲')
    for (let index = 0; index < 6; index++) triggerPulse(core)

    const probabilities = [1, 5 / 6, 4 / 6, 3 / 6, 2 / 6, 1 / 6]
    const multiplier = probabilities.reduce(
      (total, probability) => total + 1 + 0.7 * probability,
      0,
    )
    expect(damage(core, '脉冲') - before).toBeCloseTo(
      9092 * multiplier,
    )
  })

  it('六六大顺在随机模式保存实际层数', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_ly, level: 1 }],
      0,
      true,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    const before = damage(core, '脉冲')
    for (let index = 0; index < 4; index++) triggerPulse(core)

    expect(damage(core, '脉冲') - before).toBeCloseTo(
      9092 * (1.4 * 3 + 1),
    )
  })

  it('林峰与六六大顺对脉冲的增伤乘算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.linFeng, level: 0 },
        { id: CARD_IDS.shenMuTou_ly, level: 1 },
      ],
      0,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    const before = damage(core, '脉冲')
    triggerPulse(core)

    expect(damage(core, '脉冲') - before).toBeCloseTo(
      9092 * 1.56 * 1.4,
    )
  })

  it('三级神木骰使每次脉冲额外累加200苍木值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.shenMuTou_ly, level: 3 },
      ],
      0,
    )

    triggerPulse(core)
    triggerPulse(core)

    expect(
      card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu).woodValue,
    ).toBe((280 + 200) * 2)
  })

  it('五级神木骰每累计6次脉冲结算1次固定伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_ly, level: 5 }],
      0,
    )

    for (let index = 0; index < 12; index++) triggerPulse(core)

    expect(damage(core, '神木骰')).toBe(114514 * 2)
    expect(count(core, '神木骰')).toBe(2)
  })

  it('木本真三级按神木骰等级固定叠加3或6层', () => {
    const lowLevel = createCore(
      [
        { id: CARD_IDS.shenMuTou_ly, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 3,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      1,
    )
    const highLevel = createCore(
      [
        { id: CARD_IDS.shenMuTou_ly, level: 3 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 3,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      1,
    )

    lowLevel.exec()
    highLevel.exec()
    for (let index = 0; index < 7; index++) {
      triggerPulse(lowLevel)
      triggerPulse(highLevel)
    }

    expect(damage(lowLevel, '脉冲')).toBeCloseTo(
      9092 * (1.4 * 4 + 3),
    )
    expect(damage(highLevel, '脉冲')).toBeCloseTo(
      9092 * 1.7 * 7,
    )
  })

  it('木本真三级将固定层数叠加到当前六六大顺', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shenMuTou_ly, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 3,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      0,
    )

    for (let index = 0; index < 6; index++) triggerPulse(core)
    core.coreOptions.duration = 1
    core.exec()
    const before = damage(core, '脉冲')
    for (let index = 0; index < 6; index++) triggerPulse(core)

    expect(damage(core, '脉冲') - before).toBeCloseTo(
      9092 *
        (1.4 * 4 + (1 + 0.4 * 2 / 3) + (1 + 0.4 / 3)),
    )
  })

  it('一级苍林浮生召唤后每1.5秒攻击1次，共6次', () => {
    const core = createCore(
      [{ id: CARD_IDS.cangLinFuSheng, level: 1 }],
      10,
    )

    core.exec()

    expect(damage(core, '小纸人-攻击')).toBe(10022 * 6)
    expect(count(core, '小纸人-攻击')).toBe(6)
  })

  it('苍林浮生每20秒再次召唤小纸人', () => {
    const core = createCore(
      [{ id: CARD_IDS.cangLinFuSheng, level: 1 }],
      30,
    )

    core.exec()

    expect(count(core, '小纸人-攻击')).toBe(12)
  })

  it('三级苍林浮生结算11次纸人风暴和3次普通攻击', () => {
    const core = createCore(
      [{ id: CARD_IDS.cangLinFuSheng, level: 3 }],
      11,
    )

    core.exec()

    expect(damage(core, '小纸人-旋风收割')).toBe(
      9026 * 1.25 * 11,
    )
    expect(count(core, '小纸人-旋风收割')).toBe(11)
    expect(damage(core, '小纸人-攻击')).toBe(10022 * 1.25 * 3)
    expect(count(core, '小纸人-攻击')).toBe(3)
  })

  it('五级纸人风暴每次伤害累加80苍木值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.cangLinFuSheng, level: 5 },
      ],
      7,
    )

    core.exec()

    expect(
      card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu).woodValue,
    ).toBe(80 * 11)
  })

  it('木引青灵召唤1秒后开始攻击并每2秒攻击一次', () => {
    const first = createCore(
      [{ id: CARD_IDS.muYinQingLing, level: 1 }],
      1,
    )
    const core = createCore(
      [{ id: CARD_IDS.muYinQingLing, level: 1 }],
      27,
    )

    card<MuYinQingLing>(
      first,
      CARD_IDS.muYinQingLing,
    ).summon(1)
    card<MuYinQingLing>(
      core,
      CARD_IDS.muYinQingLing,
    ).summon(1)
    first.exec()
    core.exec()

    expect(count(first, '木引青灵')).toBe(1)
    expect(damage(core, '木引青灵')).toBe(5992 * 14)
    expect(count(core, '木引青灵')).toBe(14)
  })

  it('苍木激化召唤1只木引青灵', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.muYinQingLing, level: 1 },
      ],
      28,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(10000)
    core.exec()

    expect(count(core, '木引青灵')).toBe(14)
  })

  it('苍木激化在10秒冷却内不重复召唤木引青灵', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.muYinQingLing, level: 1 },
      ],
      28,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(20000)
    core.exec()

    expect(count(core, '木引青灵')).toBe(14)
  })

  it('苍木激化召唤冷却10秒后可再次召唤', () => {
    const core = createCore(
      [{ id: CARD_IDS.muYinQingLing, level: 1 }],
      0,
    )
    const spirit = card<MuYinQingLing>(
      core,
      CARD_IDS.muYinQingLing,
    )
    const summon = vi.spyOn(spirit, 'summon')

    spirit.onActivation()
    spirit.onActivation()
    core.queue.process(10)
    spirit.onActivation()

    expect(summon).toHaveBeenCalledTimes(2)
    expect(summon).toHaveBeenNthCalledWith(1, 1)
    expect(summon).toHaveBeenNthCalledWith(2, 1)
  })

  it('三级木引青灵每次攻击使青芜浮生冷却缩短1秒', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.muYinQingLing, level: 3 },
      ],
      28,
    )
    const reduceCooldown = vi.spyOn(
      card<QingWuFuSheng>(core, CARD_IDS.qingWuFuSheng),
      'reduceCooldown',
    )

    card<MuYinQingLing>(
      core,
      CARD_IDS.muYinQingLing,
    ).summon(1)
    core.exec()

    expect(reduceCooldown).toHaveBeenCalledTimes(14)
    expect(reduceCooldown).toHaveBeenCalledWith(1)
  })

  it('腐木瘴风在每次绽放时结算1次伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 1 },
      ],
      9,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(10000)
    core.exec()

    expect(damage(core, '腐木瘴风')).toBe(25042 * 3)
    expect(count(core, '腐木瘴风')).toBe(3)
  })

  it('多层苍木激化合并绽放时只触发1次腐木瘴风', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 1 },
      ],
      9,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(25000)
    core.exec()

    expect(damage(core, '苍木激化 · 绽放')).toBe(72108 * 3 * 2)
    expect(damage(core, '腐木瘴风')).toBe(25042 * 3)
    expect(count(core, '腐木瘴风')).toBe(3)
  })

  it('三级腐木瘴风增幅自身、苍木激化和绽放伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 3 },
      ],
      9,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(10000)
    core.exec()

    expect(damage(core, '苍木激化')).toBe(24916 * 1.4 * 9)
    expect(damage(core, '苍木激化 · 绽放')).toBe(
      72108 * 1.4 * 3,
    )
    expect(damage(core, '腐木瘴风')).toBeCloseTo(
      25042 * 1.75 * 1.4 * 3,
    )
  })

  it('青芜浮生读条完成后召唤木引青灵并在2秒后结算伤害', () => {
    const summoned = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 5 },
        { id: CARD_IDS.muYinQingLing, level: 5 },
      ],
      1,
    )
    const attacked = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 5 },
        { id: CARD_IDS.muYinQingLing, level: 5 },
      ],
      2,
    )
    const settled = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 5 },
        { id: CARD_IDS.muYinQingLing, level: 5 },
      ],
      3,
    )
    const summonedValue = vi.spyOn(
      card<QingLiangZhu>(summoned, CARD_IDS.qingLiangZhu),
      'addWoodValue',
    )
    const summonedCall = vi.spyOn(
      card<MuYinQingLing>(summoned, CARD_IDS.muYinQingLing),
      'summon',
    )
    const attackedValue = vi.spyOn(
      card<QingLiangZhu>(attacked, CARD_IDS.qingLiangZhu),
      'addWoodValue',
    )
    const settledValue = vi.spyOn(
      card<QingLiangZhu>(settled, CARD_IDS.qingLiangZhu),
      'addWoodValue',
    )

    summoned.exec()
    attacked.exec()
    settled.exec()

    expect(summonedCall).toHaveBeenCalledWith(2)
    expect(summonedValue).not.toHaveBeenCalled()
    expect(count(summoned, '木引青灵')).toBe(0)
    expect(count(attacked, '木引青灵')).toBe(2)
    expect(attackedValue).not.toHaveBeenCalled()
    expect(damage(attacked, '青芜浮生')).toBe(0)
    expect(settledValue).toHaveBeenCalledWith(10000)
    expect(damage(settled, '青芜浮生')).toBe(279564)
  })

  it('三级裂地崩附加30次回响伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.lieDiBeng, level: 3 }],
      32,
    )

    card<LieDiBeng>(
      core,
      CARD_IDS.lieDiBeng,
    ).onAttackStarted()
    core.exec()

    expect(damage(core, '裂地崩')).toBe(207708 * 1.75)
    expect(count(core, '裂地崩')).toBe(1)
    expect(damage(core, '裂地崩 · 回响')).toBe(10896 * 30)
    expect(count(core, '裂地崩 · 回响')).toBe(30)
  })

  it('五级裂地崩使召唤物每次普通攻击额外触发回响', () => {
    const core = createCore(
      [{ id: CARD_IDS.lieDiBeng, level: 5 }],
      0,
    )
    const collapse = card<LieDiBeng>(core, CARD_IDS.lieDiBeng)

    collapse.onAttackStarted()
    core.queue.process(2)
    collapse.onSummonAttack()
    collapse.onSummonAttack()
    collapse.onSummonAttack()

    expect(damage(core, '裂地崩 · 回响')).toBe(10896 * 3)
    expect(count(core, '裂地崩 · 回响')).toBe(3)
  })

  it('五级裂地崩使纸人风暴也可以触发回响', () => {
    const core = createCore(
      [
        { id: CARD_IDS.cangLinFuSheng, level: 3 },
        { id: CARD_IDS.lieDiBeng, level: 5 },
      ],
      7,
    )
    const collapse = card<LieDiBeng>(core, CARD_IDS.lieDiBeng)
    collapse.onAttackStarted()
    core.queue.process(2)

    core.exec()

    expect(count(core, '小纸人-旋风收割')).toBe(11)
    expect(count(core, '裂地崩 · 回响')).toBe(11 + 7)
  })

  it('全部苍木卡片可以重置', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.zheShan, level: 0 },
        { id: CARD_IDS.shenMuTou_dq, level: 0 },
        { id: CARD_IDS.linFeng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.liuHeJing, level: 0 },
        { id: CARD_IDS.shenMuTou_ly, level: 1 },
        { id: CARD_IDS.muYinQingLing, level: 1 },
        { id: CARD_IDS.fuMuZhangFeng, level: 1 },
        { id: CARD_IDS.cangLinFuSheng, level: 1 },
        { id: CARD_IDS.lieDiBeng, level: 1 },
      ],
      0,
    )

    expect(() => core.reset()).not.toThrow()
  })
})
