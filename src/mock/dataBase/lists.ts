import lang from '@/lang/lang'
import type { TCardIds } from './dataBase'

export const cardsList: { value: TCardIds; label: string }[] = [
  {
    value: 'haiGui',
    label: '海龟',
  },
  {
    value: 'xiaoHuan',
    label: '小环',
  },
  {
    value: 'muJian',
    label: '木剑',
  },
  {
    value: 'fengZheng',
    label: '风筝',
  },
  {
    value: 'yanHong',
    label: '燕虹',
  },
  {
    value: 'xingHongJuYi',
    label: '猩红巨蚁',
  },
  {
    value: 'zheShan',
    label: '折扇',
  },
  {
    value: 'mengHu',
    label: '猛虎',
  },
  {
    value: 'zhouYiXian',
    label: '周一仙',
  },
  {
    value: 'xianRenBuFan',
    label: '仙人布幡',
  },
  {
    value: 'wenMin',
    label: '文敏',
  },
  {
    value: 'shenMuTou',
    label: '神木骰',
  },
  {
    value: 'erWeiYaoHu',
    label: '二尾妖狐',
  },
  {
    value: 'youMingQuan',
    label: '幽冥犬',
  },
  {
    value: 'shangGuanCe',
    label: '上官策',
  },
  {
    value: 'linFeng',
    label: '林峰',
  },
  {
    value: 'suiShou',
    label: '岁兽',
  },
  {
    value: 'hanBingJian',
    label: '寒冰剑',
  },
  {
    value: 'zuoGui',
    label: '左归',
  },
  {
    value: 'xueDiXiong',
    label: '雪地熊',
  },
  {
    value: 'qiHao',
    label: '齐昊',
  },
  {
    value: 'liuWeiMoHu',
    label: '六尾魔狐',
  },
]

export const treasureLevelValues = Array.from({ length: 11 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

export const cardLevelValues = Array.from({ length: 7 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

export type TTabs = 'mock' | 'autoMock'
export const tabValues: { value: TTabs; label: string }[] = [
  { label: lang.mock, value: 'mock' },
  { label: lang.autoMock, value: 'autoMock' },
]

export type TChartOption = 'damage' | 'dps' | 'count' | 'fireCount'
export const chartOptionValues: { value: TChartOption; label: string }[] = [
  { label: lang.dps, value: 'dps' },
  { label: lang.damage, value: 'damage' },
  { label: lang.count, value: 'count' },
  { label: lang.fireCount, value: 'fireCount' },
]
