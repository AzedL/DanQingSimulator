import { useMemo, useState } from 'react'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'
import {
  BASIC_CONFIG_DEFAULTS,
  DEFAULT_CARD_LOADOUT,
  SIMULATION_CONFIG_DEFAULTS,
  AUTO_SIMULATION_DURATION,
} from '@/domain/config/simulatorDefaults'
import {
  mergeDamageBreakdown,
  deriveSimulationCoreOptions,
  runSimulation,
  type SimulationCore,
  type SimulationMockOptions,
} from '@/engine/Simulation'
import { fixed, toInt, toNumber } from '@/kernel/utils/math'

interface CardSelection {
  id: CardId | ''
  level: number
}

export function useSimulation() {
  const [coreAttribute, setCoreAttribute] = useState(BASIC_CONFIG_DEFAULTS.coreAttribute)
  const [basicDamage, setBasicDamage] = useState(BASIC_CONFIG_DEFAULTS.basicDamage)
  const [coreAttributeExtraGain, setCoreAttributeExtraGain] = useState(BASIC_CONFIG_DEFAULTS.coreAttributeExtraGain)
  const [huiXin, setHuiXin] = useState(BASIC_CONFIG_DEFAULTS.huiXin)
  const [zhuanJing, setZhuanJing] = useState(BASIC_CONFIG_DEFAULTS.zhuanJing)
  const [tiaoXi, setTiaoXi] = useState(BASIC_CONFIG_DEFAULTS.tiaoXi)
  const [taXue, setTaXue] = useState(BASIC_CONFIG_DEFAULTS.taXue)
  const [anJi, setAnJi] = useState(BASIC_CONFIG_DEFAULTS.anJi)
  const [cards, setCards] = useState<CardSelection[]>(DEFAULT_CARD_LOADOUT)
  const [currentTab, setCurrentTab] = useState(SIMULATION_CONFIG_DEFAULTS.currentTab)
  const [duration, setDuration] = useState(SIMULATION_CONFIG_DEFAULTS.duration)
  const [useRandom, setUseRandom] = useState(SIMULATION_CONFIG_DEFAULTS.useRandom)
  const [costRemain, setCostRemain] = useState(SIMULATION_CONFIG_DEFAULTS.costRemain)
  const [excludeYouMingQuan, setExcludeYouMingQuan] = useState(SIMULATION_CONFIG_DEFAULTS.excludeYouMingQuan)
  const [manualCore, setManualCore] = useState<SimulationCore>()
  const [mergeSameNameDamage, setMergeSameNameDamage] = useState(false)

  const isAutoMock = currentTab === 'autoMock'
  const totalCost =
    cards.reduce((total, card) => {
      if (!card.id) return total
      return total + cardCatalog[card.id].cost
    }, 0) + (isAutoMock ? toInt(costRemain) : 0)

  const options = useMemo<SimulationMockOptions>(() => {
    const normalizedCards = cards.filter((card): card is { id: CardId; level: number } => !!card.id)
    return {
      cards: normalizedCards,
      coreAttribute: toInt(coreAttribute),
      basicDamage: toInt(basicDamage),
      coreAttributeExtraGain: toInt(coreAttributeExtraGain) / 100,
      attributeValues: {
        huiXin: toNumber(huiXin) / 100,
        zhuanJing: toNumber(zhuanJing) / 100,
        tiaoXi: toNumber(tiaoXi) / 100,
      },
      buffs: {
        taXue,
        anJi,
      },
      duration: isAutoMock ? AUTO_SIMULATION_DURATION : toInt(duration),
      useRandom: isAutoMock ? false : useRandom,
    }
  }, [
    anJi,
    basicDamage,
    cards,
    coreAttributeExtraGain,
    coreAttribute,
    duration,
    huiXin,
    isAutoMock,
    taXue,
    tiaoXi,
    useRandom,
    zhuanJing,
  ])

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
      }),
    )
  }

  function handleLevelChange(index: number, value: string) {
    setCards((current) =>
      current.map((card, i) => {
        if (i === index) return { ...card, level: toInt(value) }
        return card
      }),
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
      coreAttributeExtraGain,
      setCoreAttributeExtraGain,
      huiXin,
      setHuiXin,
      zhuanJing,
      setZhuanJing,
      tiaoXi,
      setTiaoXi,
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
