# 项目摘要

本文件是后续会话的默认上下文入口，目标是提供“当前仍然有效、且足以帮助新会话快速接手”的项目信息，而不是记录完整历史。

如需了解阅读规则、模块命中规则或文件职责，先看 `index.md`。

## 当前状态

- 项目已经从历史 `mock` 结构收口到更清晰的分层结构
- 当前主方向是“保留旧内核、收口外围层”，不是重写整套模拟核心
- 现阶段更适合补测试、稳行为、补回归保护，而不是继续大规模重构

当前主要目录分工：

- `src/domain`
  - 卡牌类型、卡牌目录、卡牌参数
  - 规则推导
  - UI 与默认值配置
- `src/engine`
  - 模拟入口
  - 自动模拟入口
- `src/features`
  - React 业务状态编排
- `src/components`
  - 面板和表单包装组件
- `src/kernel`
  - 旧模拟内核
  - 旧运行时卡牌行为
  - 数学 / 概率 / 冷却等工具
- `src/autoMock`
  - 自动模拟组合生成与执行逻辑

## 开始任务前默认检查

开始改动前，默认先确认：

- 本轮任务主要落在哪个区域：`domain`、`engine`、`kernel`、`autoMock`、`features`
- 是否命中对应的 `rules/*.md`
- 改动完成后至少应做什么验证

如果任务明显依赖以下模块语义，先看对应规则文件：

- `src/domain/**` -> `rules/domain.md`
- `src/kernel/**` 或 `src/engine/Simulation.ts` -> `rules/kernel.md`
- `src/autoMock/**` 或 `src/engine/autoMock.ts` 或 `src/features/autoMock/**` -> `rules/autoMock.md`

## 当前稳定结论

- 旧模拟内核继续保留在 `src/kernel`，不要轻易尝试整套重写
- 新代码优先依赖 `domain / engine / features / components`，不要回流到旧兼容层
- 已删除的旧兼容层不应恢复
- 默认模拟相关配置已集中到 `src/domain/config`
- 基础设置默认值与规则兜底值已继续向 `src/domain/config/simulatorDefaults.ts` 收口
- `src/App.tsx` 应保持页面编排层角色，不要重新塞回大量业务逻辑
- 基础设置中的属性收益使用百分比输入，但规则层按小数计算；`huiXin / zhuanJing / tiaoXi` 当前分别对应 `小环 / 海龟 / 风筝`
- 允许小数百分比输入的字段不要复用整数解析；当前 `toNumber` 与 `toInt` 已分流，属性收益走浮点，其余基础输入默认走整数
- `attackPower` 当前应在 `deriveCoreOptions` 中完成最终值推导，`getOptions` 不应再修改 `coreOptions`
- 自动模拟相关命名已统一为 `autoMock`，不再继续使用 `optimizer / optimization`
- `CooldownTime` 已作为冷却时间类名统一使用
- `火蝠`、`弓箭` 这类纯数值卡优先作为 `options` 卡落在 `deriveStats.ts`
- `郑大礼` 这类依附特定事件的附伤卡优先挂在对应核心系统接口上，而不是新增独立 tick 行为卡
- `六合镜` 当前落在 `Pulse.add(...)`，其非随机累计应使用概率合并，而不是线性相加

## 高风险边界

### `deriveStats.ts` 的兼容语义不能被误删

`src/domain/rules/deriveStats.ts` 是当前最容易引入数值回归的文件之一。

这里既承担核心属性、攻击力、增伤、基础伤害、冷却等规则推导，也包含兼容旧行为的细节。

尤其要保留下面这条兼容语义：

- `yanHong`
- `zheShan`
- `xingHongJuYi`

这三种基础伤害在“未携带对应主卡”时，当前不是直接按 `0` 处理，而是沿用旧语义，用 `level = -1` 继续参与基础倍率计算。

不要把这条行为直接改成按 `0` 处理，除非已经有明确的迁移方案和验证结果。

### AutoMock 优化不能破坏准确性约束

`AutoMock` 当前采用流式 top N，而不是全量排序后截断。

当前实现已进一步收口为“两阶段”：

- `getTop()` 负责轻量 top 筛选
- `exec()` 负责将 top 结果回放成完整模拟结果

后续如果继续优化，仍要保留这些边界：

