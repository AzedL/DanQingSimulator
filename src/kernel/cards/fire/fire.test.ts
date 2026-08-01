import { afterEach, describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../../core/Core'
import {
  getTianGongDamageBoost,
  TIAN_GONG_CARD_IDS,
} from '..'
import type { CardId } from '../Card'
import { CARD_IDS } from '../cardIds'
import { ErWeiYaoHu } from './dq/ErWeiYaoHu'
import { LiuWeiMoHu } from './dq/LiuWeiMoHu'
import { MengHu } from './dq/MengHu'
import { XingHongJuYi } from './dq/XingHongJuYi'
import { ChiYanTianHuan } from './ly/ChiYanTianHuan'
import { LieHuoLiaoYuan } from './ly/LieHuoLiaoYuan'
import { LieYanFenShen } from './ly/LieYanFenShen'
import { ShenHuoBengFa } from './ly/ShenHuoBengFa'
import { TianHuoYunXing } from './ly/TianHuoYunXing'

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
      (1 + getTianGongDamageBoost(core, TIAN_GONG_CARD_IDS.fire))
    ).toFixed(9),
  )
}

function count(core: Core, key: string) {
  return core.damage.output().countMap[key] ?? 0
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('天火技能', () => {
  it('灼灼天炎施法5秒逐秒扣减本体伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.zhuoZhuoTianYan, level: 0 }],
      5,
      false,
      100,
    )

    core.exec()

    expect(damage(core, '本体伤害扣减')).toBe(-500)
    expect(count(core, '本体伤害扣减')).toBe(5)
  })

  it('灼灼天炎立即造成首次伤害并在5秒内完成6次伤害', () => {
    const core = createCore([{ id: CARD_IDS.zhuoZhuoTianYan, level: 0 }], 6)

    core.exec()

    expect(damage(core, '灼灼天炎')).toBe(693014)
    expect(count(core, '灼灼天炎')).toBe(6)
    expect(core.damage.output().damageMapList.map((item) => item['灼灼天炎'])).toEqual([
      105000,
      210000,
      315000,
      420000,
      525000,
      693014,
    ])
  })

  it('灼灼天炎释放时消费全部洞察并应用于本次全部伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.zhuoZhuoTianYan, level: 0 }],
      6,
    )
    core.damage.addInsight(3)

    core.exec()

    expect(damage(core, '灼灼天炎')).toBeCloseTo(693014 * 1.09)
    expect(core.damage.insightLayers).toBe(0)
  })
})

describe('天火丹青', () => {
  it('猩红巨蚁立即添加燃烧并按8秒冷却再次添加', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.erWeiYaoHu, level: 0 },
      ],
      10,
    )

    core.exec()

    expect(damage(core, '引燃')).toBe(3696 * 2)
    expect(count(core, '引燃')).toBe(2)
    expect(damage(core, '燃烧')).toBeCloseTo(2209 * 2 + 2209 * 1.05)
    expect(count(core, '燃烧')).toBe(3)
    expect(card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi).burnLayers).toBe(2)
  })

  it('六尾魔狐引爆当前层数减一并保留燃烧结算冷却', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.liuWeiMoHu, level: 0 },
      ],
      4,
    )
    const ant = card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi)

    ant.addBurn(6)
    core.exec()

    expect(damage(core, '爆燃')).toBe(8055 * 6)
    expect(count(core, '爆燃')).toBe(1)
    expect(damage(core, '燃烧')).toBe(2209)
    expect(ant.burnLayers).toBe(1)
  })

  it('猛虎保留溢出天火值并以新天火激化覆盖旧激化', () => {
    const core = createCore([{ id: CARD_IDS.mengHu, level: 0 }], 10)
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    tiger.addFireValue(25000)
    core.exec()

    expect(tiger.fireValue).toBe(5000)
    expect(damage(core, '天火激化')).toBe(39181 * 5)
    expect(count(core, '天火激化')).toBe(5)
  })

  it('猛虎分别接收燃烧和爆燃提供的天火值', () => {
    const core = createCore([{ id: CARD_IDS.mengHu, level: 0 }], 0)
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    tiger.onBurnDamage()
    tiger.onExplosion()

    expect(tiger.fireValue).toBe(98 + 532)
  })

  it('岁兽在期望模式按概率添加燃烧层数', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.erWeiYaoHu, level: 0 },
        { id: CARD_IDS.suiShou, level: 0 },
      ],
      4,
    )

    core.exec()

    expect(card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi).burnLayers).toBeCloseTo(1.7)
    expect(damage(core, '引燃')).toBeCloseTo(3696 * 1.7)
    expect(count(core, '引燃')).toBeCloseTo(1.7)
  })

  it('岁兽在随机模式逐次判定额外燃烧', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.suiShou, level: 0 },
      ],
      4,
      true,
    )

    core.exec()

    expect(card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi).burnLayers).toBe(2)
  })
})

