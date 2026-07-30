import { useState } from 'react'
import './App.css'
import BasicConfigPanel from '@/components/panels/BasicConfigPanel'
import CardLoadoutPanel from '@/components/panels/CardLoadoutPanel'
import ResultPanel from '@/components/panels/ResultPanel'
import SimulationControlPanel from '@/components/panels/SimulationControlPanel'
import {
  danQingLevelValues,
  danQingList,
  cardGroups,
  lingYunLevelValues,
  lingYunList,
  tabValues,
} from '@/features/config/simulatorUi'
import { useAutoMock } from '@/features/autoMock/useAutoMock'
import { APP_VIEW_DEFAULTS } from '@/features/config/simulatorDefaults'
import { useSimulation } from '@/features/simulator/useSimulation'

function App() {
  const simulation = useSimulation()
  const autoMockCardIds = lingYunList
    .filter(
      (card) =>
        card.group === simulation.simulationConfig.autoMockGroup,
    )
    .map((card) => card.value)
  const autoMock = useAutoMock(
    simulation.coreOptions,
    autoMockCardIds,
    simulation.simulationConfig.availableTianGongValue,
  )

  const [currentTabResult, setCurrentTabResult] = useState(APP_VIEW_DEFAULTS.currentTabResult)
  const danQingCost = simulation.cardsConfig.danQingCards.reduce(
    (total, card) =>
      total +
      (danQingList.find((option) => option.value === card.id)?.cost ?? 0),
    0,
  )
  const lingYunCount = simulation.cardsConfig.lingYunCards.reduce(
    (total, card) => total + (card.id ? card.level : 0),
    0,
  )
  const danQingQuickGroups = cardGroups.map((label) => ({
    label,
    ids: danQingList
      .filter((option) => option.group === label)
      .map((option) => option.value),
  }))
  const lingYunQuickGroups = cardGroups.map((label) => ({
    label,
    ids: lingYunList
      .filter((option) => option.group === label)
      .map((option) => option.value),
  }))

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

      <div className="mt-6 grid w-full items-start gap-6 lg:grid-cols-2">
        <CardLoadoutPanel
          title="丹青绘灵"
          addLabel="添加丹青"
          theme="danQing"
          cards={simulation.cardsConfig.danQingCards}
          currentValue={danQingCost}
          maxValue={15}
          quickGroups={danQingQuickGroups}
          maxQuickLevel={6}
          levelValues={danQingLevelValues}
          getCardList={(id) =>
            simulation.cardsConfig.getDanQingList(id, danQingList)
          }
          handleAdd={simulation.cardsConfig.addDanQing}
          handleDelete={simulation.cardsConfig.deleteDanQing}
          handleCardChange={simulation.cardsConfig.changeDanQing}
          handleLevelChange={simulation.cardsConfig.changeDanQingLevel}
          handleGroupSelect={simulation.cardsConfig.selectDanQingGroup}
          handleAllLevelChange={
            simulation.cardsConfig.changeAllDanQingLevels
          }
        />

        <CardLoadoutPanel
          title="天工机巧"
          addLabel="添加天工"
          theme="lingYun"
          cards={simulation.cardsConfig.lingYunCards}
          currentValue={lingYunCount}
          quickGroups={lingYunQuickGroups}
          maxQuickLevel={5}
          levelValues={lingYunLevelValues}
          getCardList={(id) =>
            simulation.cardsConfig.getLingYunList(id, lingYunList)
          }
          handleAdd={simulation.cardsConfig.addLingYun}
          handleDelete={simulation.cardsConfig.deleteLingYun}
          handleCardChange={simulation.cardsConfig.changeLingYun}
          handleLevelChange={simulation.cardsConfig.changeLingYunLevel}
          handleGroupSelect={simulation.cardsConfig.selectLingYunGroup}
          handleAllLevelChange={
            simulation.cardsConfig.changeAllLingYunLevels
          }
        />
      </div>

      <div className="mt-6 w-full">
        <SimulationControlPanel
          currentTab={simulation.simulationConfig.currentTab}
          setCurrentTab={simulation.simulationConfig.setCurrentTab}
          tabValues={tabValues}
          isAutoMock={simulation.simulationConfig.isAutoMock}
          skillGroup={simulation.simulationConfig.skillGroup}
          setSkillGroup={simulation.simulationConfig.setSkillGroup}
          duration={simulation.simulationConfig.duration}
          setDuration={simulation.simulationConfig.setDuration}
          useRandom={simulation.simulationConfig.useRandom}
          setUseRandom={simulation.simulationConfig.setUseRandom}
          autoMockGroup={simulation.simulationConfig.autoMockGroup}
          setAutoMockGroup={simulation.simulationConfig.setAutoMockGroup}
          selectedTianGongValue={lingYunCount}
          availableTianGongValue={
            simulation.simulationConfig.availableTianGongValue
          }
          setAvailableTianGongValue={
            simulation.simulationConfig.setAvailableTianGongValue
          }
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
        autoMockLengthOverflow={autoMock.autoMockLengthOverflow}
        autoMockCurrent={autoMock.autoMockCurrent}
        setAutoMockCurrent={autoMock.setAutoMockCurrent}
        autoMockResult={autoMock.autoMockResult}
        onAutoMockResultDoubleClick={(cards, skillGroup) => {
          simulation.applyAutoMockResult(cards, skillGroup)
          setCurrentTabResult('mock')
        }}
      />

      <footer className="mt-2 w-full pb-2 pr-1 text-right">
        <a
          href="https://github.com/AzedL/DanQingSimulator"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-500 transition-colors hover:text-teal-700 focus-visible:text-teal-700 focus-visible:outline-none"
        >
          by 日暮戈薇@一剑诛仙
        </a>
      </footer>
    </div>
  )
}

export default App
