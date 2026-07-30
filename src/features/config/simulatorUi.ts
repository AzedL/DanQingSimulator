import { CARD_IDS, type CardId } from '@/kernel'
import lang from '@/lang/lang'

export type SimulatorTab = 'mock' | 'autoMock'
export const cardGroups = ['天火', '玄冰', '苍木', '神雷'] as const
export type CardGroup = (typeof cardGroups)[number]
export const skillCardIds: Record<CardGroup, CardId> = {
  天火: CARD_IDS.zhuoZhuoTianYan,
  玄冰: CARD_IDS.ningBingShuangHua,
  苍木: CARD_IDS.qingWuFuSheng,
  神雷: CARD_IDS.leiYouLingGuang,
}

export interface CardSelectOption {
  value: CardId
  label: string
  group: CardGroup
  cost?: number
}

export const skillList: CardSelectOption[] = [
  { value: skillCardIds.天火, label: '灼灼天炎', group: '天火' },
  { value: skillCardIds.玄冰, label: '凝冰霜华', group: '玄冰' },
  { value: skillCardIds.苍木, label: '青芜浮生', group: '苍木' },
  { value: skillCardIds.神雷, label: '雷佑灵光', group: '神雷' },
]

export const danQingList: CardSelectOption[] = [
  { value: CARD_IDS.xingHongJuYi, label: '猩红巨蚁', group: '天火', cost: 1 },
  { value: CARD_IDS.mengHu, label: '猛虎', group: '天火', cost: 2 },
  { value: CARD_IDS.suiShou, label: '岁兽', group: '天火', cost: 3 },
  { value: CARD_IDS.erWeiYaoHu, label: '二尾妖狐', group: '天火', cost: 4 },
  { value: CARD_IDS.liuWeiMoHu, label: '六尾魔狐', group: '天火', cost: 5 },
  { value: CARD_IDS.yanHong, label: '燕虹', group: '玄冰', cost: 1 },
  { value: CARD_IDS.shangGuanCe, label: '上官策', group: '玄冰', cost: 2 },
  { value: CARD_IDS.wenMin, label: '文敏', group: '玄冰', cost: 3 },
  { value: CARD_IDS.zuoGui, label: '左归', group: '玄冰', cost: 4 },
  { value: CARD_IDS.qiHao, label: '齐昊', group: '玄冰', cost: 5 },
  { value: CARD_IDS.zheShan, label: '折扇', group: '苍木', cost: 1 },
  { value: CARD_IDS.qingLiangZhu, label: '清凉珠', group: '苍木', cost: 2 },
  { value: CARD_IDS.shenMuTou_dq, label: '神木骰', group: '苍木', cost: 3 },
  { value: CARD_IDS.linFeng, label: '林峰', group: '苍木', cost: 4 },
  { value: CARD_IDS.liuHeJing, label: '六合镜', group: '苍木', cost: 5 },
  { value: CARD_IDS.yinLeiFan, label: '引雷幡', group: '神雷', cost: 1 },
  { value: CARD_IDS.ziXiaoHu, label: '紫霄葫', group: '神雷', cost: 2 },
  { value: CARD_IDS.leiPoJing, label: '雷魄晶', group: '神雷', cost: 3 },
  { value: CARD_IDS.lianLeiBi, label: '连雷璧', group: '神雷', cost: 4 },
  { value: CARD_IDS.ziDianChiWen, label: '紫电螭吻', group: '神雷', cost: 5 },
]

export const lingYunList: CardSelectOption[] = [
  { value: CARD_IDS.lieYanFenShen, label: '烈焰焚身', group: '天火' },
  { value: CARD_IDS.lieHuoLiaoYuan, label: '烈火燎原', group: '天火' },
  { value: CARD_IDS.tianHuoYunXing, label: '天火陨星', group: '天火' },
  { value: CARD_IDS.chiYanTianHuan, label: '赤焰天环', group: '天火' },
  { value: CARD_IDS.shenHuoBengFa, label: '神火迸发', group: '天火' },
  { value: CARD_IDS.shuangHanPoLie, label: '霜寒破裂', group: '玄冰' },
  { value: CARD_IDS.hanChaoBingYong, label: '寒潮冰涌', group: '玄冰' },
  { value: CARD_IDS.linShuangHanYong, label: '凛霜寒涌', group: '玄冰' },
  { value: CARD_IDS.hanJingCi, label: '寒晶刺', group: '玄冰' },
  { value: CARD_IDS.shuangCiHanYu, label: '霜刺寒雨', group: '玄冰' },
  { value: CARD_IDS.fuMuZhangFeng, label: '腐木瘴风', group: '苍木' },
  { value: CARD_IDS.lieDiBeng, label: '裂地崩', group: '苍木' },
  { value: CARD_IDS.muYinQingLing, label: '木引青灵', group: '苍木' },
  { value: CARD_IDS.cangLinFuSheng, label: '苍林浮生', group: '苍木' },
  { value: CARD_IDS.shenMuTou_ly, label: '神木骰', group: '苍木' },
  { value: CARD_IDS.tianLeiHuYou, label: '天雷护佑', group: '神雷' },
  { value: CARD_IDS.jingLeiJi, label: '惊雷戟', group: '神雷' },
  { value: CARD_IDS.wuLeiZhu, label: '五雷珠', group: '神雷' },
  { value: CARD_IDS.jiuXiaoLeiDong, label: '九霄雷动', group: '神雷' },
  { value: CARD_IDS.leiTingZhenJi, label: '雷霆震击', group: '神雷' },
]

export const danQingLevelValues = Array.from({ length: 7 }).map(
  (_, level) => ({
    label: String(level),
    value: String(level),
  }),
)

export const lingYunLevelValues = Array.from({ length: 6 }).map(
  (_, level) => ({
    label: String(level),
    value: String(level),
  }),
)

export const tabValues: { value: SimulatorTab; label: string }[] = [
  { label: lang.autoMock, value: 'autoMock' },
  { label: lang.mock, value: 'mock' },
]