describe('天火灵韵', () => {
  it('赤焰天环3每个结算点独立造成2次伤害和2次燃烧判定', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.erWeiYaoHu, level: 0 },
        { id: CARD_IDS.chiYanTianHuan, level: 3 },
      ],
      10,
    )
    const ring = card<ChiYanTianHuan>(core, CARD_IDS.chiYanTianHuan)

    for (let index = 0; index < 5; index++) {
      ring.onActivationDamage()
    }
    core.exec()

    expect(damage(core, '赤焰天环')).toBe(3080 * 1.75 * 10)
    expect(count(core, '赤焰天环')).toBe(10)
    expect(damage(core, '引燃')).toBeCloseTo(3696 * 4)
    expect(count(core, '引燃')).toBeCloseTo(4)
  })

  it('烈火燎原在灼灼天炎结束后连续造成8次伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.zhuoZhuoTianYan, level: 0 },
        { id: CARD_IDS.lieHuoLiaoYuan, level: 1 },
      ],
      14,
    )

    core.exec()

    expect(damage(core, '灼灼天炎')).toBe(693014)
    expect(damage(core, '烈火燎原')).toBe(29308 * 8)
    expect(count(core, '烈火燎原')).toBe(8)
  })

  it('烈火燎原5在灼灼天炎释放时使伤害提高33%', () => {
    const core = createCore(
      [
        { id: CARD_IDS.zhuoZhuoTianYan, level: 0 },
        { id: CARD_IDS.lieHuoLiaoYuan, level: 5 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '灼灼天炎')).toBeCloseTo(105000 * 1.33)
  })

  it('烈火燎原3每次伤害累加1500天火值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.lieHuoLiaoYuan, level: 3 },
      ],
      8,
    )
    const field = card<LieHuoLiaoYuan>(core, CARD_IDS.lieHuoLiaoYuan)

    field.onSkillEnd()
    core.exec()

    expect(tigerValue(core)).toBe(2000)
    expect(count(core, '烈火燎原')).toBe(8)
  })

  it('烈火燎原5的增伤在15秒后结束', () => {
    const core = createCore([{ id: CARD_IDS.lieHuoLiaoYuan, level: 5 }], 15)
    const field = card<LieHuoLiaoYuan>(core, CARD_IDS.lieHuoLiaoYuan)

    field.onSkillStart()
    expect(core.damage.boost).toBe(0.33)
    core.exec()

    expect(core.damage.boost).toBe(0)
  })

  it('烈焰焚身首次在第16秒获得并将3层合并结算', () => {
    const core = createCore([{ id: CARD_IDS.lieYanFenShen, level: 1 }], 17)

    core.exec()

    expect(damage(core, '烈焰焚身')).toBe(1082 * 3)
    expect(count(core, '烈焰焚身')).toBe(1)
  })

  it('烈焰焚身3在爆燃时添加2层并合并结算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.liuWeiMoHu, level: 0 },
        { id: CARD_IDS.lieYanFenShen, level: 3 },
      ],
      3,
    )

    card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi).addBurn(6)
    core.exec()

    expect(damage(core, '烈焰焚身')).toBe(1082 * 1.75 * 2)
    expect(count(core, '烈焰焚身')).toBe(1)
  })

  it('烈焰焚身5由灼灼天炎的6次伤害添加12层并合并结算', () => {
    const core = createCore([{ id: CARD_IDS.lieYanFenShen, level: 5 }], 12)
    const burning = card<LieYanFenShen>(core, CARD_IDS.lieYanFenShen)

    for (let index = 0; index < 6; index++) burning.onSkillDamage()
    core.exec()

    expect(damage(core, '烈焰焚身')).toBeCloseTo(1082 * 2.5 * 12 * 12)
    expect(count(core, '烈焰焚身')).toBe(12)
  })

  it('神火迸发5立即结算并在2秒后再次结算且提高天火激化伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.shenHuoBengFa, level: 5 },
      ],
      10,
    )

    card<MengHu>(core, CARD_IDS.mengHu).addFireValue(10000)
    core.exec()

    expect(damage(core, '神火迸发')).toBe(65290 * 2.5 * 2)
    expect(count(core, '神火迸发')).toBe(2)
    expect(damage(core, '天火激化')).toBeCloseTo(39181 * 1.2 * 5)
  })

  it('赤焰天环5把自身和天火激化改为1.5秒间隔并持续12秒', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.chiYanTianHuan, level: 5 },
      ],
      12,
    )

    card<MengHu>(core, CARD_IDS.mengHu).addFireValue(10000)
    core.exec()

    expect(count(core, '天火激化')).toBe(8)
    expect(count(core, '赤焰天环')).toBe(16)
  })

  it('天火激化仅剩最后一跳时被覆盖会与赤焰天环立即结算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.chiYanTianHuan, level: 1 },
      ],
      8,
    )
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    tiger.addFireValue(10000)
    core.exec()
    expect(count(core, '天火激化')).toBe(4)
    expect(count(core, '赤焰天环')).toBe(4)

    tiger.addFireValue(10000)

    expect(count(core, '天火激化')).toBe(5)
    expect(count(core, '赤焰天环')).toBe(5)
  })

  it('天火激化剩余两跳时被覆盖不会立即结算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.chiYanTianHuan, level: 1 },
      ],
      6,
    )
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    tiger.addFireValue(10000)
    core.exec()
    tiger.addFireValue(10000)

    expect(count(core, '天火激化')).toBe(3)
    expect(count(core, '赤焰天环')).toBe(3)
  })

  it('天火激化覆盖后重新等待完整间隔并废弃旧任务', () => {
    const core = createCore(
      [{ id: CARD_IDS.mengHu, level: 0 }],
      7,
    )
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    tiger.addFireValue(10000)
    core.exec()
    expect(count(core, '天火激化')).toBe(3)

    tiger.addFireValue(10000)
    core.exec()

    expect(count(core, '天火激化')).toBe(6)
  })

  it('天火陨星3立即结算本体并生成5次固定伤害', () => {
    const core = createCore([{ id: CARD_IDS.tianHuoYunXing, level: 3 }], 11)

    core.exec()

    expect(damage(core, '天火陨星')).toBe(26594 * 1.75)
    expect(count(core, '天火陨星')).toBe(1)
    expect(damage(core, '天火陨星3')).toBe(5342 * 5)
    expect(count(core, '天火陨星3')).toBe(5)
  })

  it('天火陨星5在天火激化时与正常效果形成两层并合并结算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.tianHuoYunXing, level: 5 },
      ],
      11,
    )

    card<TianHuoYunXing>(core, CARD_IDS.tianHuoYunXing).onActivation()
    core.exec()

    expect(damage(core, '天火陨星')).toBe(26594 * 2.5 * 2)
    expect(count(core, '天火陨星')).toBe(2)
    expect(damage(core, '天火陨星3')).toBe(5342 * 10)
    expect(count(core, '天火陨星3')).toBe(5)
  })

  it('天火陨星3最多按2层结算', () => {
    const core = createCore(
      [{ id: CARD_IDS.tianHuoYunXing, level: 5 }],
      11,
    )
    const meteor = card<TianHuoYunXing>(
      core,
      CARD_IDS.tianHuoYunXing,
    )

    meteor.onActivation()
    meteor.onActivation()
    meteor.onActivation()
    core.exec()

    expect(damage(core, '天火陨星')).toBe(26594 * 2.5 * 4)
    expect(damage(core, '天火陨星3')).toBe(5342 * 2 * 5)
    expect(count(core, '天火陨星3')).toBe(5)
  })

  it('重置后清空卡片状态并恢复首次触发行为', () => {
    const core = createCore(
      [
        { id: CARD_IDS.xingHongJuYi, level: 0 },
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.tianHuoYunXing, level: 1 },
        { id: CARD_IDS.lieYanFenShen, level: 1 },
      ],
      1,
    )
    const ant = card<XingHongJuYi>(core, CARD_IDS.xingHongJuYi)
    const tiger = card<MengHu>(core, CARD_IDS.mengHu)

    core.exec()
    tiger.addFireValue(5000)
    ant.addBurn(3)
    core.reset()
    core.exec()

    expect(ant.burnLayers).toBe(1)
    expect(tiger.fireValue).toBe(2000)
    expect(count(core, '天火陨星')).toBe(1)
  })

  it('低等级灵韵不触发未解锁的升级效果', () => {
    const core = createCore(
      [
        { id: CARD_IDS.erWeiYaoHu, level: 0 },
        { id: CARD_IDS.liuWeiMoHu, level: 0 },
        { id: CARD_IDS.suiShou, level: 0 },
        { id: CARD_IDS.chiYanTianHuan, level: 1 },
        { id: CARD_IDS.lieHuoLiaoYuan, level: 1 },
        { id: CARD_IDS.lieYanFenShen, level: 1 },
        { id: CARD_IDS.shenHuoBengFa, level: 1 },
        { id: CARD_IDS.tianHuoYunXing, level: 1 },
      ],
      10,
    )
    const ring = card<ChiYanTianHuan>(core, CARD_IDS.chiYanTianHuan)
    const burning = card<LieYanFenShen>(core, CARD_IDS.lieYanFenShen)
    const meteor = card<TianHuoYunXing>(core, CARD_IDS.tianHuoYunXing)

    card<ErWeiYaoHu>(core, CARD_IDS.erWeiYaoHu).onBurnAttempt(0)
    card<LiuWeiMoHu>(core, CARD_IDS.liuWeiMoHu).onBurnChanged()
    burning.onExplosion()
    burning.onSkillDamage()
    card<ShenHuoBengFa>(core, CARD_IDS.shenHuoBengFa).onActivation()
    meteor.onActivation()
    for (let index = 0; index < 5; index++) {
      ring.onActivationDamage()
    }
    core.exec()

    expect(count(core, '神火迸发')).toBe(1)
    expect(count(core, '赤焰天环')).toBe(5)
    expect(count(core, '天火陨星')).toBe(1)
    expect(count(core, '天火陨星3')).toBe(0)

    core.reset()
  })
})

function tigerValue(core: Core) {
  return card<MengHu>(core, CARD_IDS.mengHu).fireValue
}
