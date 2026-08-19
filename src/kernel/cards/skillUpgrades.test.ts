import { describe, expect, it, vi } from 'vitest'
import { Core, type CardOptions } from '../core/Core'
import { CARD_IDS } from './cardIds'
import { SKILL_UPGRADES } from './skillUpgrades'
import type { CardId } from './Card'
import { ZhuoZhuoTianYan } from './fire/ZhuoZhuoTianYan'
import { MengHu } from './fire/dq/MengHu'
import { JingLeiJi } from './thunder/ly/JingLeiJi'
import { ZiXiaoHu } from './thunder/dq/ZiXiaoHu'
import { QingLiangZhu } from './wood/dq/QingLiangZhu'
import { QingWuFuSheng } from './wood/QingWuFuSheng'
import { ShangGuanCe } from './ice/dq/ShangGuanCe'
import { LieDiBeng } from './wood/ly/LieDiBeng'
import { MuYinQingLing } from './wood/ly/MuYinQingLing'
import { JiuXiaoLeiDong } from './thunder/ly/JiuXiaoLeiDong'
import { LeiTingZhenJi } from './thunder/ly/LeiTingZhenJi'
import { ChiYanTianHuan } from './fire/ly/ChiYanTianHuan'
import { FuMuZhangFeng } from './wood/ly/FuMuZhangFeng'
import { LeiYouLingGuang } from './thunder/LeiYouLingGuang'
import { NingBingShuangHua } from './ice/NingBingShuangHua'
import { LieYanFenShen } from './fire/ly/LieYanFenShen'
import { TianHuoYunXing } from './fire/ly/TianHuoYunXing'
import { LieHuoLiaoYuan } from './fire/ly/LieHuoLiaoYuan'
import { TianLeiHuYou } from './thunder/ly/TianLeiHuYou'

function createCore(
  cards: CardOptions[],
  duration = 0,
  useRandom = false,
) {
  return new Core({
    cards,
    duration,
    burstDps: 0,
    sustainedDps: 0,
    useRandom,
  })
}

function card<T>(core: Core, id: CardId) {
  return core.cardsMap.get(id) as T
}

function damage(core: Core, key: string) {
  return core.damage.output().damageMap[key] ?? 0
}

function count(core: Core, key: string) {
  return core.damage.output().countMap[key] ?? 0
}

function processQueue(core: Core, duration: number) {
  for (let tick = 0; tick < duration * 2; tick++) {
    core.queue.process(0.5)
  }
}

