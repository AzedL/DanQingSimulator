import { useEffect, useMemo, useRef, useState } from 'react'
import type { CardId, CardOptions, CoreOptions } from '@/kernel'
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
import type { AutoMockItem } from './autoMock'
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

export interface AutoMockViewItem {
  cards: string
  dps: number
  cardOptions: CardOptions[]
  skillGroup: CardGroup
}

export function useAutoMock(
  coreOptions: CoreOptions,
  targetCardIds: CardId[],
  additionalValue: string,
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
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const onDoneRef = useRef<(() => void) | undefined>(undefined)
  const pendingDanQingCombinationRef = useRef('')

  const autoMockResult = useMemo<AutoMockViewItem[]>(
    () =>
      items.map((item) => {
        const skill = skillList.find((card) =>
          item.cards.some((itemCard) => itemCard.id === card.value),
        )!

        return {
          cards: item.cards
            .map(
              (card) =>
                skillIds.has(card.id)
                  ? cardNames.get(card.id) ?? card.id
                  : `${cardNames.get(card.id) ?? card.id}${card.level}级`,
            )
            .join(' + '),
          dps: item.dps,
          cardOptions: item.cards.filter(
            (card) => !skillIds.has(card.id),
          ),
          skillGroup: skill.group,
        }
      }),
    [items],
  )

  useEffect(() => {
    const worker = new Worker(
      new URL('./autoMock.worker.ts', import.meta.url),
      { type: 'module' },
    )
    workerRef.current = worker

    worker.onmessage = (
      event: MessageEvent<
        AutoMockWorkerSuccess | AutoMockWorkerError
      >,
    ) => {
      const message = event.data
      if (message.requestId !== requestIdRef.current) return

      setIsAutoMockRunning(false)
      if (message.type === 'error') {
        console.error(message.message)
        onDoneRef.current = undefined
        return
      }

      setAutoMockLengthOverflow(message.overflow)
      setItems(message.items)
      setAutoMockCurrent(0)
      setAutoMockDanQingCombination(
        pendingDanQingCombinationRef.current,
      )
      onDoneRef.current?.()
      onDoneRef.current = undefined
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  function execAutoMock(onDone?: () => void) {
    const worker = workerRef.current
    if (!worker) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    onDoneRef.current = onDone
    pendingDanQingCombinationRef.current = coreOptions.cards
      .filter((card) => danQingNames.has(card.id))
      .map(
        (card) =>
          `${danQingNames.get(card.id)}${card.level}级`,
      )
      .join(' + ')
    setIsAutoMockRunning(true)
    worker.postMessage({
      requestId,
      coreOptions,
      targetCardIds,
      resultCardIds: [...skillList, ...lingYunList].map(
        (card) => card.value,
      ),
      additionalValue: toInt(additionalValue),
      maxCombinations: getAutoMockMaxCombinations(),
      topCount: AUTO_MOCK_TOP_RESULT_COUNT,
    })
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
