import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import SelectField from '@/components/form/SelectField'
import type { ChartMetric } from '@/domain/config/simulatorUi'
import lang from '@/lang/lang'

interface Props {
  chartOptions: ChartMetric
  setChartOptions: (value: ChartMetric) => void
  chartOptionValues: { value: ChartMetric; label: string }[]
  currentKey: string
  setCurrentKey: (value: string) => void
  keys: { value: string; label: string }[]
  chartData: number[]
}

export default function ChartPanel(props: Props) {
  const chartElRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!props.chartData.length || !chartElRef.current) return

    let chart = chartRef.current
    if (!chart) {
      chart = echarts.init(chartElRef.current)
      chartRef.current = chart
    }

    chart.setOption({
      backgroundColor: 'transparent',
      textStyle: { color: '#e2e8f0' },
      xAxis: {
        type: 'category',
        data: props.chartData.map((_, i) => i + 1),
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#475569' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
      },
      series: [
        {
          data: props.chartData,
          type: 'line',
          smooth: true,
          lineStyle: { color: '#60a5fa', width: 3 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(96, 165, 250, 0.3)' },
                { offset: 1, color: 'rgba(96, 165, 250, 0.05)' },
              ],
            },
          },
          itemStyle: { color: '#60a5fa' },
        },
      ],
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
      },
    })

    return () => {
      chart?.resize()
    }
  }, [props.chartData])

  useEffect(() => {
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <>
      <div className="mt-6 mr-auto flex w-full max-w-105 items-center justify-start gap-5 rounded-xl border border-violet-100 bg-linear-to-r from-violet-50 to-purple-50 px-5 py-4 shadow-md">
        <div className="flex-1">
          <SelectField
            value={props.chartOptions}
            onChange={(value) => {
              props.setChartOptions(value as ChartMetric)
              if (value === 'fireCount') {
                props.setCurrentKey('total')
              }
            }}
            list={props.chartOptionValues}
            maxWidth={180}
            label={lang.damage}
          />
        </div>
        <div className="flex-1">
          <SelectField value={props.currentKey} onChange={props.setCurrentKey} list={props.keys} maxWidth={180} label={lang.damageName} />
        </div>
      </div>

      <div className="mt-4 grid min-h-96 w-full overflow-auto rounded-xl border border-slate-200 bg-black shadow-lg">
        <div className="h-full w-full" ref={chartElRef}></div>
      </div>
    </>
  )
}