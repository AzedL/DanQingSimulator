import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import * as echarts from 'echarts'
import { normalizeOption, mock } from './mock'
import { AutoMock } from './autoMock/AutoMock'
import lang from './lang/lang'
import { dataBase, type TCardIds } from './mock/dataBase/dataBase'
import {
  cardsList,
  treasureLevelValues,
  cardLevelValues,
  tabValues,
  chartOptionValues,
  type TChartOption,
  type TTabs,
} from './mock/dataBase/lists'
import MyCheckbox from './MyComponents/MyCheckbox'
import MySelect from './MyComponents/MySelect'
import MyInput from './MyComponents/MyInput'
import { Label } from './components/ui/label'
import { Button } from './components/ui/button'
import MyTabs from './MyComponents/MyTabs'
import { fixed, toNumber } from './mock/utils/math'
import type { Core } from './mock/core/Core'
import type { DPSDetail } from './mock/core/Damage'
import { Separator } from './components/ui/separator'
import { split } from './mock/utils/key'
import { cn } from './lib/utils'

const autoMock = new AutoMock()

function App() {
  const [coreAttribute, setCoreAttribute] = useState('50000')
  const [basicDamage, setBasicDamage] = useState('50000')
  const [treasureLevel, setTreasureLevel] = useState('10')
  const [taXue, setTaXue] = useState(false)
  const [anJi, setAnJi] = useState(false)

  const [cards, setCards] = useState<{ id: TCardIds | ''; level: number }[]>([
    { id: 'yanHong', level: 6 },
    { id: 'wenMin', level: 6 },
    { id: 'linFeng', level: 6 },
    { id: 'erWeiYaoHu', level: 6 },
    { id: 'shangGuanCe', level: 6 },
    { id: 'liuWeiMoHu', level: 6 },
  ])
  const handleAdd = () => {
    setCards([...cards, { id: '', level: 6 }])
  }
  const handleDelete = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }
  const handleCardChange = (index: number, value: TCardIds) => {
    const newCards = cards.map((card, i) => {
      if (i === index) {
        return { ...card, id: value }
      }
      return card
    })
    setCards(newCards)
  }
  const handleLevelChange = (index: number, value: string) => {
    const newCards = cards.map((card, i) => {
      if (i === index) {
        return { ...card, level: toNumber(value) }
      }
      return card
    })
    setCards(newCards)
  }
  const getCardList = (id: string) => {
    const ids = cards.map((card) => card.id)
    return cardsList.filter((card) => {
      return card.value === id || !ids.includes(card.value)
    })
  }

  const [currentTab, setCurrentTab] = useState<TTabs>('mock')
  const isAutoMock = currentTab === 'autoMock'
  const [duration, setDuration] = useState('600')
  const [useRandom, setUseRandom] = useState(false)
  const [costRemain, setCostRemain] = useState('0')
  const [excludeYouMingQuan, setExcludeYouMingQuan] = useState(true)

  const totalCost =
    cards.reduce((total, card) => {
      const cost = dataBase[card.id as TCardIds]?.cost || 0
      return total + cost
    }, 0) + (isAutoMock ? toNumber(costRemain) : 0)

  const options = useMemo(() => {
    const _cards = cards.filter((card) => !!card.id) as { id: TCardIds; level: number }[]
    return {
      cards: _cards,
      coreAttribute: toNumber(coreAttribute),
      basicDamage: toNumber(basicDamage),
      treasureLevel: toNumber(treasureLevel),
      buffs: {
        taXue,
        anJi,
      },
      duration: isAutoMock ? 600 : toNumber(duration),
      useRandom: isAutoMock ? false : useRandom,
    }
  }, [
    isAutoMock,
    cards,
    coreAttribute,
    basicDamage,
    treasureLevel,
    taXue,
    anJi,
    duration,
    useRandom,
    costRemain,
    excludeYouMingQuan,
  ])
  const coreOptions = useMemo(() => {
    return normalizeOption(options)
  }, [options])
  const resultCoreAttribute = coreOptions.coreAttribute
  const resultAttackPower = coreOptions.attackPower

  const [currentTabResult, setCurrentTabResult] = useState<TTabs>('mock')
  const isAutoMockResult = currentTabResult === 'autoMock'
  const [mockCore, setMockCore] = useState<Core>()
  const [autoMockLength, setAutoMockLength] = useState(0)
  const [autoMockLengthOverflow, setAutoMockLengthOverflow] = useState(false)
  const [autoMockCurrent, setAutoMockCurrent] = useState(0)
  const [autoMockCores, setAutoMockCores] = useState<Core[]>([])
  const exec = () => {
    isAutoMock ? execAutoMock() : execMock()
  }
  const execMock = () => {
    const core = mock(coreOptions)
    console.log(core)
    setMockCore(core)
    setCurrentTabResult('mock')
  }
  const execAutoMock = () => {
    const autoMockCost = toNumber(costRemain)
    const exclude: TCardIds[] = excludeYouMingQuan ? ['youMingQuan'] : []
    const length = autoMock.getCardsCombo(autoMockCost, options, exclude)
    const results = autoMock.exec()
    console.log(results)
    setAutoMockLength(length)
    setAutoMockLengthOverflow(autoMock.isOverMax())
    setAutoMockCores(results)
    setAutoMockCurrent(0)
    setCurrentTabResult('autoMock')
  }

  const [mergeSameNameDamage, setMergeSameNameDamage] = useState(false)
  const mockResult = useMemo(() => {
    if (!mockCore) return []
    const result = mockCore.dps.getDetail()
    if (!mergeSameNameDamage) return result.sort((a, b) => b.dps - a.dps)

    const mergedResult: Record<string, DPSDetail> = {}
    result.forEach((item) => {
      const key = split(item.key)
      if (!mergedResult[key]) {
        mergedResult[key] = { ...item, key }
      } else {
        mergedResult[key].dps = fixed(item.dps + mergedResult[key].dps)
        mergedResult[key].proportion = fixed(item.proportion + mergedResult[key].proportion)
      }
    })
    return Object.values(mergedResult).sort((a, b) => b.dps - a.dps)
  }, [mergeSameNameDamage, mockCore])
  const autoMockResult = useMemo(() => {
    return autoMockCores.map((core) => {
      return {
        cards: core.coreOptions.cards.map((card) => dataBase[card.id].name).join('+'),
        dps: fixed(core.dps.getDPS()),
      }
    })
  }, [autoMockCores])

  const currentCore = useMemo(() => {
    return isAutoMockResult ? autoMockCores[autoMockCurrent] : mockCore
  }, [isAutoMockResult, mockCore, autoMockCores, autoMockCurrent])
  const chartElRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const draw = (data: number[]) => {
    let chart = chartRef.current
    if (!chart) {
      chart = echarts.init(chartElRef.current, 'dark')
      chartRef.current = chart
    }

    chart.setOption({
      xAxis: {
        type: 'category',
        data: data.map((_, i) => i + 1),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data,
          type: 'line',
          smooth: true,
        },
      ],
    })
  }
  const [chartOptions, setChartOptions] = useState<TChartOption>('dps')
  const [currentKey, setCurrentKey] = useState<string>('total')
  const keys = useMemo(() => {
    if (!currentCore) return [{ value: 'total', label: lang.total }]
    if (chartOptions === 'fireCount') return [{ value: 'total', label: lang.total }]

    return currentCore.dps.getKeys().map((key) => {
      return {
        value: key,
        label: lang[key as 'total'] || key,
      }
    })
  }, [currentCore, chartOptions])
  const chartData = useMemo(() => {
    if (!currentCore) return []
    if (chartOptions === 'fireCount') return currentCore.fire.countList
    if (chartOptions === 'dps') return currentCore.dps.getDPSDetailByKey(currentKey)
    if (chartOptions === 'damage') return currentCore.dps.getDamageDetailByKey(currentKey)
    if (chartOptions === 'count') return currentCore.dps.getCountDetailByKey(currentKey)
    return []
  }, [currentCore, chartOptions, currentKey])
  useEffect(() => {
    if (!chartData.length) return

    draw(chartData)
  }, [chartData])
  // const set
  return (
    <div className="mx-auto my-8 flex w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-4 md:px-6">
      <div className="w-full rounded-xl bg-linear-to-br from-indigo-50 to-purple-50 p-6 shadow-lg border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">{lang.basicConfig}</h2>
        <div className="flex flex-wrap items-center justify-start gap-6">
          <div className="flex-1 min-w-48">
            <MyInput
              value={coreAttribute}
              onChange={setCoreAttribute}
              label={lang.coreAttribute}
              tip={lang.coreAttributeTip}
              type="number"
            ></MyInput>
          </div>
          <div className="flex-1 min-w-48">
            <MyInput
              value={basicDamage}
              onChange={setBasicDamage}
              label={lang.basicDamage}
              tip={lang.basicDamageTip}
              type="number"
            ></MyInput>
          </div>
          <div className="flex-1 min-w-48">
            <MySelect
              value={treasureLevel}
              onChange={setTreasureLevel}
              label={lang.treasureLevel}
              tip={lang.treasureLevelTip}
              list={treasureLevelValues}
            ></MySelect>
          </div>
        </div>
        <div className="grid mt-6 gap-4">
          <Label className="text-indigo-800 font-medium text-base">{lang.buff}</Label>
          <div className="flex items-center justify-start gap-6">
            <MyCheckbox value={taXue} onChange={setTaXue} label={lang.taXue}></MyCheckbox>
            <MyCheckbox value={anJi} onChange={setAnJi} label={lang.anJi}></MyCheckbox>
          </div>
        </div>
      </div>

      <div className="mt-6 flex w-full flex-wrap gap-6">
        <div className="flex-2 flex min-h-full min-w-80 max-h-full flex-col gap-3 overflow-hidden rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 p-6 shadow-lg border border-emerald-100">
          <h2 className="text-xl font-bold text-emerald-900 mb-2">{lang.cardsConfig}</h2>
          <div className="flex w-full items-center justify-center gap-3 bg-emerald-100/50 p-3 rounded-lg">
            <div className="flex-1">
              <Label className="text-emerald-800 font-medium">{lang.card}</Label>
            </div>
            <div className="flex-1">
              <Label className="text-emerald-800 font-medium">{lang.level}</Label>
            </div>
            <Button
              className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium px-3 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={handleAdd}
            >
              {lang.add}
            </Button>
          </div>
          {cards.map(({ id, level }, index) => {
            return (
              <div className="flex w-full items-center justify-center gap-3 py-2 pr-3" key={index}>
                <MySelect
                  value={id}
                  onChange={(v) => handleCardChange(index, v as TCardIds)}
                  list={getCardList(id)}
                ></MySelect>
                <MySelect
                  value={String(level)}
                  onChange={(v) => handleLevelChange(index, v)}
                  list={cardLevelValues}
                ></MySelect>
                <Button
                  variant="destructive"
                  className="bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium px-3 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  onClick={() => handleDelete(index)}
                >
                  {lang.delete}
                </Button>
              </div>
            )
          })}
        </div>
        <div className="flex-1 flex min-w-72 max-h-full flex-col gap-5">
          <div className="flex h-auto min-h-80 w-full flex-col gap-5 rounded-xl bg-linear-to-br from-amber-50 to-orange-50 p-6 shadow-lg border border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 mb-1">{lang.mockConfig}</h2>
            <MyTabs value={currentTab} onChange={setCurrentTab} list={tabValues}></MyTabs>
            {!isAutoMock && (
              <div className="flex flex-col gap-4">
                <div>
                  <MyInput value={duration} onChange={setDuration} label={lang.duration} type="number"></MyInput>
                </div>
                <div>
                  <MyCheckbox
                    value={useRandom}
                    onChange={setUseRandom}
                    label={lang.useRandom}
                    tip={lang.useRandomTip}
                  ></MyCheckbox>
                </div>
              </div>
            )}
            {isAutoMock && (
              <div className="flex flex-col gap-4">
                <div>
                  <MyInput
                    value={costRemain}
                    onChange={setCostRemain}
                    label={lang.costRemain}
                    tip={lang.costRemainTip}
                    type="number"
                  ></MyInput>
                </div>
                <div>
                  <MyCheckbox
                    value={excludeYouMingQuan}
                    onChange={setExcludeYouMingQuan}
                    label={lang.exclude}
                  ></MyCheckbox>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-auto w-full flex-col gap-3 rounded-xl bg-linear-to-br from-pink-50 to-rose-50 p-6 shadow-lg border border-pink-100">
            <h2 className="text-xl font-bold text-pink-900 mb-2">{lang.preview}</h2>
            <div className="flex gap-3 items-center">
              <Label className="text-pink-800 font-medium">{lang.totalCost}</Label>
              <p className="text-lg text-emerald-600 font-bold">{totalCost}</p>
            </div>
            <div className="flex gap-3 items-center">
              <Label className="text-pink-800 font-medium">{lang.resultCoreAttribute}</Label>
              <p className="text-lg text-emerald-600 font-bold">{resultCoreAttribute}</p>
            </div>
            <div className="flex gap-3 items-center">
              <Label className="text-pink-800 font-medium">{lang.resultAttackPower}</Label>
              <p className="text-lg text-emerald-600 font-bold">{resultAttackPower}</p>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                className="bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium px-6 py-2"
                onClick={exec}
              >
                {lang.exec}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex min-h-120 w-full flex-col gap-5 rounded-xl bg-linear-to-br from-sky-50 to-blue-50 p-6 shadow-lg border border-sky-100">
        <h2 className="text-xl font-bold text-sky-900 mb-1">{lang.mockResult}</h2>
        <MyTabs value={currentTabResult} onChange={setCurrentTabResult} list={tabValues}></MyTabs>
        {!isAutoMockResult && (
          <>
            <div className="py-1.5 px-3">
              <MyCheckbox
                value={mergeSameNameDamage}
                onChange={setMergeSameNameDamage}
                label={lang.mergeSameNameDamage}
              ></MyCheckbox>
            </div>
            <div className="flex flex-col bg-white/50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[4fr_1fr_1fr] gap-3 p-3 bg-sky-100/80">
                <Label className="text-sky-800 font-medium">{lang.damageName}</Label>
                <Label className="text-sky-800 font-medium">{lang.dps}</Label>
                <Label className="justify-self-end text-sky-800 font-medium">{lang.proportion}</Label>
              </div>
              <Separator className="bg-sky-200" />
              <div className="max-h-96 overflow-y-auto">
                {mockResult.map(({ key, dps, proportion }, index) => {
                  return (
                    <div
                      className={cn(
                        'grid grid-cols-[4fr_1fr_1fr] gap-3 p-3 hover:bg-sky-50 transition-colors',
                        index % 2 === 0 ? 'bg-white/80' : ''
                      )}
                      key={key}
                    >
                      <Label>{lang[key as 'total'] || key}</Label>
                      <Label className="font-medium text-sky-700">{dps}</Label>
                      <Label className="justify-self-end font-medium text-sky-700">{proportion + '%'}</Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
        {isAutoMockResult && (
          <>
            <div className="flex gap-3 items-center px-3">
              <Label className="text-sky-800 font-medium">{lang.autoMockLength}</Label>
              <p className={cn('text-lg text-sky-700 font-bold', autoMockLengthOverflow && 'text-red-500')}>
                {autoMockLength}
              </p>
            </div>
            {autoMockLengthOverflow && (
              <div className="px-3">
                <Label className="text-red-500 font-medium">{lang.overflow}</Label>
              </div>
            )}
            <div className="flex flex-col bg-white/50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[5fr_1fr] gap-3 p-3 bg-sky-100/80">
                <Label className="text-sky-800 font-medium">{lang.cardsCombo}</Label>
                <Label className="justify-self-end text-sky-800 font-medium">{lang.dps}</Label>
              </div>
              <Separator className="bg-sky-200" />
              <div className="max-h-96 overflow-y-auto">
                {autoMockResult.map(({ cards, dps }, index) => {
                  return (
                    <div
                      className={cn(
                        'grid grid-cols-[5fr_1fr] gap-3 p-3 cursor-pointer hover:bg-sky-50 transition-colors',
                        autoMockCurrent === index ? 'bg-sky-200' : index % 2 === 0 ? 'bg-white/80' : ''
                      )}
                      key={cards}
                      onClick={() => setAutoMockCurrent(index)}
                    >
                      <Label className="cursor-pointer">{cards}</Label>
                      <Label className="cursor-pointer justify-self-end font-medium text-sky-700">{dps}</Label>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 mr-auto flex w-full max-w-105 items-center justify-start gap-5 bg-linear-to-r from-violet-50 to-purple-50 px-5 py-4 rounded-xl shadow-md border border-violet-100">
        <div className="flex-1">
          <MySelect
            value={chartOptions}
            onChange={(v) => {
              setChartOptions(v)
              if (v === 'fireCount') {
                setCurrentKey('total')
              }
            }}
            list={chartOptionValues}
            maxWidth={180}
          ></MySelect>
        </div>
        <div className="flex-1">
          <MySelect value={currentKey} onChange={setCurrentKey} list={keys} maxWidth={180}></MySelect>
        </div>
      </div>

      <div className="grid mt-4 min-h-96 w-full overflow-auto rounded-xl shadow-lg bg-black border border-slate-200">
        <div className="h-full w-full" ref={chartElRef}></div>
      </div>
    </div>
  )
}

export default App
