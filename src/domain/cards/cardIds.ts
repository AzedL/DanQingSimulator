export type CardGroup = 'human' | 'animal' | 'utensil'
export type CardBehaviorKind = 'active' | 'passive' | 'derived'

export type PassiveCardId =
  | 'erWeiYaoHu'
  | 'shenMuTou'
  | 'liuHeJing'
  | 'linFeng'
  | 'shangGuanCe'
  | 'zhengDaLi'
  | 'gongJian'
  | 'suiShou'
  | 'zuoGui'
  | 'huoFu'
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
