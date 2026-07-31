const DESKTOP_MAX_WORKERS = 4
const MOBILE_MAX_WORKERS = 2

export function getAutoMockWorkerCount(
  whitelistEnabled: boolean,
  isMobile: boolean,
  hardwareConcurrency: number | undefined,
) {
  if (!whitelistEnabled) return 1

  const availableWorkers = Math.max(1, hardwareConcurrency ?? 1)
  return Math.min(
    isMobile ? MOBILE_MAX_WORKERS : DESKTOP_MAX_WORKERS,
    availableWorkers,
  )
}
