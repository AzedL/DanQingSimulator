import { useMemo } from 'react'
import lang from '@/lang/lang'
import type { ChartMetric } from '@/domain/config/simulatorUi'
import type { SimulationCore } from '@/engine/Simulation'

export function useChartSeries(currentCore: SimulationCore | undefined, chartOptions: ChartMetric, currentKey: string) {
  const keys = useMemo(() => {
    if (!currentCore) return [{ value: 'total', label: lang.total }]
    if (chartOptions === 'fireCount') return [{ value: 'total', label: lang.total }]

    return currentCore.dps.getKeys().map((key) => {
      return {
        value: key,
        label: lang[key as 'total'] || key,
      }
    })
  }, [chartOptions, currentCore])

  const chartData = useMemo(() => {
    if (!currentCore) return []
    if (chartOptions === 'fireCount') return currentCore.fire.countList
    if (chartOptions === 'dps') return currentCore.dps.getDPSDetailByKey(currentKey)
    if (chartOptions === 'damage') return currentCore.dps.getDamageDetailByKey(currentKey)
    if (chartOptions === 'count') return currentCore.dps.getCountDetailByKey(currentKey)
    return []
  }, [chartOptions, currentCore, currentKey])

  return { keys, chartData }
}