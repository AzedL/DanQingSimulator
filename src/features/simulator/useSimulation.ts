import { useMemo, useState } from 'react'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'
import { mergeDamageBreakdown, deriveSimulationCoreOptions, runSimulation, type SimulationCore, type SimulationMockOptions } from '@/engine/Simulation'
import { fixed, toNumber } from '@/mock/utils/math'

interface CardSelection {
  id: CardId | ''
  level: number
}

export function useSimulation() {
  const [coreAttribute, setCoreAttribute] = useState('50000')
  const [basicDamage, setBasicDamage] = useState('50000')
  const [treasureLevel, setTreasureLevel] = useState('10')
  const [taXue, setTaXue] = useState(false)
  const [anJi, setAnJi] = useState(false)
  const [cards, setCards] = useState<CardSelection[]>([
    { id: 'yanHong', level: 6 },
    { id: 'wenMin', level: 6 },
    { id: 'linFeng', level: 6 },
    { id: 'erWeiYaoHu', level: 6 },
    { id: 'shangGuanCe', level: 6 },
    { id: 'liuWeiMoHu', level: 6 },
  ])
  const [currentTab, setCurrentTab] = useState<'mock' | 'autoMock'>('mock')
  const [duration, setDuration] = useState('600')
  const [useRandom, setUseRandom] = useState(false)
  const [costRemain, setCostRemain] = useState('0')
  const [excludeYouMingQuan, setExcludeYouMingQuan] = useState(true)
  const [manualCore, setManualCore] = useState<SimulationCore>()
  const [mergeSameNameDamage, setMergeSameNameDamage] = useState(false)

  const isAutoMock = currentTab === 'autoMock'
  const totalCost =
    cards.reduce((total, card) => {
      if (!card.id) return total
      return total + cardCatalog[card.id].cost
    }, 0) + (isAutoMock ? toNumber(costRemain) : 0)

  const options = useMemo<SimulationMockOptions>(() => {
    const normalizedCards = cards.filter((card): card is { id: CardId; level: number } => !!card.id)
    return {
      cards: normalizedCards,
      coreAttribute: toNumber(coreAttribute),
      basicDamage: toNumber(basicDamage),
      treasureLevel: toNumber(treasureLevel),
      buffs: {
        taXue,
        anJi,
      },
      duration: isAutoMock ? 600 : toNumber(duration),
      useRandom: isAutoMock ? false : useRandom,
    }
  }, [anJi, basicDamage, cards, coreAttribute, duration, isAutoMock, taXue, treasureLevel, useRandom])

  const coreOptions = useMemo(() => deriveSimulationCoreOptions(options), [options])
  const mockResult = useMemo(() => {
    if (!manualCore) return []
    const detail = manualCore.dps.getDetail().sort((a, b) => b.dps - a.dps)
    return mergeSameNameDamage ? mergeDamageBreakdown(detail) : detail
  }, [manualCore, mergeSameNameDamage])

  function handleAdd() {
    setCards((current) => [...current, { id: '', level: 6 }])
  }

  function handleDelete(index: number) {
    setCards((current) => current.filter((_, i) => i !== index))
  }

  function handleCardChange(index: number, value: CardId) {
    setCards((current) =>
      current.map((card, i) => {
        if (i === index) return { ...card, id: value }
        return card
      })
    )
  }

  function handleLevelChange(index: number, value: string) {
    setCards((current) =>
      current.map((card, i) => {
        if (i === index) return { ...card, level: toNumber(value) }
        return card
      })
    )
  }

  function getCardList(id: string, cardsList: { value: CardId; label: string }[]) {
    const ids = cards.map((card) => card.id)
    return cardsList.filter((card) => card.value === id || !ids.includes(card.value))
  }

  function execMock() {
    const simulation = runSimulation(coreOptions)
    setManualCore(simulation.core)
    return simulation.core
  }

  return {
    basicConfig: {
      coreAttribute,
      setCoreAttribute,
      basicDamage,
      setBasicDamage,
      treasureLevel,
      setTreasureLevel,
      taXue,
      setTaXue,
      anJi,
      setAnJi,
    },
    cardsConfig: {
      cards,
      handleAdd,
      handleDelete,
      handleCardChange,
      handleLevelChange,
      getCardList,
    },
    simulationConfig: {
      currentTab,
      setCurrentTab,
      isAutoMock,
      duration,
      setDuration,
      useRandom,
      setUseRandom,
      costRemain,
      setCostRemain,
      excludeYouMingQuan,
      setExcludeYouMingQuan,
    },
    preview: {
      totalCost,
      resultCoreAttribute: coreOptions.coreAttribute,
      resultAttackPower: fixed(coreOptions.attackPower),
    },
    options,
    coreOptions,
    manualCore,
    mockResult,
    mergeSameNameDamage,
    setMergeSameNameDamage,
    execMock,
  }
}