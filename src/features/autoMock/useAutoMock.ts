import { useEffect, useMemo, useRef, useState } from 'react'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import { runAutoMockCoresByTop } from '@/engine/autoMock'
import type { SimulationCore, SimulationMockOptions } from '@/engine/Simulation'
import { fixed } from '@/kernel/utils/math'
import type { AutoMockWorkerError, AutoMockWorkerSuccess } from './autoMock.worker'

export function useAutoMock(options: SimulationMockOptions, costRemain: string, excludeYouMingQuan: boolean) {
  const [autoMockLength, setAutoMockLength] = useState(0)
  const [autoMockLengthOverflow, setAutoMockLengthOverflow] = useState(false)
  const [autoMockCurrent, setAutoMockCurrent] = useState(0)
  const [autoMockCores, setAutoMockCores] = useState<SimulationCore[]>([])
  const [isAutoMockRunning, setIsAutoMockRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const optionsRef = useRef(options)
  const onDoneRef = useRef<(() => void) | undefined>(undefined)

  const autoMockResult = useMemo(() => {
    return autoMockCores.map((core) => {
      return {
        cards: core.coreOptions.cards.map((card) => cardCatalog[card.id].name).join('+'),
        dps: fixed(core.dps.getDPS()),
      }
    })
  }, [autoMockCores])

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    const worker = new Worker(new URL('./autoMock.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<AutoMockWorkerSuccess | AutoMockWorkerError>) => {
      const message = event.data
      if (message.requestId !== requestIdRef.current) {
        return
      }

      if (message.type === 'error') {
        console.error(message.message)
        setIsAutoMockRunning(false)
        onDoneRef.current = undefined
        return
      }

      setAutoMockLength(message.length)
      setAutoMockLengthOverflow(message.overflow)
      setAutoMockCores(runAutoMockCoresByTop(message.items, optionsRef.current))
      setAutoMockCurrent(0)
      setIsAutoMockRunning(false)
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
    if (!worker) {
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    onDoneRef.current = onDone
    setIsAutoMockRunning(true)

    worker.postMessage({
      requestId,
      options,
      costRemain,
      excludeYouMingQuan,
    })
  }

  return {
    autoMockLength,
    autoMockLengthOverflow,
    autoMockCurrent,
    setAutoMockCurrent,
    autoMockCores,
    autoMockResult,
    isAutoMockRunning,
    execAutoMock,
  }
}
