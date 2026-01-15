import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import * as echarts from 'echarts'
import { normalizeOption, mock } from './mock'
import { AutoMock } from './autoMock/AutoMock'
import lang from './lang/lang'
import { cardsList, dataBase, type TCardIds } from './mock/dataBase/dataBase'
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

const treasureLevelValues = Array.from({ length: 11 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

const cardLevelValues = Array.from({ length: 7 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

type TTabs = 'mock' | 'autoMock'
const tabValues: { value: TTabs; label: string }[] = [
  { label: lang.mock, value: 'mock' },
  { label: lang.autoMock, value: 'autoMock' },
]

type TChartOption = 'damage' | 'dps' | 'count' | 'fireCount'
const chartOptionValues: { value: TChartOption; label: string }[] = [
  { label: lang.dps, value: 'dps' },
  { label: lang.damage, value: 'damage' },
  { label: lang.count, value: 'count' },
  { label: lang.fireCount, value: 'fireCount' },
]

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
  const [autoMockCurrent, setAutoMockCurrent] = useState(0)
  const [autoMockCores, setAutoMockCores] = useState<Core[]>([])
  const exec = () => {
    isAutoMock ? execAutoMock() : execMock()
  }
  const execMock = () => {
    const core = mock(coreOptions)
    setMockCore(core)
    setCurrentTabResult('mock')
  }
  const execAutoMock = () => {
    const autoMockCost = toNumber(costRemain)
    const exclude: TCardIds[] = excludeYouMingQuan ? ['youMingQuan'] : []
    const length = autoMock.getCardsCombo(autoMockCost, options, exclude)
    const results = autoMock.exec()
    setAutoMockLength(length)
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
    <div className="mx-auto my-10 flex w-full max-w-270 flex-col items-center justify-center overflow-hidden px-5">
      <div className="w-full rounded-[10px] bg-indigo-50 p-5 shadow-md gap-7.5">
        <div className="flex flex-wrap items-center justify-start gap-7.5">
          <div className="flex-1 min-w-45">
            <MyInput
              value={coreAttribute}
              onChange={setCoreAttribute}
              label={lang.coreAttribute}
              tip={lang.coreAttributeTip}
              type="number"
              width={180}
            ></MyInput>
          </div>
          <div className="flex-1 min-w-45">
            <MyInput
              value={basicDamage}
              onChange={setBasicDamage}
              label={lang.basicDamage}
              tip={lang.basicDamageTip}
              type="number"
              width={180}
            ></MyInput>
          </div>
          <div className="flex-1 min-w-45">
            <MySelect
              value={treasureLevel}
              onChange={setTreasureLevel}
              label={lang.treasureLevel}
              tip={lang.treasureLevelTip}
              list={treasureLevelValues}
              width={180}
            ></MySelect>
          </div>
        </div>
        <div className="grid mt-7.5 gap-5">
          <Label>{lang.buff}</Label>
          <div className="flex items-center justify-start gap-7.5">
            <MyCheckbox value={taXue} onChange={setTaXue} label={lang.taXue}></MyCheckbox>
            <MyCheckbox value={anJi} onChange={setAnJi} label={lang.anJi}></MyCheckbox>
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full flex-wrap gap-5">
        <div className="flex-2 flex min-h-full min-w-85 max-h-full flex-col gap-2.5 overflow-hidden rounded-[10px] bg-emerald-50 p-5 shadow-md">
          <div className="flex w-full items-center justify-center gap-2.5">
            <div className="flex-1">
              <Label>{lang.card}</Label>
            </div>
            <div className="flex-1">
              <Label>{lang.level}</Label>
            </div>
            <Button size="icon" onClick={handleAdd}>
              +
            </Button>
          </div>
          {cards.map(({ id, level }, index) => {
            return (
              <div className="flex w-full items-center justify-center gap-2.5" key={index}>
                <MySelect
                  value={id}
                  onChange={(v) => handleCardChange(index, v as TCardIds)}
                  list={getCardList(id)}
                  maxWidth={180}
                  minWidth={120}
                ></MySelect>
                <MySelect
                  value={String(level)}
                  onChange={(v) => handleLevelChange(index, v)}
                  list={cardLevelValues}
                  maxWidth={180}
                  minWidth={120}
                ></MySelect>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(index)}>
                  -
                </Button>
              </div>
            )
          })}
        </div>
        <div className="flex-1 flex min-w-50 max-h-full flex-col gap-5">
          <div className="flex h-60 w-full flex-col gap-5 rounded-[10px] bg-amber-50 p-5 shadow-md">
            <MyTabs value={currentTab} onChange={setCurrentTab} list={tabValues}></MyTabs>
            {!isAutoMock && (
              <div className="flex flex-col gap-5">
                <div>
                  <MyInput
                    value={duration}
                    onChange={setDuration}
                    label={lang.duration}
                    type="number"
                    width={180}
                  ></MyInput>
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
              <div className="flex flex-col gap-5">
                <div>
                  <MyInput
                    value={costRemain}
                    onChange={setCostRemain}
                    label={lang.costRemain}
                    tip={lang.costRemainTip}
                    type="number"
                    width={180}
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
          <div className="flex h-41.5 w-full flex-col gap-2.5 rounded-[10px] bg-pink-50 p-5 shadow-md">
            <div className="flex gap-2.5">
              <Label>{lang.totalCost}</Label>
              <p className="text-sm text-green-600 font-bold">{totalCost}</p>
            </div>
            <div className="flex gap-2.5">
              <Label>{lang.resultCoreAttribute}</Label>
              <p className="text-sm text-green-600 font-bold">{resultCoreAttribute}</p>
            </div>
            <div className="flex gap-2.5">
              <Label>{lang.resultAttackPower}</Label>
              <p className="text-sm text-green-600 font-bold">{resultAttackPower}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={exec}>{lang.exec}</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex min-h-90 w-full flex-col gap-5 rounded-[10px] bg-sky-50 p-5 shadow-md">
        <MyTabs value={currentTabResult} onChange={setCurrentTabResult} list={tabValues}></MyTabs>
        {!isAutoMockResult && (
          <>
            <MyCheckbox
              value={mergeSameNameDamage}
              onChange={setMergeSameNameDamage}
              label={lang.mergeSameNameDamage}
            ></MyCheckbox>
            <div className="flex flex-col">
              <div className="grid grid-cols-[4fr_1fr_1fr] gap-2.5 p-1.25">
                <Label>{lang.damageName}</Label>
                <Label>{lang.dps}</Label>
                <Label className="justify-self-end">{lang.proportion}</Label>
              </div>
              <Separator />
              {mockResult.map(({ key, dps, proportion }) => {
                return (
                  <div className="grid grid-cols-[4fr_1fr_1fr] gap-2.5 p-1.25" key={key}>
                    <Label>{lang[key as 'total'] || key}</Label>
                    <Label>{dps}</Label>
                    <Label className="justify-self-end">{proportion + '%'}</Label>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {isAutoMockResult && (
          <>
            <div className="flex gap-2.5">
              <Label>{lang.autoMockLength}</Label>
              <p className="text-sm text-muted-foreground">{autoMockLength}</p>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-[5fr_1fr] gap-2.5 p-1.25">
                <Label>{lang.cardsCombo}</Label>
                <Label className="justify-self-end">{lang.dps}</Label>
              </div>
              <Separator />
              {autoMockResult.map(({ cards, dps }, index) => {
                return (
                  <div
                    className={cn(
                      'grid grid-cols-[5fr_1fr] gap-2.5 p-1.25 cursor-pointer hover:bg-slate-200',
                      autoMockCurrent === index ? 'bg-slate-400' : ''
                    )}
                    key={cards}
                    onClick={() => setAutoMockCurrent(index)}
                  >
                    <Label className="cursor-pointer">{cards}</Label>
                    <Label className="cursor-pointer justify-self-end">{dps}</Label>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <div className="mt-5 mr-auto flex w-full max-w-95 items-center justify-start gap-5">
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
        <MySelect value={currentKey} onChange={setCurrentKey} list={keys} maxWidth={180}></MySelect>
      </div>
      <div className="grid mt-2.5 min-h-90 w-full overflow-auto rounded-[10px] shadow-md">
        <div className="h-full w-full" ref={chartElRef}></div>
      </div>
    </div>
  )
}

export default App
