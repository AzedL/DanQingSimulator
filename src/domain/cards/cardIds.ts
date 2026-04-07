export type CardGroup = 'human' | 'animal' | 'utensil'
export type CardBehaviorKind = 'active' | 'passive' | 'derived'

export type PassiveCardId =
  | 'erWeiYaoHu'
  | 'shenMuTou'
  | 'linFeng'
  | 'shangGuanCe'
  | 'suiShou'
  | 'zuoGui'
  | 'haiGui'
  | 'xiaoHuan'
  | 'fengZheng'
  | 'mengHu'
  | 'zhouYiXian'
  | 'xianRenBuFan'
  | 'xueDiXiong'
  | 'muJian'

export type ActiveCardId =
  | 'yanHong'
  | 'wenMin'
  | 'xingHongJuYi'
  | 'youMingQuan'
  | 'zheShan'
  | 'hanBingJian'
  | 'qiHao'
  | 'liuWeiMoHu'

export type CardId = PassiveCardId | ActiveCardId