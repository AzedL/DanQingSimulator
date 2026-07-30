import { afterEach, describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../../core/Core'
import {
  getTianGongDamageBoost,
  TIAN_GONG_CARD_IDS,
} from '..'
import type { CardId } from '../Card'
import { CARD_IDS } from '../cardIds'
import { LeiPoJing } from './dq/LeiPoJing'
import { ZiDianChiWen } from './dq/ZiDianChiWen'
import { ZiLeiHu } from './dq/ZiLeiHu'
import { JingLeiJi } from './ly/JingLeiJi'
import { JiuXiaoLeiDong } from './ly/JiuXiaoLeiDong'
import { LeiTingZhenJi } from './ly/LeiTingZhenJi'
import { TianLeiHuYou } from './ly/TianLeiHuYou'
import { triggerChainLightning } from './shared'

function createCore(
  options: CardOptions[],
  duration: number,
  useRandom = false,
  burstDps = 0,
  sustainedDps = 0,
) {
  return new Core({
    cards: options,
    duration,
    burstDps,
    sustainedDps,
    useRandom,
  })
}

function card<T>(core: Core, id: CardId) {
  return core.cardsMap.get(id) as T
}

function damage(core: Core, key: string) {
  const value = core.damage.output().damageMap[key] ?? 0
  if (
    key === '本体伤害扣减' ||
    key === '本体伤害增幅' ||
    key === '测试-持续中' ||
    key === '测试-结束后'
  ) return value

  return Number(
    (
      value /
      (1 + getTianGongDamageBoost(core, TIAN_GONG_CARD_IDS.thunder))
    ).toFixed(9),
  )
}

function count(core: Core, key: string) {
  return core.damage.output().countMap[key] ?? 0
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('神雷技能', () => {
  it('雷佑灵光按1倍和0.3倍分两次扣减本体伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.leiYouLingGuang, level: 0 }],
      2,
      false,
      0,
      100,
    )

    core.exec()

    expect(damage(core, '本体伤害扣减')).toBeCloseTo(-130)
    expect(count(core, '本体伤害扣减')).toBe(2)
  })

  it('雷佑灵光在1秒后结算直伤并在之后每2秒触发连锁闪电', () => {
    const core = createCore(
      [{ id: CARD_IDS.leiYouLingGuang, level: 0 }],
      12,
    )

    core.exec()

    expect(damage(core, '雷佑灵光')).toBe(187960)
    expect(count(core, '雷佑灵光')).toBe(1)
    expect(damage(core, '连锁闪电-雷佑灵光')).toBe(8970 * 5)
    expect(count(core, '连锁闪电-雷佑灵光')).toBe(5)
  })

  it('雷佑灵光的连锁闪电使用引雷幡等级伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.leiYouLingGuang, level: 0 },
        { id: CARD_IDS.yinLeiFan, level: 6 },
      ],
      12,
    )

    core.exec()

    expect(damage(core, '连锁闪电-雷佑灵光')).toBe(13800 * 5)
  })

  it('雷佑灵光消费洞察且洞察只增幅技能直伤', () => {
    const core = createCore(
      [{ id: CARD_IDS.leiYouLingGuang, level: 0 }],
      4,
    )
    core.damage.addInsight(2)

    core.exec()

    expect(damage(core, '雷佑灵光')).toBe(187960 * 1.06)
    expect(damage(core, '连锁闪电-雷佑灵光')).toBe(8970)
    expect(core.damage.insightLayers).toBe(0)
  })

  it('雷佑灵光产生的全部连锁闪电不触发静电过载', () => {
    const core = createCore(
      [
        { id: CARD_IDS.leiYouLingGuang, level: 0 },
        { id: CARD_IDS.leiPoJing, level: 0 },
        { id: CARD_IDS.ziDianChiWen, level: 6 },
      ],
      20,
    )

    core.exec()

    expect(damage(core, '静电过载')).toBe(0)
  })

  it('第5次连锁闪电仍享受天雷护佑增伤', () => {
    const core = createCore(
      [
        { id: CARD_IDS.leiYouLingGuang, level: 0 },
        { id: CARD_IDS.tianLeiHuYou, level: 1 },
      ],
      12,
    )

    core.exec()

    expect(damage(core, '连锁闪电-雷佑灵光')).toBeCloseTo(
      8970 * 1.08 * 5,
    )
  })
})

