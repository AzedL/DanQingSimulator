import { useMemo, useState } from 'react'
import './App.css'
import BasicConfigPanel from '@/components/panels/BasicConfigPanel'
import CardLoadoutPanel from '@/components/panels/CardLoadoutPanel'
import ChartPanel from '@/components/panels/ChartPanel'
import ResultPanel from '@/components/panels/ResultPanel'
import SimulationControlPanel from '@/components/panels/SimulationControlPanel'
import {
  cardLevelValues,
  cardsList,
  chartOptionValues,
  tabValues,
} from '@/domain/config/simulatorUi'
import { useChartSeries } from '@/features/chart/useChartSeries'
import { useAutoMock } from '@/features/autoMock/useAutoMock'
import { APP_VIEW_DEFAULTS } from '@/domain/config/simulatorDefaults'
import { useSimulation } from '@/features/simulator/useSimulation'

function App() {
  const simulation = useSimulation()
  const autoMock = useAutoMock(
    simulation.options,
    simulation.simulationConfig.costRemain,
    simulation.simulationConfig.excludeYouMingQuan,
  )

  const [currentTabResult, setCurrentTabResult] = useState(APP_VIEW_DEFAULTS.currentTabResult)
  const [chartOptions, setChartOptions] = useState(APP_VIEW_DEFAULTS.chartOptions)
  const [currentKey, setCurrentKey] = useState(APP_VIEW_DEFAULTS.currentKey)

  const currentCore = useMemo(() => {
    return currentTabResult === 'autoMock' ? autoMock.autoMockCores[autoMock.autoMockCurrent] : simulation.manualCore
  }, [currentTabResult, autoMock.autoMockCores, autoMock.autoMockCurrent, simulation.manualCore])

  const { keys, chartData } = useChartSeries(currentCore, chartOptions, currentKey)

  function handleExecute() {
    if (simulation.simulationConfig.isAutoMock) {
      autoMock.execAutoMock(() => {
        setCurrentTabResult('autoMock')
      })
      return
    }

    simulation.execMock()
    setCurrentTabResult('mock')
  }

  return (
    <div className="mx-auto my-8 flex w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-4 md:px-6">
      <BasicConfigPanel {...simulation.basicConfig} />

      <div className="mt-6 flex w-full flex-wrap gap-6">
        <CardLoadoutPanel
          cards={simulation.cardsConfig.cards}
          cardLevelValues={cardLevelValues}
          getCardList={(id) => simulation.cardsConfig.getCardList(id, cardsList)}
          handleAdd={simulation.cardsConfig.handleAdd}
          handleDelete={simulation.cardsConfig.handleDelete}
          handleCardChange={simulation.cardsConfig.handleCardChange}
          handleLevelChange={simulation.cardsConfig.handleLevelChange}
        />

        <SimulationControlPanel
          currentTab={simulation.simulationConfig.currentTab}
          setCurrentTab={simulation.simulationConfig.setCurrentTab}
          tabValues={tabValues}
          isAutoMock={simulation.simulationConfig.isAutoMock}
          duration={simulation.simulationConfig.duration}
          setDuration={simulation.simulationConfig.setDuration}
          useRandom={simulation.simulationConfig.useRandom}
          setUseRandom={simulation.simulationConfig.setUseRandom}
          costRemain={simulation.simulationConfig.costRemain}
          setCostRemain={simulation.simulationConfig.setCostRemain}
          excludeYouMingQuan={simulation.simulationConfig.excludeYouMingQuan}
          setExcludeYouMingQuan={simulation.simulationConfig.setExcludeYouMingQuan}
          totalCost={simulation.preview.totalCost}
          resultCoreAttribute={simulation.preview.resultCoreAttribute}
          resultAttackPower={simulation.preview.resultAttackPower}
          isExecuting={simulation.simulationConfig.isAutoMock ? autoMock.isAutoMockRunning : false}
          onExecute={handleExecute}
        />
      </div>

      <ResultPanel
        currentTabResult={currentTabResult}
        setCurrentTabResult={setCurrentTabResult}
        tabValues={tabValues}
        mergeSameNameDamage={simulation.mergeSameNameDamage}
        setMergeSameNameDamage={simulation.setMergeSameNameDamage}
        mockResult={simulation.mockResult}
        autoMockLength={autoMock.autoMockLength}
        autoMockLengthOverflow={autoMock.autoMockLengthOverflow}
        autoMockCurrent={autoMock.autoMockCurrent}
        setAutoMockCurrent={autoMock.setAutoMockCurrent}
        autoMockResult={autoMock.autoMockResult}
      />

      <ChartPanel
        chartOptions={chartOptions}
        setChartOptions={setChartOptions}
        chartOptionValues={chartOptionValues}
        currentKey={currentKey}
        setCurrentKey={setCurrentKey}
        keys={keys}
        chartData={chartData}
      />
    </div>
  )
}

export default App
