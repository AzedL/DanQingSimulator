import type { Core } from '../core/Core'
import type { Card, CardId } from './Card'
import { CARD_IDS } from './cardIds'
import { ErWeiYaoHu } from './fire/dq/ErWeiYaoHu'
import { LiuWeiMoHu } from './fire/dq/LiuWeiMoHu'
import { MengHu } from './fire/dq/MengHu'
import { SuiShou } from './fire/dq/SuiShou'
import { XingHongJuYi } from './fire/dq/XingHongJuYi'
import { ChiYanTianHuan } from './fire/ly/ChiYanTianHuan'
import { LieHuoLiaoYuan } from './fire/ly/LieHuoLiaoYuan'
import { LieYanFenShen } from './fire/ly/LieYanFenShen'
import { ShenHuoBengFa } from './fire/ly/ShenHuoBengFa'
import { TianHuoYunXing } from './fire/ly/TianHuoYunXing'
import { ZhuoZhuoTianYan } from './fire/ZhuoZhuoTianYan'
import { NingBingShuangHua } from './ice/NingBingShuangHua'
import { QiHao } from './ice/dq/QiHao'
import { ShangGuanCe } from './ice/dq/ShangGuanCe'
import { WenMin } from './ice/dq/WenMin'
import { YanHong } from './ice/dq/YanHong'
import { ZuoGui } from './ice/dq/ZuoGui'
import { HanChaoBingYong } from './ice/ly/HanChaoBingYong'
import { HanJingCi } from './ice/ly/HanJingCi'
import { LinShuangHanYong } from './ice/ly/LinShuangHanYong'
import { ShuangCiHanYu } from './ice/ly/ShuangCiHanYu'
import { ShuangHanPoLie } from './ice/ly/ShuangHanPoLie'
import { LeiYouLingGuang } from './thunder/LeiYouLingGuang'
import { LeiPoJing } from './thunder/dq/LeiPoJing'
import { LianLeiBi } from './thunder/dq/LianLeiBi'
import { YinLeiFan } from './thunder/dq/YinLeiFan'
import { ZiDianChiWen } from './thunder/dq/ZiDianChiWen'
import { ZiLeiHu } from './thunder/dq/ZiLeiHu'
import { JingLeiJi } from './thunder/ly/JingLeiJi'
import { JiuXiaoLeiDong } from './thunder/ly/JiuXiaoLeiDong'
import { LeiTingZhenJi } from './thunder/ly/LeiTingZhenJi'
import { TianLeiHuYou } from './thunder/ly/TianLeiHuYou'
import { WuLeiZhu } from './thunder/ly/WuLeiZhu'
import { QingWuFuSheng } from './wood/QingWuFuSheng'
import { LinFeng } from './wood/dq/LinFeng'
import { LiuHeJing } from './wood/dq/LiuHeJing'
import { QingLiangZhu } from './wood/dq/QingLiangZhu'
import { ShenMuTouDanQing } from './wood/dq/ShenMuTouDanQing'
import { ZheShan } from './wood/dq/ZheShan'
import { CangLinFuSheng } from './wood/ly/CangLinFuSheng'
import { FuMuZhangFeng } from './wood/ly/FuMuZhangFeng'
import { LieDiBeng } from './wood/ly/LieDiBeng'
import { MuYinQingLing } from './wood/ly/MuYinQingLing'
import { ShenMuTouLingYun } from './wood/ly/ShenMuTouLingYun'

export type CardConstructor = new (core: Core, level: number) => Card

export const cards: Partial<Record<CardId, CardConstructor>> = {
  [CARD_IDS.zhuoZhuoTianYan]: ZhuoZhuoTianYan,
  [CARD_IDS.xingHongJuYi]: XingHongJuYi,
  [CARD_IDS.lieYanFenShen]: LieYanFenShen,
  [CARD_IDS.tianHuoYunXing]: TianHuoYunXing,
  [CARD_IDS.erWeiYaoHu]: ErWeiYaoHu,
  [CARD_IDS.liuWeiMoHu]: LiuWeiMoHu,
  [CARD_IDS.mengHu]: MengHu,
  [CARD_IDS.suiShou]: SuiShou,
  [CARD_IDS.chiYanTianHuan]: ChiYanTianHuan,
  [CARD_IDS.lieHuoLiaoYuan]: LieHuoLiaoYuan,
  [CARD_IDS.shenHuoBengFa]: ShenHuoBengFa,
  [CARD_IDS.ningBingShuangHua]: NingBingShuangHua,
  [CARD_IDS.yanHong]: YanHong,
  [CARD_IDS.wenMin]: WenMin,
  [CARD_IDS.qiHao]: QiHao,
  [CARD_IDS.hanChaoBingYong]: HanChaoBingYong,
  [CARD_IDS.shangGuanCe]: ShangGuanCe,
  [CARD_IDS.zuoGui]: ZuoGui,
  [CARD_IDS.hanJingCi]: HanJingCi,
  [CARD_IDS.shuangHanPoLie]: ShuangHanPoLie,
  [CARD_IDS.linShuangHanYong]: LinShuangHanYong,
  [CARD_IDS.shuangCiHanYu]: ShuangCiHanYu,
  [CARD_IDS.ziDianChiWen]: ZiDianChiWen,
  [CARD_IDS.leiYouLingGuang]: LeiYouLingGuang,
  [CARD_IDS.yinLeiFan]: YinLeiFan,
  [CARD_IDS.wuLeiZhu]: WuLeiZhu,
  [CARD_IDS.leiPoJing]: LeiPoJing,
  [CARD_IDS.lianLeiBi]: LianLeiBi,
  [CARD_IDS.ziLeiHu]: ZiLeiHu,
  [CARD_IDS.leiTingZhenJi]: LeiTingZhenJi,
  [CARD_IDS.jingLeiJi]: JingLeiJi,
  [CARD_IDS.tianLeiHuYou]: TianLeiHuYou,
  [CARD_IDS.jiuXiaoLeiDong]: JiuXiaoLeiDong,
  [CARD_IDS.qingWuFuSheng]: QingWuFuSheng,
  [CARD_IDS.shenMuTou_dq]: ShenMuTouDanQing,
  [CARD_IDS.zheShan]: ZheShan,
  [CARD_IDS.cangLinFuSheng]: CangLinFuSheng,
  [CARD_IDS.linFeng]: LinFeng,
  [CARD_IDS.qingLiangZhu]: QingLiangZhu,
  [CARD_IDS.liuHeJing]: LiuHeJing,
  [CARD_IDS.shenMuTou_ly]: ShenMuTouLingYun,
  [CARD_IDS.muYinQingLing]: MuYinQingLing,
  [CARD_IDS.fuMuZhangFeng]: FuMuZhangFeng,
  [CARD_IDS.lieDiBeng]: LieDiBeng,
}

export function getCards(core: Core) {
  const options = new Map(core.coreOptions.cards.map((card) => [card.id, card.level]))
  const instances: Card[] = []
  const entries = Object.entries(cards) as [CardId, CardConstructor][]

  entries.forEach(([id, CardClass]) => {
    const level = options.get(id)
    if (level === undefined) return

    instances.push(new CardClass(core, level))
  })

  return instances
}
