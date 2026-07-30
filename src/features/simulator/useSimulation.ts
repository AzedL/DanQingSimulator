import { useMemo, useState } from 'react'
import {
  CARD_IDS,
  Core,
  type CardId,
  type CardOptions,
  type CoreOptions,
  type DamageOutput,
} from '@/kernel'
import { toInt, toNumber } from '@/kernel/utils/math'
import {
  BASIC_CONFIG_DEFAULTS,
  SIMULATION_CONFIG_DEFAULTS,
} from '@/features/config/simulatorDefaults'
import {
  skillCardIds,
  type CardGroup,
  type CardSelectOption,
} from '@/features/config/simulatorUi'
import {
  buildDamageDetails,
  mergeDamageDetails,
} from './result'

interface CardSelection {
  id: CardId | ''
  level: number
}

interface ManualResult {
  options: CoreOptions
  output: DamageOutput
}

export function useSimulation() {
  const [burstDps, setBurstDps] = useState(
    BASIC_CONFIG_DEFAULTS.burstDps,
  )
  const [sustainedDps, setSustainedDps] = useState(
    BASIC_CONFIG_DEFAULTS.sustainedDps,
  )
  const [danQingCards, setDanQingCards] = useState<CardSelection[]>([
    { id: CARD_IDS.xingHongJuYi, level: 6 },
    { id: CARD_IDS.mengHu, level: 6 },
    { id: CARD_IDS.suiShou, level: 6 },
    { id: CARD_IDS.erWeiYaoHu, level: 6 },
    { id: CARD_IDS.liuWeiMoHu, level: 6 },
  ])
  const [lingYunCards, setLingYunCards] = useState<CardSelection[]>([
    { id: '', level: 1 },
  ])
  const [currentTab, setCurrentTab] = useState(
    SIMULATION_CONFIG_DEFAULTS.currentTab,
  )
  const [skillGroup, setSkillGroup] = useState(
    SIMULATION_CONFIG_DEFAULTS.skillGroup,
  )
  const [duration, setDuration] = useState(
    SIMULATION_CONFIG_DEFAULTS.duration,
  )
  const [useRandom, setUseRandom] = useState(
    SIMULATION_CONFIG_DEFAULTS.useRandom,
  )
  const [autoMockGroup, setAutoMockGroup] = useState(
    SIMULATION_CONFIG_DEFAULTS.autoMockGroup,
  )
  const [availableTianGongValue, setAvailableTianGongValue] =
    useState(SIMULATION_CONFIG_DEFAULTS.availableTianGongValue)
  const [manualResult, setManualResult] = useState<ManualResult>()
  const [mergeSameNameDamage, setMergeSameNameDamage] = useState(false)

  const isAutoMock = currentTab === 'autoMock'
  const simulationCards = useMemo(
    () =>
      [
        {
          id: skillCardIds[
            isAutoMock ? autoMockGroup : skillGroup
          ],
          level: 0,
        },
        ...danQingCards,
        ...lingYunCards.filter((card) => card.level > 0),
      ]
        .filter((card): card is CardOptions => card.id !== '')
        .map(({ id, level }) => ({ id, level })),
    [
      autoMockGroup,
      danQingCards,
      isAutoMock,
      lingYunCards,
      skillGroup,
    ],
  )
  const coreOptions = useMemo<CoreOptions>(
    () => ({
      cards: simulationCards,
      duration: toInt(duration),
      burstDps: toNumber(burstDps),
      sustainedDps: toNumber(sustainedDps),
      useRandom: isAutoMock ? false : useRandom,
    }),
    [
      burstDps,
      duration,
      isAutoMock,
      simulationCards,
      sustainedDps,
      useRandom,
    ],
  )
  const mockResult = useMemo(() => {
    if (!manualResult) return []
    const detail = buildDamageDetails(
      manualResult.output,
      manualResult.options,
    )
    const result = mergeSameNameDamage
      ? mergeDamageDetails(detail)
      : detail
    const total = result.find((item) => item.key === 'total')
    const items = result
      .filter((item) => item.key !== 'total')
      .sort((a, b) => b.dps - a.dps)
    return total ? [total, ...items] : items
  }, [manualResult, mergeSameNameDamage])

  function addDanQing() {
    setDanQingCards((current) => [
      ...current,
      { id: '', level: 6 },
    ])
  }

  function addLingYun() {
    setLingYunCards((current) => [
      ...current,
      { id: '', level: 1 },
    ])
  }

  function deleteDanQing(index: number) {
    setDanQingCards((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  function deleteLingYun(index: number) {
    setLingYunCards((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  function changeDanQing(index: number, value: CardId) {
    setDanQingCards((current) =>
      current.map((card, currentIndex) =>
        currentIndex === index ? { ...card, id: value } : card,
      ),
    )
  }

  function changeLingYun(index: number, value: CardId) {
    setLingYunCards((current) =>
      current.map((card, currentIndex) =>
        currentIndex === index ? { ...card, id: value } : card,
      ),
    )
  }

  function changeDanQingLevel(index: number, value: string) {
    setDanQingCards((current) =>
      current.map((card, currentIndex) =>
        currentIndex === index
          ? { ...card, level: toInt(value) }
          : card,
      ),
    )
  }

  function changeLingYunLevel(index: number, value: string) {
    setLingYunCards((current) =>
      current.map((card, currentIndex) =>
        currentIndex === index
          ? { ...card, level: toInt(value) }
          : card,
      ),
    )
  }

  function selectDanQingGroup(ids: CardId[]) {
    setDanQingCards(ids.map((id) => ({ id, level: 6 })))
  }

  function selectLingYunGroup(ids: CardId[]) {
    setLingYunCards(ids.map((id) => ({ id, level: 5 })))
  }

  function changeAllDanQingLevels(level: number) {
    setDanQingCards((current) =>
      current.map((card) => ({ ...card, level })),
    )
  }

  function changeAllLingYunLevels(level: number) {
    setLingYunCards((current) =>
      current.map((card) => ({ ...card, level })),
    )
  }

  function getCardList(
    cards: CardSelection[],
    id: string,
    cardsList: CardSelectOption[],
  ) {
    const ids = cards.map((card) => card.id)
    return cardsList.filter(
      (card) => card.value === id || !ids.includes(card.value),
    )
  }

  function execMock() {
    const options = { ...coreOptions, useLightMode: false }
    executeMock(options)
  }

  function applyAutoMockResult(
    cards: CardOptions[],
    group: CardGroup,
  ) {
    const nextLingYunCards = cards.map(({ id, level }) => ({
      id,
      level,
    }))
    const nextCards = [
      { id: skillCardIds[group], level: 0 },
      ...danQingCards
        .filter((card): card is CardOptions => card.id !== '')
        .map(({ id, level }) => ({ id, level })),
      ...nextLingYunCards,
    ]
    const options: CoreOptions = {
      cards: nextCards,
      duration: toInt(duration),
      burstDps: toNumber(burstDps),
      sustainedDps: toNumber(sustainedDps),
      useRandom,
      useLightMode: false,
    }

    setLingYunCards(nextLingYunCards)
    setSkillGroup(group)
    setCurrentTab('mock')
    executeMock(options)
  }

  function executeMock(options: CoreOptions) {
    const core = new Core(options)
    core.exec()
    setManualResult({ options, output: core.damage.output() })
  }

  return {
    basicConfig: {
      burstDps,
      setBurstDps,
      sustainedDps,
      setSustainedDps,
    },
    cardsConfig: {
      danQingCards,
      lingYunCards,
      simulationCards,
      addDanQing,
      addLingYun,
      deleteDanQing,
      deleteLingYun,
      changeDanQing,
      changeLingYun,
      changeDanQingLevel,
      changeLingYunLevel,
      selectDanQingGroup,
      selectLingYunGroup,
      changeAllDanQingLevels,
      changeAllLingYunLevels,
      getDanQingList: (
        id: string,
        cardsList: CardSelectOption[],
      ) => getCardList(danQingCards, id, cardsList),
      getLingYunList: (
        id: string,
        cardsList: CardSelectOption[],
      ) => getCardList(lingYunCards, id, cardsList),
    },
    simulationConfig: {
      currentTab,
      setCurrentTab,
      isAutoMock,
      skillGroup,
      setSkillGroup,
      duration,
      setDuration,
      useRandom,
      setUseRandom,
      autoMockGroup,
      setAutoMockGroup,
      availableTianGongValue,
      setAvailableTianGongValue,
    },
    coreOptions,
    mockResult,
    mergeSameNameDamage,
    setMergeSameNameDamage,
    execMock,
    applyAutoMockResult,
  }
}
