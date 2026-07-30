import { afterEach, describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../../core/Core'
import {
  getTianGongDamageBoost,
  TIAN_GONG_CARD_IDS,
} from '..'
import type { CardId } from '../Card'
import { CARD_IDS } from '../cardIds'
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
  it('青芜浮生施法2秒逐秒扣减本体伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      2,
      false,
      100,
    )

    core.exec()

    expect(damage(core, '本体伤害扣减')).toBe(-200)
    expect(count(core, '本体伤害扣减')).toBe(2)
  })

  it('青芜浮生在第4秒结算伤害并在之后每3秒攻击1次', () => {
    const core = createCore(
      [{ id: CARD_IDS.qingWuFuSheng, level: 0 }],
      23,
    )

    core.exec()

    expect(damage(core, '青芜浮生')).toBe(279564)
    expect(count(core, '青芜浮生')).toBe(1)
    expect(damage(core, '青芜浮生 · 攻击')).toBe(36667 * 6)
    expect(count(core, '青芜浮生 · 攻击')).toBe(6)
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

  it('裂地崩替代1次苍木树人攻击', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.lieDiBeng, level: 1 },
      ],
      20,
    )

    core.exec()

    expect(damage(core, '裂地崩')).toBe(207708)
    expect(count(core, '裂地崩')).toBe(1)
    expect(count(core, '青芜浮生 · 攻击')).toBe(5)
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

  it('每次脉冲分别建立5次震荡伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.shenMuTou_dq, level: 0 }],
      17,
    )

    core.exec()

    expect(damage(core, '震荡')).toBe(12005 * 3)
    expect(count(core, '震荡')).toBe(5 * 3)
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

  it('清凉珠保留溢出的苍木值并允许苍木激化重叠触发', () => {
    const core = createCore([{ id: CARD_IDS.qingLiangZhu, level: 0 }], 9)
    const pearl = card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu)

    pearl.addWoodValue(25000)
    core.exec()

    expect(pearl.woodValue).toBe(5000)
    expect(damage(core, '苍木激化')).toBe(24916 * 9 * 2)
    expect(count(core, '苍木激化')).toBe(9 * 2)
    expect(damage(core, '苍木激化 · 绽放')).toBe(72108 * 3 * 2)
    expect(count(core, '苍木激化 · 绽放')).toBe(3 * 2)
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

    expect(damage(core, '小纸人-纸人风暴')).toBe(
      4513 * 1.25 * 11,
    )
    expect(count(core, '小纸人-纸人风暴')).toBe(11)
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

  it('木引青灵召唤2秒后开始攻击并在30秒内攻击14次', () => {
    const core = createCore(
      [{ id: CARD_IDS.muYinQingLing, level: 1 }],
      28,
    )

    card<MuYinQingLing>(
      core,
      CARD_IDS.muYinQingLing,
    ).summon(1)
    core.exec()

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

  it('五级腐木瘴风和木引青灵在青芜浮生伤害结算时触发', () => {
    const before = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 5 },
        { id: CARD_IDS.muYinQingLing, level: 5 },
      ],
      4,
    )
    const after = createCore(
      [
        { id: CARD_IDS.qingWuFuSheng, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 5 },
        { id: CARD_IDS.muYinQingLing, level: 5 },
      ],
      5,
    )
    const beforeValue = vi.spyOn(
      card<QingLiangZhu>(before, CARD_IDS.qingLiangZhu),
      'addWoodValue',
    )
    const beforeSummon = vi.spyOn(
      card<MuYinQingLing>(before, CARD_IDS.muYinQingLing),
      'summon',
    )
    const afterValue = vi.spyOn(
      card<QingLiangZhu>(after, CARD_IDS.qingLiangZhu),
      'addWoodValue',
    )
    const afterSummon = vi.spyOn(
      card<MuYinQingLing>(after, CARD_IDS.muYinQingLing),
      'summon',
    )

    before.exec()
    after.exec()

    expect(beforeValue).not.toHaveBeenCalled()
    expect(beforeSummon).not.toHaveBeenCalled()
    expect(afterValue).toHaveBeenCalledWith(10000)
    expect(afterSummon).toHaveBeenCalledWith(1)
    expect(afterSummon).toHaveBeenCalledWith(2)
  })

  it('三级裂地崩附加30次回响伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.lieDiBeng, level: 3 }],
      30,
    )

    card<LieDiBeng>(
      core,
      CARD_IDS.lieDiBeng,
    ).onSkillDamageSettled()
    core.exec()

    expect(damage(core, '裂地崩')).toBe(207708 * 1.75)
    expect(count(core, '裂地崩')).toBe(1)
    expect(damage(core, '裂地崩 · 回响')).toBe(2887 * 30)
    expect(count(core, '裂地崩 · 回响')).toBe(30)
  })

  it('五级裂地崩使召唤物每次普通攻击额外触发回响', () => {
    const core = createCore(
      [{ id: CARD_IDS.lieDiBeng, level: 5 }],
      0,
    )
    const collapse = card<LieDiBeng>(core, CARD_IDS.lieDiBeng)

    collapse.onSkillDamageSettled()
    collapse.onSummonAttack()
    collapse.onSummonAttack()
    collapse.onSummonAttack()

    expect(damage(core, '裂地崩 · 回响')).toBe(2887 * 3)
    expect(count(core, '裂地崩 · 回响')).toBe(3)
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
