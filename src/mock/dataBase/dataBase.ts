type TCardIds0 = 'erWeiYaoHu' | 'shenMuTou' | 'linFeng' | 'shangGuanCe' | 'suiShou' | 'zuoGui'
export type TCardIds1 =
  | 'yanHong'
  | 'wenMin'
  | 'xingHongJuYi'
  | 'youMingQuan'
  | 'zheShan'
  | 'hanBingJian'
  | 'qiHao'
  | 'liuWeiMoHu'
type TCardIds2 = 'haiGui' | 'xiaoHuan' | 'fengZheng' | 'mengHu' | 'zhouYiXian' | 'xianRenBuFan' | 'xueDiXiong'
type TCardIds3 = 'muJian'

export type TCardIds = TCardIds0 | TCardIds1 | TCardIds2 | TCardIds3

interface Data {
  id: TCardIds
  name: string
  values: number[]
  cost: number
  group: 'human' | 'animal' | 'utensil'
  _type: 0 | 1 | 2 | 3
}

const dataBase0: Record<TCardIds0, Data> = {
  erWeiYaoHu: {
    id: 'erWeiYaoHu',
    name: '二尾妖狐',
    values: [0.28, 0.02],
    cost: 2,
    group: 'animal',
    _type: 0,
  },
  shenMuTou: {
    id: 'shenMuTou',
    name: '神木骰',
    values: [0.7, 0.05],
    cost: 2,
    group: 'utensil',
    _type: 0,
  },
  linFeng: {
    id: 'linFeng',
    name: '林峰',
    values: [0.7, 0.05],
    cost: 3,
    group: 'human',
    _type: 0,
  },
  shangGuanCe: {
    id: 'shangGuanCe',
    name: '上官策',
    values: [0.38, 0.02],
    cost: 2,
    group: 'human',
    _type: 0,
  },
  suiShou: {
    id: 'suiShou',
    name: '岁兽',
    values: [0.7, 0.05],
    cost: 3,
    group: 'animal',
    _type: 0,
  },
  zuoGui: {
    id: 'zuoGui',
    name: '左归',
    values: [0.28, 0.02],
    cost: 4,
    group: 'human',
    _type: 0,
  },
}

const dataBase1: Record<TCardIds1, Data> = {
  yanHong: {
    id: 'yanHong',
    name: '燕虹',
    values: [0.28, 0.02, 6],
    cost: 1,
    group: 'human',
    _type: 1,
  },
  wenMin: {
    id: 'wenMin',
    name: '文敏',
    values: [16, -1],
    cost: 2,
    group: 'human',
    _type: 1,
  },
  xingHongJuYi: {
    id: 'xingHongJuYi',
    name: '猩红巨蚁',
    values: [0.014, 0.001, 8, 12],
    cost: 1,
    group: 'animal',
    _type: 1,
  },
  youMingQuan: {
    id: 'youMingQuan',
    name: '幽冥犬',
    values: [10, -1],
    cost: 2,
    group: 'animal',
    _type: 1,
  },
  zheShan: {
    id: 'zheShan',
    name: '折扇',
    values: [0.4, 0.02, 15],
    cost: 1,
    group: 'utensil',
    _type: 1,
  },
  hanBingJian: {
    id: 'hanBingJian',
    name: '寒冰剑',
    values: [16, -1],
    cost: 3,
    group: 'utensil',
    _type: 1,
  },
  qiHao: {
    id: 'qiHao',
    name: '齐昊',
    values: [10.4, 0.6, 60],
    cost: 5,
    group: 'human',
    _type: 1,
  },
  liuWeiMoHu: {
    id: 'liuWeiMoHu',
    name: '六尾魔狐',
    values: [0.5, 0.03],
    cost: 5,
    group: 'animal',
    _type: 1,
  },
}

const dataBase2: Record<TCardIds2, Data> = {
  haiGui: {
    id: 'haiGui',
    name: '海龟',
    values: [280, 20],
    cost: 1,
    group: 'animal',
    _type: 2,
  },
  xiaoHuan: {
    id: 'xiaoHuan',
    name: '小环',
    values: [280, 20],
    cost: 1,
    group: 'human',
    _type: 2,
  },
  fengZheng: {
    id: 'fengZheng',
    name: '风筝',
    values: [280, 20],
    cost: 1,
    group: 'utensil',
    _type: 2,
  },
  mengHu: {
    id: 'mengHu',
    name: '猛虎',
    values: [0.56, 0.04],
    cost: 2,
    group: 'animal',
    _type: 2,
  },
  zhouYiXian: {
    id: 'zhouYiXian',
    name: '周一仙',
    values: [0.56, 0.04],
    cost: 2,
    group: 'human',
    _type: 2,
  },
  xianRenBuFan: {
    id: 'xianRenBuFan',
    name: '仙人布幡',
    values: [0.56, 0.04],
    cost: 2,
    group: 'utensil',
    _type: 2,
  },
  xueDiXiong: {
    id: 'xueDiXiong',
    name: '雪地熊',
    values: [0.38, 0.02],
    cost: 4,
    group: 'animal',
    _type: 2,
  },
}

const dataBase3: Record<TCardIds3, Data> = {
  muJian: {
    id: 'muJian',
    name: '木剑',
    values: [0.56, 0.04],
    cost: 1,
    group: 'utensil',
    _type: 3,
  },
}

export const dataBase: Record<TCardIds, Data> = { ...dataBase0, ...dataBase1, ...dataBase2, ...dataBase3 }
