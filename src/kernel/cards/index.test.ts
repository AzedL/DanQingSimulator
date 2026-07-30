import { describe, expect, it } from 'vitest'
import { Core } from '../core/Core'
import {
  TIAN_GONG_CARD_IDS,
  TIAN_GONG_DAMAGE_BOOST_PER_LEVEL,
} from '.'
import type { CardId } from './cardIds'

function createCore(id: CardId, level: number) {
  return new Core({
    cards: [{ id, level }],
    duration: 1,
    burstDps: 0,
    sustainedDps: 0,
    useRandom: false,
  })
}

describe('天工本系增伤', () => {
  Object.entries(TIAN_GONG_CARD_IDS).forEach(([type, ids]) => {
    ids.forEach((id) => {
      it(`${id}每级提供0.2%本系增伤`, () => {
        const core = createCore(id, 3)
        const damage = core[type as keyof typeof TIAN_GONG_CARD_IDS]

        damage.add(100, 1, '本系伤害')

        expect(core.damage.output().damageMap['本系伤害']).toBeCloseTo(
          100 * (1 + 3 * TIAN_GONG_DAMAGE_BOOST_PER_LEVEL),
        )
      })
    })
  })

  it('同系天工等级加算', () => {
    const [firstId, secondId] = TIAN_GONG_CARD_IDS.fire
    const core = new Core({
      cards: [
        { id: firstId, level: 3 },
        { id: secondId, level: 5 },
      ],
      duration: 1,
      burstDps: 0,
      sustainedDps: 0,
      useRandom: false,
    })

    core.fire.add(100, 1, '天火伤害')

    expect(core.damage.output().damageMap['天火伤害']).toBeCloseTo(
      100 * (1 + 8 * TIAN_GONG_DAMAGE_BOOST_PER_LEVEL),
    )
  })

  it('Core重置后保留天工本系增伤', () => {
    const core = createCore(TIAN_GONG_CARD_IDS.fire[0], 3)

    core.reset()
    core.fire.add(100, 1, '天火伤害')

    expect(core.damage.output().damageMap['天火伤害']).toBeCloseTo(
      100 * (1 + 3 * TIAN_GONG_DAMAGE_BOOST_PER_LEVEL),
    )
  })
})
