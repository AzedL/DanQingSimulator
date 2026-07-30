import { describe, expect, it } from 'vitest'
import { CARD_IDS } from './cardIds'

describe('CARD_IDS', () => {
  it('集中定义全部已实现卡片标识', () => {
    expect(Object.values(CARD_IDS)).toEqual([
      'ly-zhuozhuotianyan',
      'dq-xinghongjuyi',
      'dq-erweiyaohu',
      'dq-liuweimohu',
      'dq-menghu',
      'dq-suishou',
      'ly-chiyantianhuan',
      'ly-liehuoliaoyuan',
      'ly-lieyanfenshen',
      'ly-shenhuobengfa',
      'ly-tianhuoyunxing',
      'ly-ningbingshuanghua',
      'dq-shangguance',
      'dq-zuogui',
      'dq-wenmin',
      'dq-qihao',
      'dq-yanhong',
      'ly-hanjingci',
      'ly-shuanghanpolie',
      'ly-linshuanghanyong',
      'ly-shuangcihanyu',
      'ly-hanchaobingyong',
      'ly-leiyoulingguang',
      'dq-yinleifan',
      'dq-leipojing',
      'dq-lianleibi',
      'dq-zixiaohu',
      'dq-zidianchiwen',
      'ly-leitingzhenji',
      'ly-jingleiji',
      'ly-tianleihuyou',
      'ly-wuleizhu',
      'ly-jiuxiaoleidong',
      'ly-qingwufusheng',
      'dq-zheshan',
      'dq-shenmutou',
      'dq-linfeng',
      'dq-qingliangzhu',
      'dq-liuhejing',
      'ly-shenmutou',
      'ly-muyinqingling',
      'ly-fumuzhangfeng',
      'ly-canglinfusheng',
      'ly-liedibeng',
    ])
  })

  it('两个神木骰使用 dq 和 ly 后缀区分 key', () => {
    expect(CARD_IDS.shenMuTou_dq).toBe('dq-shenmutou')
    expect(CARD_IDS.shenMuTou_ly).toBe('ly-shenmutou')
  })
})
