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
  treasureLevelValues,
  type ChartMetric,
  type SimulatorTab,
} from '@/domain/config/simulatorUi'
import { useChartSeries } from '@/features/chart/useChartSeries'
import { useOptimizer } from '@/features/optimizer/useOptimizer'
import { useSimulation } from '@/features/simulator/useSimulation'

function App() {
  const simulation = useSimulation()
  const optimizer = useOptimizer(
    simulation.options,
    simulation.simulationConfig.costRemain,
    simulation.simulationConfig.excludeYouMingQuan,
  )

  const [currentTabResult, setCurrentTabResult] = useState<SimulatorTab>('mock')
  const [chartOptions, setChartOptions] = useState<ChartMetric>('dps')
  const [currentKey, setCurrentKey] = useState('total')

  const currentCore = useMemo(() => {
    return currentTabResult === 'autoMock' ? optimizer.autoMockCores[optimizer.autoMockCurrent] : simulation.manualCore
  }, [currentTabResult, optimizer.autoMockCores, optimizer.autoMockCurrent, simulation.manualCore])

  const { keys, chartData } = useChartSeries(currentCore, chartOptions, currentKey)

  function handleExecute() {
    if (simulation.simulationConfig.isAutoMock) {
      optimizer.execAutoMock()
      setCurrentTabResult('autoMock')
      return
    }

    simulation.execMock()
    setCurrentTabResult('mock')
  }

  return (
    <div className="mx-auto my-8 flex w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-4 md:px-6">
      <BasicConfigPanel {...simulation.basicConfig} treasureLevelValues={treasureLevelValues} />

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
        autoMockLength={optimizer.autoMockLength}
        autoMockLengthOverflow={optimizer.autoMockLengthOverflow}
        autoMockCurrent={optimizer.autoMockCurrent}
        setAutoMockCurrent={optimizer.setAutoMockCurrent}
        autoMockResult={optimizer.autoMockResult}
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