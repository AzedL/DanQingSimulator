import type { CardId, CoreOptions } from '../../kernel'
import {
  runAutoMockPartition,
  type AutoMockResult,
} from './autoMock'

interface AutoMockWorkerRequest {
  requestId: number
  coreOptions: CoreOptions
  targetCardIds: CardId[]
  resultCardIds: CardId[]
  additionalValue: number
  maxCombinations: number
  topCount: number
  workerIndex: number
  workerCount: number
}

interface AutoMockWorkerSuccess extends AutoMockResult {
  requestId: number
  type: 'success'
}

interface AutoMockWorkerError {
  requestId: number
  type: 'error'
  message: string
}

self.onmessage = (event: MessageEvent<AutoMockWorkerRequest>) => {
  const { requestId, ...input } = event.data

  try {
    const { workerIndex, workerCount, ...autoMockInput } = input
    const result = runAutoMockPartition(
      autoMockInput,
      workerIndex,
      workerCount,
    )
    const response: AutoMockWorkerSuccess = {
      requestId,
      type: 'success',
      ...result,
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

export type {
  AutoMockWorkerError,
  AutoMockWorkerRequest,
  AutoMockWorkerSuccess,
}
