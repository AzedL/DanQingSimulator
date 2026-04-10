import { runAutoMockGetTop } from '@/engine/autoMock'
import type { SimulationMockOptions } from '@/engine/Simulation'
import type { LightMockResult } from '@/autoMock'

interface AutoMockWorkerRequest {
  requestId: number
  options: SimulationMockOptions
  costRemain: string
  excludeYouMingQuan: boolean
}

interface AutoMockWorkerSuccess {
  requestId: number
  type: 'success'
  length: number
  overflow: boolean
  items: LightMockResult[]
}

interface AutoMockWorkerError {
  requestId: number
  type: 'error'
  message: string
}

self.onmessage = (event: MessageEvent<AutoMockWorkerRequest>) => {
  const { requestId, options, costRemain, excludeYouMingQuan } = event.data

  try {
    const result = runAutoMockGetTop(options, costRemain, excludeYouMingQuan)
    const response: AutoMockWorkerSuccess = {
      requestId,
      type: 'success',
      length: result.length,
      overflow: result.overflow,
      items: result.top.map((item) => ({
        cardsCombo: item.cardsCombo,
        dps: item.dps,
      })),
    }

    self.postMessage(response)
  } catch (error) {
    const response: AutoMockWorkerError = {
      requestId,
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    }

    self.postMessage(response)
  }
}

export type { AutoMockWorkerRequest, AutoMockWorkerSuccess, AutoMockWorkerError }