- `AutoMock` 保留类设计，不改成纯函数
- 组合数 `length` 必须准确，不能用近似值
- `overflow` 判断必须依赖准确组合数
- 组合数超限时，当前行为仍保持兼容旧逻辑：回退执行一次基础 mock，而不是返回空结果

当前空组合兼容语义也已收口到 `AutoMock` 自己身上：

- `getLength()` 至少保留一个空组合候选
- `getTop()` 至少返回一个空组合候选
- 空组合轻量候选当前直接写为 `{ cardsCombo: [], dps: 0 }`

当前项目里，DFS 计数组合的成本低，主要瓶颈仍然是完整模拟执行。

### 概率型状态效果的非随机近似不能直接线性累计

像 `六合镜` 这类“按批次概率触发、带上限和状态”的效果，在非随机模式下不能直接用 `current + c` 做累计。

当前已验证更合理的做法是按概率合并处理累计值，而不是线性相加。

### 中文乱码问题要区分“显示乱码”和“文件损坏”

历史会话里出现过终端输出链路乱码，但文件本身仍是正常 UTF-8 的情况。

因此如果以后再看到中文异常：

- 不要只根据终端显示判断文件损坏
- 优先以 IDE 中实际显示为准
- 必要时参考历史正确版本

### 会话环境可能拿不到系统 PATH

历史会话中出现过 `node`、`npm`、`git`、`python` 直接不可用，但本机实际已经安装的情况。

因此如果下次再遇到命令找不到：

- 先怀疑当前会话环境没有继承 `PATH`
- 不要先假设用户机器没装工具

## 默认验证清单

改动完成后，按影响范围选择验证方式：

- 类型和导入层改动：至少跑 `tsc --noEmit -p tsconfig.app.json`
- 数值规则改动：至少核对默认卡组关键结果，重点看总 DPS、燃烧伤害、燃烧占比、爆燃相关结果
- 概率型卡牌改动：除总结果外，至少对关键伤害项做随机多轮均值 vs 非随机结果的相对误差核对
- `AutoMock` 改动：至少核对组合数、超限行为、排序或 top N 结果是否仍符合预期
- 模拟主流程改动：至少确认 600 秒默认结果没有明显回归

如果只是文档或纯注释改动，可以不做代码验证，但应明确说明。

## 建议优先关注的工作

当前阶段最值得优先投入的是测试基线，而不是继续大规模重构。

建议优先补：

1. `src/domain/rules/deriveStats.ts` 的规则层单测
2. `src/engine/Simulation.ts` / `src/kernel/core/*` 的关键回归测试
3. 高风险卡牌行为测试

重点建议锁住的结果包括：

- 默认卡组 600 秒结果
- 总 DPS
- 燃烧伤害
- 燃烧占比
- 爆燃相关结果

## 关键代码入口

如果要快速接手当前实现，优先看这些文件：

- `src/domain/rules/deriveStats.ts`
- `src/domain/cards/cardCatalog.ts`
- `src/domain/config/simulatorUi.ts`
- `src/domain/config/simulatorDefaults.ts`
- `src/engine/Simulation.ts`
- `src/engine/autoMock.ts`
- `src/features/simulator/useSimulation.ts`
- `src/features/autoMock/useAutoMock.ts`
- `src/autoMock/AutoMock.ts`
- `src/kernel/utils/CooldownTime.ts`

其中当前自动模拟主流程可按下面顺序理解：

- `src/autoMock/AutoMock.ts`
  - 轻量 top 筛选与完整结果回放
- `src/engine/autoMock.ts`
  - `runAutoMockGetTop(...)`
  - `runAutoMockCoresByTop(...)`
  - `runAutoMock(...)`
- `src/features/autoMock/useAutoMock.ts`
  - 当前自动模拟搜索已搬到 Web Worker

## 需要追溯历史时看哪里

- 想看分层重构主背景：查 `sessions/2.md`
- 想看重构收口、组件整理和关键回归修复：查 `sessions/1.md`
- 想看 `AutoMock` 性能优化过程：查 `sessions/3.md`
- 想看命名统一收口：查 `sessions/4.md`
- 想看新卡接入与 `六合镜` 非随机近似修正：查 `sessions/5.md`
- 想看基础设置属性收益接入、默认值收口和攻击力推导修正：查 `sessions/6.md`
- 想看 `AutoMock` 轻量 top / Web Worker / 空组合兼容语义这轮收口：查 `sessions/7.md`
