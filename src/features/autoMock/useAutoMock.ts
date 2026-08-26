import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SKILL_UPGRADES,
  type CardId,
  type CardOptions,
  type CoreOptions,
  type SkillUpgrade,
} from '@/kernel'
import { toInt } from '@/kernel/utils/math'
import {
  danQingList,
  lingYunList,
  skillList,
  type CardGroup,
} from '@/features/config/simulatorUi'
import {
  AUTO_MOCK_TOP_RESULT_COUNT,
} from '@/features/config/simulatorDefaults'
import { getAutoMockMaxCombinations } from './autoMockSettings'
import {
  mergeAutoMockResults,
  type AutoMockItem,
  type AutoMockResult,
} from './autoMock'
import { getAutoMockWorkerCount } from './autoMockWorkerPool'
import lang from '@/lang/lang'
import type {
  AutoMockWorkerError,
  AutoMockWorkerSuccess,
} from './autoMock.worker'

const cardNames = new Map(
  [...skillList, ...lingYunList].map((card) => [
    card.value,
    card.label,
  ]),
)
const skillIds = new Set(skillList.map((card) => card.value))
const danQingNames = new Map(
  danQingList.map((card) => [card.value, card.label]),
)

function formatAutoMockCard(card: CardOptions) {
  const name = cardNames.get(card.id) ?? card.id
  if (!skillIds.has(card.id)) return `${name}${card.level}级`
  if (!card.upgrade || card.level === 0) return name

  const upgradeName =
    card.upgrade === SKILL_UPGRADES.benZhen
      ? lang.benZhen
      : lang.lingTong
  return `${name}·${upgradeName}${card.level}级`
}

export interface AutoMockViewItem {
  cards: string
  damage: number
  dps: number
  cardOptions: CardOptions[]
  skillGroup: CardGroup
  skillUpgrade: SkillUpgrade
  skillUpgradeLevel: number
}

export function useAutoMock(
  coreOptions: CoreOptions,
  targetCardIds: CardId[],
  additionalValue: string,
  whitelistEnabled: boolean,
  skillCardId: CardId,
  skillUpgrades: SkillUpgrade[],
) {
  const [autoMockLengthOverflow, setAutoMockLengthOverflow] =
    useState(false)
  const [autoMockCurrent, setAutoMockCurrent] = useState(0)
  const [items, setItems] = useState<AutoMockItem[]>([])
  const [
    autoMockDanQingCombination,
    setAutoMockDanQingCombination,
  ] = useState('')
  const [isAutoMockRunning, setIsAutoMockRunning] = useState(false)
  const workersRef = useRef<Worker[]>([])
  const requestIdRef = useRef(0)

  const autoMockResult = useMemo<AutoMockViewItem[]>(
    () =>
      items.map((item) => {
        const skill = skillList.find((card) =>
          item.cards.some((itemCard) => itemCard.id === card.value),
        )!
        const skillCard = item.cards.find(
          (card) => card.id === skill.value,
        )!

        return {
          cards: item.cards
            .map(formatAutoMockCard)
            .join(' + '),
          damage: item.damage,
          dps: item.dps,
          cardOptions: item.cards.filter(
            (card) => !skillIds.has(card.id),
          ),
          skillGroup: skill.group,
          skillUpgrade:
            skillCard.upgrade ?? SKILL_UPGRADES.benZhen,
          skillUpgradeLevel: skillCard.level,
        }
      }),
    [items],
  )

  useEffect(() => {
    return () => {
      workersRef.current.forEach((worker) => worker.terminate())
      workersRef.current = []
    }
  }, [])

  function execAutoMock(onDone?: () => void) {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    workersRef.current.forEach((worker) => worker.terminate())
    workersRef.current = []

    const pendingDanQingCombination = coreOptions.cards
      .filter((card) => danQingNames.has(card.id))
      .map(
        (card) =>
          `${danQingNames.get(card.id)}${card.level}级`,
      )
      .join(' + ')
    const isMobile = window.matchMedia(
      '(pointer: coarse)',
    ).matches
    const workerCount = getAutoMockWorkerCount(
      whitelistEnabled,
      isMobile,
      navigator.hardwareConcurrency,
    )
    const maxCombinations = getAutoMockMaxCombinations()
    const topCount = AUTO_MOCK_TOP_RESULT_COUNT
    const results: AutoMockResult[] = []
    let settled = false

    const terminateWorkers = () => {
      workersRef.current.forEach((worker) => worker.terminate())
      workersRef.current = []
    }

    const fail = (message: string) => {
      if (settled || requestId !== requestIdRef.current) return
      settled = true
      terminateWorkers()
      setIsAutoMockRunning(false)
      console.error(message)
    }

    const handleMessage = (
      event: MessageEvent<
        AutoMockWorkerSuccess | AutoMockWorkerError
      >,
    ) => {
      const message = event.data
      if (
        settled ||
        message.requestId !== requestIdRef.current ||
        message.requestId !== requestId
      ) {
        return
      }
      if (message.type === 'error') {
        fail(message.message)
        return
      }

      results.push(message)
      if (results.length !== workerCount) return

      settled = true
      const result = mergeAutoMockResults(results, topCount)
      terminateWorkers()
      setIsAutoMockRunning(false)
      setAutoMockLengthOverflow(result.overflow)
      setItems(result.items)
      setAutoMockCurrent(0)
      setAutoMockDanQingCombination(pendingDanQingCombination)
      onDone?.()
    }

    try {
      const workers: Worker[] = []
      workersRef.current = workers
      for (
        let workerIndex = 0;
        workerIndex < workerCount;
        workerIndex += 1
      ) {
        const worker = new Worker(
          new URL('./autoMock.worker.ts', import.meta.url),
          { type: 'module' },
        )
        worker.onmessage = handleMessage
        worker.onerror = (event) => fail(event.message)
        workers.push(worker)
      }
      setIsAutoMockRunning(true)

      workers.forEach((worker, workerIndex) => {
        worker.postMessage({
          requestId,
          coreOptions,
          targetCardIds,
          resultCardIds: [...skillList, ...lingYunList].map(
            (card) => card.value,
          ),
          additionalValue: toInt(additionalValue),
          maxCombinations,
          topCount,
          workerIndex,
          workerCount,
          skillCardId,
          skillUpgrades,
        })
      })
    } catch (error) {
      fail(error instanceof Error ? error.message : String(error))
    }
  }

  return {
    autoMockLengthOverflow,
    autoMockCurrent,
    setAutoMockCurrent,
    autoMockResult,
    autoMockDanQingCombination,
    isAutoMockRunning,
    execAutoMock,
  }
}