describe('神雷丹青', () => {
  it('引雷幡进入战斗立即触发并每12秒再次触发', () => {
    const core = createCore([{ id: CARD_IDS.yinLeiFan, level: 0 }], 25)

    core.exec()

    expect(damage(core, '连锁闪电')).toBe(9660 * 3)
    expect(count(core, '连锁闪电')).toBe(3)
  })

  it('未携带引雷幡时连锁闪电使用-1级伤害', () => {
    const core = createCore([], 0)

    triggerChainLightning(core)

    expect(damage(core, '连锁闪电')).toBe(8970)
  })

  it('雷魄晶为每次连锁闪电独立附加4次静电过载', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.leiPoJing, level: 0 },
      ],
      9,
    )

    core.exec()

    expect(damage(core, '静电过载')).toBe(16100)
    expect(count(core, '静电过载')).toBe(4)
  })

  it('多次连锁闪电分别建立静电过载伤害序列', () => {
    const core = createCore([{ id: CARD_IDS.leiPoJing, level: 0 }], 2)
    const overload = card<LeiPoJing>(core, CARD_IDS.leiPoJing)
    const add = vi.spyOn(core.thunder, 'add')

    overload.onChain(3)
    core.exec()

    expect(add).toHaveBeenCalledTimes(3)
    expect(add).toHaveBeenNthCalledWith(1, 16100 / 4, 1, '静电过载')
  })

  it('连雷璧只增幅连锁闪电', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.lianLeiBi, level: 0 },
        { id: CARD_IDS.leiPoJing, level: 0 },
      ],
      9,
    )

    core.exec()

    expect(damage(core, '连锁闪电')).toBeCloseTo(9660 * 1.42)
    expect(damage(core, '静电过载')).toBe(16100)
  })

  it('紫电螭吻在期望模式按概率复制狂雷的每次连锁闪电', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.ziDianChiWen, level: 0 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '连锁闪电-紫电螭吻')).toBeCloseTo(
      9660 * 0.6 * (3 + 3 * 0.7),
    )
    expect(count(core, '连锁闪电-紫电螭吻')).toBeCloseTo(5.1)
  })

  it('紫电螭吻在随机模式逐次判定复制', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const core = createCore(
      [
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.ziDianChiWen, level: 0 },
      ],
      1,
      true,
    )

    core.exec()

    expect(count(core, '连锁闪电-紫电螭吻')).toBe(6)
  })

  it('紫电螭吻复制结果不再复制', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const core = createCore(
      [{ id: CARD_IDS.ziDianChiWen, level: 0 }],
      0,
      true,
    )
    const ziDian = card<ZiDianChiWen>(core, CARD_IDS.ziDianChiWen)

    ziDian.consumeFury()
    triggerChainLightning(core)

    expect(count(core, '连锁闪电')).toBe(1)
    expect(count(core, '连锁闪电-紫电螭吻')).toBe(1)
  })

  it('狂雷每30秒刷新且普通连锁闪电会消费它', () => {
    const core = createCore(
      [{ id: CARD_IDS.ziDianChiWen, level: 0 }],
      31,
    )
    const ziDian = card<ZiDianChiWen>(core, CARD_IDS.ziDianChiWen)

    expect(ziDian.consumeFury()).toBe(true)
    expect(ziDian.consumeFury()).toBe(false)
    core.exec()
    expect(ziDian.consumeFury()).toBe(true)
  })

  it('狂雷的每次连锁闪电独立触发静电过载', () => {
    const core = createCore(
      [
        { id: CARD_IDS.leiPoJing, level: 0 },
        { id: CARD_IDS.ziDianChiWen, level: 6 },
      ],
      9,
    )

    triggerChainLightning(core)
    core.exec()

    expect(damage(core, '静电过载')).toBe(16100 * 6)
    expect(count(core, '静电过载')).toBe(4 * 6)
  })

  it('紫雷葫累计神雷值、保留余数并可连续激化', () => {
    const core = createCore([{ id: CARD_IDS.ziLeiHu, level: 0 }], 0)
    const gourd = card<ZiLeiHu>(core, CARD_IDS.ziLeiHu)

    gourd.onChain(52)

    expect(gourd.thunderValue).toBe(384)
    expect(damage(core, '神雷激化')).toBe(93805 * 2)
    expect(count(core, '神雷激化')).toBe(2)
  })

  it('神雷激化触发雷霆震击和九霄雷动', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziLeiHu, level: 0 },
        { id: CARD_IDS.leiTingZhenJi, level: 1 },
        { id: CARD_IDS.jiuXiaoLeiDong, level: 1 },
      ],
      2,
    )

    card<ZiLeiHu>(core, CARD_IDS.ziLeiHu).addThunderValue(10000)
    core.exec()

    expect(damage(core, '神雷激化')).toBe(93805)
    expect(damage(core, '雷霆震击')).toBe(1302 * 2)
    expect(damage(core, '九霄雷动')).toBe(27506 * 2)
  })
})