describe('主动技能升级', () => {
  it('每个技能只保存一个互斥的本真或灵通分支', () => {
    const core = createCore([
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])

    expect(
      card<ZhuoZhuoTianYan>(
        core,
        CARD_IDS.zhuoZhuoTianYan,
      ).upgrade,
    ).toBe(SKILL_UPGRADES.lingTong)
  })

  it('火灵通按期望触发焚心并在三级获得洞察', () => {
    const core = createCore([
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])
    const skill = card<ZhuoZhuoTianYan>(
      core,
      CARD_IDS.zhuoZhuoTianYan,
    )

    expect(core.damage.insightLayers).toBe(15)
    skill.onResonanceDamage()

    expect(damage(core, '焚心')).toBeCloseTo(18352 * 0.1)
    expect(count(core, '焚心')).toBeCloseTo(0.1)
    expect(core.damage.insightLayers).toBeCloseTo(15.1)
  })

  it('火灵通在随机模式逐次判定焚心', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
    const core = createCore(
      [
        {
          id: CARD_IDS.zhuoZhuoTianYan,
          level: 1,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      0,
      true,
    )

    card<ZhuoZhuoTianYan>(
      core,
      CARD_IDS.zhuoZhuoTianYan,
    ).onResonanceDamage()

    expect(damage(core, '焚心')).toBe(18352)
    expect(count(core, '焚心')).toBe(1)
  })

  it('火灵通二级提高灼灼天炎基础伤害', () => {
    const core = createCore(
      [
        {
          id: CARD_IDS.zhuoZhuoTianYan,
          level: 2,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      6,
    )

    core.exec()

    expect(damage(core, '灼灼天炎')).toBeCloseTo(693014 * 1.1)
  })

  it('赤焰天环的两次独立伤害分别判定焚心', () => {
    const core = createCore([
      { id: CARD_IDS.chiYanTianHuan, level: 3 },
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 1,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])

    card<ChiYanTianHuan>(
      core,
      CARD_IDS.chiYanTianHuan,
    ).onActivationDamage()

    expect(count(core, '焚心')).toBeCloseTo(0.2)
  })

  it('六种天火持续伤害来源分别判定焚心', () => {
    const skill = {
      id: CARD_IDS.zhuoZhuoTianYan,
      level: 1,
      upgrade: SKILL_UPGRADES.lingTong,
    } as const

    const burn = createCore(
      [skill, { id: CARD_IDS.xingHongJuYi, level: 0 }],
      4,
    )
    burn.exec()

    const burning = createCore([
      skill,
      { id: CARD_IDS.lieYanFenShen, level: 1 },
    ])
    card<LieYanFenShen>(
      burning,
      CARD_IDS.lieYanFenShen,
    ).addLayers(1)
    processQueue(burning, 1)

    const meteor = createCore([
      skill,
      { id: CARD_IDS.tianHuoYunXing, level: 5 },
    ])
    card<TianHuoYunXing>(
      meteor,
      CARD_IDS.tianHuoYunXing,
    ).onActivation()
    meteor.coreOptions.duration = 3
    meteor.exec()

    const activation = createCore([
      skill,
      { id: CARD_IDS.mengHu, level: 0 },
    ])
    card<MengHu>(activation, CARD_IDS.mengHu).addFireValue(10000)
    processQueue(activation, 2)

    const ring = createCore([
      skill,
      { id: CARD_IDS.chiYanTianHuan, level: 3 },
    ])
    card<ChiYanTianHuan>(
      ring,
      CARD_IDS.chiYanTianHuan,
    ).onActivationDamage()

    const field = createCore([
      skill,
      { id: CARD_IDS.lieHuoLiaoYuan, level: 1 },
    ])
    card<LieHuoLiaoYuan>(
      field,
      CARD_IDS.lieHuoLiaoYuan,
    ).onSkillEnd()
    processQueue(field, 1)

    expect(count(burn, '焚心')).toBeCloseTo(0.1)
    expect(count(burning, '焚心')).toBeCloseTo(0.1)
    expect(count(meteor, '焚心')).toBeCloseTo(0.1)
    expect(count(activation, '焚心')).toBeCloseTo(0.1)
    expect(count(ring, '焚心')).toBeCloseTo(0.2)
    expect(count(field, '焚心')).toBeCloseTo(0.1)
  })

  it('火本真将神火迸发与技能的激化基础增伤乘算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.shenHuoBengFa, level: 3 },
        {
          id: CARD_IDS.zhuoZhuoTianYan,
          level: 2,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      2,
    )

    card<MengHu>(core, CARD_IDS.mengHu).addFireValue(10000)
    core.exec()

    expect(damage(core, '天火激化')).toBeCloseTo(
      39181 * 1.2 * 1.1 * 1.006,
    )
  })

  it('火本真三级在激化时立即增幅同步伤害', () => {
    const core = createCore([
      { id: CARD_IDS.mengHu, level: 0 },
      { id: CARD_IDS.shenHuoBengFa, level: 1 },
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 3,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    card<MengHu>(core, CARD_IDS.mengHu).addFireValue(10000)
    processQueue(core, 1)

    expect(damage(core, '神火迸发')).toBeCloseTo(65290 * 1.12 * 1.002)
  })

  it('火本真和雷本真重复触发时刷新公共增伤持续时间', () => {
    const fire = createCore([
      { id: CARD_IDS.mengHu, level: 0 },
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 3,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])
    const tiger = card<MengHu>(fire, CARD_IDS.mengHu)
    tiger.addFireValue(10000)
    processQueue(fire, 4)
    tiger.addFireValue(10000)
    processQueue(fire, 1)
    expect(fire.damage.boost).toBeCloseTo(0.12)
    processQueue(fire, 4)
    expect(fire.damage.boost).toBeCloseTo(0)

    const thunder = createCore([
      { id: CARD_IDS.ziXiaoHu, level: 0 },
      {
        id: CARD_IDS.leiYouLingGuang,
        level: 1,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])
    const gourd = card<ZiXiaoHu>(thunder, CARD_IDS.ziXiaoHu)
    gourd.addThunderValue(10000)
    processQueue(thunder, 4)
    gourd.addThunderValue(10000)
    processQueue(thunder, 1)
    expect(thunder.damage.boost).toBeCloseTo(0.2)
    processQueue(thunder, 4)
    expect(thunder.damage.boost).toBeCloseTo(0)
  })

  it('雷本真一级与天雷护佑五级乘算', () => {
    const core = createCore([
      { id: CARD_IDS.ziXiaoHu, level: 0 },
      { id: CARD_IDS.tianLeiHuYou, level: 5 },
      {
        id: CARD_IDS.leiYouLingGuang,
        level: 1,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    const gourd = card<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu)
    gourd.addThunderValue(10000)
    card<TianLeiHuYou>(core, CARD_IDS.tianLeiHuYou).onSkillDamage()

    expect(core.damage.boost).toBeCloseTo((1 + 0.2) * (1 + 0.7) - 1)
  })

  it('火本真三级与烈火燎原五级乘算', () => {
    const core = createCore([
      { id: CARD_IDS.mengHu, level: 0 },
      { id: CARD_IDS.lieHuoLiaoYuan, level: 5 },
      {
        id: CARD_IDS.zhuoZhuoTianYan,
        level: 3,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    const tiger = card<MengHu>(core, CARD_IDS.mengHu)
    tiger.addFireValue(10000)
    card<LieHuoLiaoYuan>(core, CARD_IDS.lieHuoLiaoYuan).onSkillStart()

    expect(core.damage.boost).toBeCloseTo((1 + 0.12) * (1 + 0.33) - 1)
  })

  it('火本真一级在六段伤害后累计5000天火值', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        {
          id: CARD_IDS.zhuoZhuoTianYan,
          level: 1,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      6,
    )

    core.exec()

    expect(card<MengHu>(core, CARD_IDS.mengHu).fireValue).toBe(5000)
  })

  it('雷灵通累计50次惊雷戟本体命中触发雷暴', () => {
    const core = createCore([
      { id: CARD_IDS.jingLeiJi, level: 1 },
      {
        id: CARD_IDS.leiYouLingGuang,
        level: 1,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])

    card<JingLeiJi>(core, CARD_IDS.jingLeiJi).onChain(50)

    expect(damage(core, '雷暴')).toBeCloseTo(68154 * 1.002)
    expect(count(core, '雷暴')).toBe(1)
  })

  it('雷灵通三级期间为惊雷戟增加一次本体和持续伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.jingLeiJi, level: 3 },
        {
          id: CARD_IDS.leiYouLingGuang,
          level: 3,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      1,
    )

    core.exec()
    card<JingLeiJi>(core, CARD_IDS.jingLeiJi).onChain(1)

    expect(count(core, '惊雷戟')).toBe(2)
    core.coreOptions.duration = 1
    core.exec()
    expect(count(core, '惊雷戟3')).toBe(2)
    expect(damage(core, '惊雷戟3')).toBeCloseTo(95 * 2 * 2 * 1.006)
  })

  it('雷灵通三级对第5次连锁闪电生效并在之后结束', () => {
    const core = createCore(
      [
        { id: CARD_IDS.jingLeiJi, level: 1 },
        {
          id: CARD_IDS.leiYouLingGuang,
          level: 3,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      12,
    )
    const spear = card<JingLeiJi>(core, CARD_IDS.jingLeiJi)

    core.exec()
    expect(count(core, '惊雷戟')).toBe(10)

    spear.onChain(1)
    expect(count(core, '惊雷戟')).toBe(11)
  })

  it('雷本真一二级增幅本次神雷激化', () => {
    const core = createCore([
      { id: CARD_IDS.ziXiaoHu, level: 0 },
      {
        id: CARD_IDS.leiYouLingGuang,
        level: 2,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    card<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu).addThunderValue(10000)

    expect(damage(core, '神雷激化')).toBeCloseTo(93805 * 1.1 * 1.2)
  })

  it('雷本真三级使九霄雷动和雷霆震击累加值翻倍', () => {
    const core = createCore(
      [
        { id: CARD_IDS.ziXiaoHu, level: 0 },
        { id: CARD_IDS.jiuXiaoLeiDong, level: 3 },
        { id: CARD_IDS.leiTingZhenJi, level: 5 },
        {
          id: CARD_IDS.leiYouLingGuang,
          level: 3,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      2,
    )
    card<JiuXiaoLeiDong>(
      core,
      CARD_IDS.jiuXiaoLeiDong,
    ).onActivation()
    const shock = card<LeiTingZhenJi>(
      core,
      CARD_IDS.leiTingZhenJi,
    )
    shock.onActivation()
    shock.onActivation()

    core.exec()

    expect(card<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu).thunderValue).toBe(
      1600,
    )
  })

  it('木本真二级只提高苍木激化绽放', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 2,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      3,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(10000)
    core.exec()

    expect(damage(core, '苍木激化')).toBe(24916 * 3)
    expect(damage(core, '苍木激化 · 绽放')).toBeCloseTo(72108 * 1.1)
  })

  it('木本真二级与腐木瘴风三级乘算', () => {
    const core = createCore(
      [
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        { id: CARD_IDS.fuMuZhangFeng, level: 3 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 2,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      3,
    )

    card<QingLiangZhu>(
      core,
      CARD_IDS.qingLiangZhu,
    ).addWoodValue(10000)
    core.exec()

    expect(damage(core, '苍木激化 · 绽放')).toBeCloseTo(
      72108 * 1.4 * 1.1 * 1.006,
    )
  })

  it('木灵通一级提高三种召唤物攻击次数', () => {
    const paperLowLevel = createCore(
      [
        { id: CARD_IDS.cangLinFuSheng, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 1,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      13,
    )
    const paper = createCore(
      [
        { id: CARD_IDS.cangLinFuSheng, level: 3 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 1,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      13,
    )
    const tree = createCore(
      [
        { id: CARD_IDS.lieDiBeng, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 1,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      26,
    )
    const spirit = createCore(
      [
        { id: CARD_IDS.muYinQingLing, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 1,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      37,
    )

    paperLowLevel.exec()
    paper.exec()
    tree.exec()
    card<MuYinQingLing>(
      spirit,
      CARD_IDS.muYinQingLing,
    ).summon(1)
    spirit.exec()

    expect(count(paperLowLevel, '小纸人-攻击')).toBe(8)
    expect(count(paper, '小纸人-旋风收割')).toBe(11)
    expect(count(paper, '小纸人-攻击')).toBe(4)
    expect(count(tree, '裂地崩')).toBe(1)
    expect(count(tree, '青芜浮生 · 攻击')).toBe(6)
    expect(count(spirit, '木引青灵')).toBe(16)
  })

  it('木灵通二级提高青芜浮生、青芜浮生攻击和裂地崩伤害', () => {
    const core = createCore(
      [
        { id: CARD_IDS.lieDiBeng, level: 1 },
        {
          id: CARD_IDS.qingWuFuSheng,
          level: 2,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      11,
    )

    core.exec()

    expect(damage(core, '青芜浮生')).toBeCloseTo(279564 * 1.1 * 1.002)
    expect(damage(core, '裂地崩')).toBeCloseTo(207708 * 1.1 * 1.002)
    expect(damage(core, '青芜浮生 · 攻击')).toBeCloseTo(36667 * 1.1 * 1.002)
  })

  it('木灵通三级按存在的召唤物种类动态增幅回响', () => {
    const core = createCore([
      { id: CARD_IDS.lieDiBeng, level: 3 },
      {
        id: CARD_IDS.qingWuFuSheng,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])
    const skill = card<QingWuFuSheng>(
      core,
      CARD_IDS.qingWuFuSheng,
    )
    skill.beginSummon('paper')
    skill.beginSummon('tree')
    skill.beginSummon('spirit')

    card<LieDiBeng>(core, CARD_IDS.lieDiBeng).onAttackStarted()
    processQueue(core, 3)

    expect(damage(core, '裂地崩 · 回响')).toBeCloseTo(
      10896 * 1.3 * 1.006,
    )
  })

  it('木灵通三级在召唤物消失后回落回响倍率', () => {
    const core = createCore([
      { id: CARD_IDS.lieDiBeng, level: 3 },
      {
        id: CARD_IDS.qingWuFuSheng,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])
    const skill = card<QingWuFuSheng>(
      core,
      CARD_IDS.qingWuFuSheng,
    )
    skill.beginSummon('paper')
    card<LieDiBeng>(core, CARD_IDS.lieDiBeng).onAttackStarted()
    skill.expireSummon('paper', 3.5)

    processQueue(core, 4)

    expect(damage(core, '裂地崩 · 回响')).toBeCloseTo(
      10896 * (1.1 + 1) * 1.006,
    )
  })

  it('木灵通三级将裂地崩回响由30次增加到35次', () => {
    const base = createCore([
      { id: CARD_IDS.lieDiBeng, level: 3 },
    ])
    card<LieDiBeng>(base, CARD_IDS.lieDiBeng).onAttackStarted()
    processQueue(base, 37)

    const upgraded = createCore([
      { id: CARD_IDS.lieDiBeng, level: 3 },
      {
        id: CARD_IDS.qingWuFuSheng,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])
    card<LieDiBeng>(
      upgraded,
      CARD_IDS.lieDiBeng,
    ).onAttackStarted()
    processQueue(upgraded, 37)

    expect(count(base, '裂地崩 · 回响')).toBe(30)
    expect(count(upgraded, '裂地崩 · 回响')).toBe(35)
  })

  it('冰本真一级按叠层模型结算深度激化', () => {
    const core = createCore(
      [
        { id: CARD_IDS.shangGuanCe, level: 0 },
        {
          id: CARD_IDS.ningBingShuangHua,
          level: 1,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      5,
    )

    card<ShangGuanCe>(
      core,
      CARD_IDS.shangGuanCe,
    ).addIceValue(10000)
    core.exec()

    expect(damage(core, '深度激化')).toBe(46026)
    expect(count(core, '深度激化')).toBe(3)
  })

  it('冰本真二级暂不生效（倍率为1），凛霜寒涌三级为50%增伤', () => {
    const core = createCore([
      { id: CARD_IDS.shangGuanCe, level: 0 },
      { id: CARD_IDS.linShuangHanYong, level: 3 },
      {
        id: CARD_IDS.ningBingShuangHua,
        level: 2,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    card<ShangGuanCe>(
      core,
      CARD_IDS.shangGuanCe,
    ).addIceValue(10000)

    expect(damage(core, '玄冰激化')).toBeCloseTo(
      43534 * 1.5 * 1.0 * 1.006,
    )
  })

  it('冰灵通一二级立即消费寒晶刺并提高寒晶刺与碎裂', () => {
    const core = createCore(
      [
        { id: CARD_IDS.hanJingCi, level: 3 },
        {
          id: CARD_IDS.ningBingShuangHua,
          level: 2,
          upgrade: SKILL_UPGRADES.lingTong,
        },
      ],
      1,
    )

    core.exec()

    expect(count(core, '寒晶刺')).toBe(6)
    expect(damage(core, '寒晶刺')).toBeCloseTo(
      10992 * 1.75 * 1.05 * 6 * 1.006,
    )
    expect(damage(core, '碎裂-寒晶刺')).toBeCloseTo(
      7878 * 1.05 * 6 * 1.006,
    )
  })

  it('冰本真三级提高四系灵蕴值累加效率', () => {
    const core = createCore(
      [
        { id: CARD_IDS.mengHu, level: 0 },
        { id: CARD_IDS.shangGuanCe, level: 0 },
        { id: CARD_IDS.ziXiaoHu, level: 0 },
        { id: CARD_IDS.qingLiangZhu, level: 0 },
        {
          id: CARD_IDS.ningBingShuangHua,
          level: 3,
          upgrade: SKILL_UPGRADES.benZhen,
        },
      ],
      1,
    )

    core.exec()
    card<MengHu>(core, CARD_IDS.mengHu).addFireValue(100)
    card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).addIceValue(100)
    card<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu).addThunderValue(100)
    card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu).addWoodValue(100)

    expect(card<MengHu>(core, CARD_IDS.mengHu).fireValue).toBeCloseTo(115)
    expect(card<ShangGuanCe>(core, CARD_IDS.shangGuanCe).iceValue).toBeCloseTo(115)
    expect(card<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu).thunderValue).toBeCloseTo(115)
    expect(card<QingLiangZhu>(core, CARD_IDS.qingLiangZhu).woodValue).toBeCloseTo(115)
  })

  it('未携带对应升级时忽略升级专属触发', () => {
    const core = createCore([
      { id: CARD_IDS.zhuoZhuoTianYan, level: 3 },
      { id: CARD_IDS.leiYouLingGuang, level: 3 },
      { id: CARD_IDS.qingWuFuSheng, level: 3 },
      { id: CARD_IDS.fuMuZhangFeng, level: 1 },
      { id: CARD_IDS.ningBingShuangHua, level: 3 },
    ])

    card<ZhuoZhuoTianYan>(
      core,
      CARD_IDS.zhuoZhuoTianYan,
    ).onResonanceDamage()
    card<LeiYouLingGuang>(
      core,
      CARD_IDS.leiYouLingGuang,
    ).onSpearHit(50)
    const woodSkill = card<QingWuFuSheng>(
      core,
      CARD_IDS.qingWuFuSheng,
    )
    woodSkill.onPulse()
    woodSkill.beginSummon('paper')
    woodSkill.expireSummon('paper', 1)
    card<FuMuZhangFeng>(
      core,
      CARD_IDS.fuMuZhangFeng,
    ).onPulse(0)
    const iceSkill = card<NingBingShuangHua>(
      core,
      CARD_IDS.ningBingShuangHua,
    )
    iceSkill.onFreeze()
    iceSkill.onColdSpikeDamage(3)

    expect(core.damage.output().totalDamage).toBe(0)
  })

  it('木本真一级未携带腐木瘴风时按-1级腐木瘴风生效', () => {
    const core = createCore([
      {
        id: CARD_IDS.qingWuFuSheng,
        level: 1,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    card<QingWuFuSheng>(
      core,
      CARD_IDS.qingWuFuSheng,
    ).onPulse()

    expect(damage(core, '腐木瘴风')).toBeCloseTo(
      25042 * (1 - 0.375) * 0.1,
    )
  })

  it('木本真三级未携带神木骰时不生效', () => {
    const core = createCore([
      {
        id: CARD_IDS.qingWuFuSheng,
        level: 3,
        upgrade: SKILL_UPGRADES.benZhen,
      },
    ])

    expect(() => card<QingWuFuSheng>(core, CARD_IDS.qingWuFuSheng).tick()).not.toThrow()
    expect(core.damage.output().totalDamage).toBe(0)
  })

  it('冰灵通三级未携带寒晶刺时不触发寒晶刺联动', () => {
    const core = createCore([
      {
        id: CARD_IDS.ningBingShuangHua,
        level: 3,
        upgrade: SKILL_UPGRADES.lingTong,
      },
    ])

    const skill = card<NingBingShuangHua>(core, CARD_IDS.ningBingShuangHua)
    expect(() => skill.tick()).not.toThrow()
  })
})