describe('神雷灵韵', () => {
  it('雷霆震击在激化1秒后开始并每秒结算一次，共30次', () => {
    const core = createCore(
      [{ id: CARD_IDS.leiTingZhenJi, level: 1 }],
      30,
    )

    card<LeiTingZhenJi>(
      core,
      CARD_IDS.leiTingZhenJi,
    ).onActivation()
    core.exec()

    expect(damage(core, '雷霆震击')).toBe(1302 * 30)
    expect(count(core, '雷霆震击')).toBe(30)
  })

  it('三级雷霆震击每次结算2次', () => {
    const core = createCore(
      [{ id: CARD_IDS.leiTingZhenJi, level: 3 }],
      30,
    )

    card<LeiTingZhenJi>(
      core,
      CARD_IDS.leiTingZhenJi,
    ).onActivation()
    core.exec()

    expect(damage(core, '雷霆震击')).toBe(1302 * 1.75 * 2 * 30)
    expect(count(core, '雷霆震击')).toBe(60)
  })

  it('五级雷霆震击结束后爆炸并累积500神雷值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziLeiHu, level: 0 },
        { id: CARD_IDS.leiTingZhenJi, level: 5 },
      ],
      30,
    )

    card<LeiTingZhenJi>(
      core,
      CARD_IDS.leiTingZhenJi,
    ).onActivation()
    core.exec()

    expect(damage(core, '雷霆震击-爆炸')).toBe(142055)
    expect(card<ZiLeiHu>(core, CARD_IDS.ziLeiHu).thunderValue).toBe(500)
  })

  it('惊雷戟由每次连锁闪电触发', () => {
    const core = createCore(
      [{ id: CARD_IDS.jingLeiJi, level: 2 }],
      0,
    )

    card<JingLeiJi>(core, CARD_IDS.jingLeiJi).onChain(2)

    expect(damage(core, '惊雷戟')).toBe(1816 * 1.375 * 2)
    expect(count(core, '惊雷戟')).toBe(2)
  })

  it('三级惊雷戟的每层效果独立结算16次固定伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.jingLeiJi, level: 3 }],
      8,
    )
    const spear = card<JingLeiJi>(core, CARD_IDS.jingLeiJi)
    const add = vi.spyOn(core.thunder, 'add')

    spear.onChain(3)
    core.exec()

    expect(damage(core, '惊雷戟3')).toBe(95 * 16 * 3)
    expect(count(core, '惊雷戟3')).toBe(16 * 3)
    expect(
      add.mock.calls.filter((call) => call[2] === '惊雷戟3'),
    ).toHaveLength(16 * 3)
  })

  it('五级惊雷戟每次触发结算3次并建立3层持续伤害', () => {
    const core = createCore(
      [{ id: CARD_IDS.jingLeiJi, level: 5 }],
      8,
    )

    card<JingLeiJi>(core, CARD_IDS.jingLeiJi).onChain(1)
    core.exec()

    expect(damage(core, '惊雷戟')).toBe(1816 * 2.5 * 3)
    expect(count(core, '惊雷戟')).toBe(3)
    expect(damage(core, '惊雷戟3')).toBe(95 * 16 * 3)
  })

  it('天雷护佑与连雷璧对连锁闪电乘算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.lianLeiBi, level: 0 },
        { id: CARD_IDS.tianLeiHuYou, level: 1 },
      ],
      0,
    )

    card<TianLeiHuYou>(
      core,
      CARD_IDS.tianLeiHuYou,
    ).onSkillDamageSettled()
    triggerChainLightning(core, { useFury: false })

    expect(damage(core, '连锁闪电')).toBeCloseTo(9660 * 1.42 * 1.08)
  })

  it('五级天雷护佑在持续期间为四系伤害增加70%', () => {
    const core = createCore(
      [{ id: CARD_IDS.tianLeiHuYou, level: 5 }],
      10,
    )
    const blessing = card<TianLeiHuYou>(core, CARD_IDS.tianLeiHuYou)

    blessing.onSkillDamageSettled()
    core.fire.add(100, 1, '测试-持续中')
    core.exec()
    core.wood.add(100, 1, '测试-结束后')

    expect(damage(core, '测试-持续中')).toBeCloseTo(170)
    expect(damage(core, '测试-结束后')).toBeCloseTo(100)
  })

  it('三级天雷护佑每秒直接结算基础秒伤的5%且不计算增伤', () => {
    const core = createCore(
      [{ id: CARD_IDS.tianLeiHuYou, level: 5 }],
      10,
      false,
      1000,
    )

    card<TianLeiHuYou>(
      core,
      CARD_IDS.tianLeiHuYou,
    ).onSkillDamageSettled()
    core.exec()

    expect(damage(core, '本体伤害增幅')).toBe(1000 * 0.05 * 10)
    expect(count(core, '本体伤害增幅')).toBe(10)
  })

  it('五雷珠立即触发并每20秒再次触发', () => {
    const core = createCore([{ id: CARD_IDS.wuLeiZhu, level: 1 }], 21)

    core.exec()

    expect(damage(core, '五雷珠')).toBe(10832 * 2)
    expect(count(core, '五雷珠')).toBe(2)
  })

  it('三级五雷珠额外结算固定爆炸伤害', () => {
    const core = createCore([{ id: CARD_IDS.wuLeiZhu, level: 3 }], 1)

    core.exec()

    expect(damage(core, '五雷珠')).toBe(10832 * 1.75)
    expect(damage(core, '五雷珠-爆炸')).toBe(64900)
  })

  it('五级五雷珠仅在携带紫电螭吻时触发80%狂雷', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziDianChiWen, level: 0 },
        { id: CARD_IDS.wuLeiZhu, level: 5 },
      ],
      1,
    )

    core.exec()

    expect(damage(core, '五雷珠-连锁闪电')).toBeCloseTo(
      8970 * 0.6 * 0.8 * 3,
    )
    expect(damage(core, '连锁闪电-紫电螭吻')).toBeCloseTo(
      8970 * 0.6 * 0.8 * 3 * 0.7,
    )
  })

  it('五雷珠狂雷不触发静电过载且不消费正常狂雷', () => {
    const core = createCore(
      [
        { id: CARD_IDS.leiPoJing, level: 0 },
        { id: CARD_IDS.ziDianChiWen, level: 0 },
        { id: CARD_IDS.wuLeiZhu, level: 5 },
      ],
      1,
    )
    const ziDian = card<ZiDianChiWen>(core, CARD_IDS.ziDianChiWen)

    core.exec()

    expect(damage(core, '静电过载')).toBe(0)
    expect(ziDian.consumeFury()).toBe(true)
  })

  it('九霄雷动在激化2秒后一次结算全部雷电', () => {
    const core = createCore(
      [{ id: CARD_IDS.jiuXiaoLeiDong, level: 1 }],
      2,
    )

    card<JiuXiaoLeiDong>(
      core,
      CARD_IDS.jiuXiaoLeiDong,
    ).onActivation()
    core.exec()

    expect(damage(core, '九霄雷动')).toBe(27506 * 2)
    expect(count(core, '九霄雷动')).toBe(2)
  })

  it('五级九霄雷动结算4道雷电并累积100神雷值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziLeiHu, level: 0 },
        { id: CARD_IDS.jiuXiaoLeiDong, level: 5 },
      ],
      2,
    )

    card<JiuXiaoLeiDong>(
      core,
      CARD_IDS.jiuXiaoLeiDong,
    ).onActivation()
    core.exec()

    expect(damage(core, '九霄雷动')).toBe(27506 * 2.5 * 4)
    expect(count(core, '九霄雷动')).toBe(4)
    expect(card<ZiLeiHu>(core, CARD_IDS.ziLeiHu).thunderValue).toBe(100)
  })

  it('全部神雷卡片可以重置', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziDianChiWen, level: 0 },
        { id: CARD_IDS.leiYouLingGuang, level: 0 },
        { id: CARD_IDS.yinLeiFan, level: 0 },
        { id: CARD_IDS.wuLeiZhu, level: 1 },
        { id: CARD_IDS.leiPoJing, level: 0 },
        { id: CARD_IDS.lianLeiBi, level: 0 },
        { id: CARD_IDS.ziLeiHu, level: 0 },
        { id: CARD_IDS.leiTingZhenJi, level: 1 },
        { id: CARD_IDS.jingLeiJi, level: 1 },
        { id: CARD_IDS.tianLeiHuYou, level: 1 },
        { id: CARD_IDS.jiuXiaoLeiDong, level: 1 },
      ],
      0,
    )

    expect(() => core.reset()).not.toThrow()
  })
})
