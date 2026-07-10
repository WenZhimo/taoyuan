# 桃源乡项目重构计划

## 目标

本文档用于指导后续 Agent 独立完成一次完整、可验证、可分阶段回滚的项目重构。重构目标不是重写游戏，而是在保持现有玩法、存档兼容和构建产物稳定的前提下，降低核心模块复杂度，补齐关键业务测试，并让后续功能迭代不再持续推高维护成本。

## 当前状态评估

### 技术栈

- 前端框架：Vue 3 + TypeScript + Pinia + Vue Router
- 构建工具：Vite
- 桌面端：Electron + electron-builder
- 移动端：Capacitor Android
- 样式：Tailwind CSS
- 包管理：pnpm

### 可用质量门禁

当前 `package.json` 提供以下命令：

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
pnpm run build:electron
pnpm run build:android
pnpm run build:apk
```

重构期间每个阶段至少执行：

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

涉及 Electron 打包、存档路径或桌面行为时，额外执行：

```bash
pnpm run build:electron
```

### 主要质量风险

1. 大型视图文件承担过多职责。
   - `src/views/game/FarmView.vue` 已从约 2256 行拆到约 1024 行，动作编排拆分基本收尾
   - `src/views/game/MiningView.vue` 约 1770 行
   - `src/views/game/ShopView.vue` 约 1741 行
   - `src/views/game/InventoryView.vue` 约 1532 行
   - `src/views/game/HanhaiView.vue` 约 1392 行
   - `src/views/GameLayout.vue` 已开始拆分，但仍保留较多全局流程

2. 大型 Store 和 composable 混合了状态、规则、序列化、迁移和 UI 辅助逻辑。
   - `src/stores/useMiningStore.ts` 约 1843 行
   - `src/stores/useInventoryStore.ts` 约 1178 行
   - `src/composables/useEndDay.ts` 约 1161 行
   - `src/stores/useFarmStore.ts` 约 1045 行
   - `src/stores/useNpcStore.ts` 约 997 行

3. 数据文件体量很大，但大多属于内容数据，优先级低于业务逻辑拆分。
   - `src/data/crops.ts` 约 4956 行
   - `src/data/breeding.ts` 约 4609 行
   - `src/data/recipes.ts` 约 2208 行
   - `src/data/processing.ts` 约 2102 行
   - `src/data/items.ts` 约 1941 行

4. 自动化测试已建立，但仍需要继续补关键业务覆盖。
   - 已引入 Vitest，并新增规则、组件和 composable 测试。
   - 当前测试已覆盖掉落、小憩/睡袋、农田批量、附魔展示、分页与部分拆分后的 UI 状态。
   - 后续重点是补 Store 边界、存档迁移、隔夜结算和大型视图交互的回归测试。

5. 近期新增功能集中在高风险业务域。
   - 背包堆叠上限和存档迁移
   - 掉落率超过 100% 后的倍率掉落
   - 睡袋、小憩、资源副本内过夜
   - 农田/温室大批量操作
   - 鱼塘、酒窖、育种台、牲口棚分页
   - 装备附魔合并展示和详情弹窗
   - Electron 便携版/未压缩版数据路径

## 重构原则

### 必须保持不变

- 不改变玩家已有存档结构，除非同时提供兼容迁移。
- 不改变已有玩法数值，除非该阶段明确包含数值修正。
- 不改变当前构建目标：Web、Electron 未压缩版、Android。
- 不删除用户已有功能。
- 不把生成目录 `docs/` 当作文档源目录；源文档优先放入 `docs-source/`。

### 推荐做法

- 每个阶段只解决一个边界清晰的问题。
- 每次重构先补测试或建立可验证样例，再移动代码。
- 先提取纯函数，再拆 Store，再拆 Vue 视图。
- 先兼容旧接口，再逐步迁移调用方。
- 每个阶段结束必须保证工作树可构建。
- 对存档迁移、批量操作、随机掉落等业务规则保留变更说明。

### 禁止做法

- 禁止一次性重写整个 Store 或整个视图。
- 禁止为了拆文件改变玩家可见行为。
- 禁止在重构阶段混入新玩法。
- 禁止删除不理解的旧迁移逻辑。
- 禁止直接修改构建产物来替代源码修改。
- 禁止把所有工具函数塞入一个新的“大杂烩 utils”。

## 目标架构

### 目录结构建议

```text
src/
  components/
    game/
      common/
      farm/
      inventory/
      mining/
      processing/
  composables/
    game/
      usePagination.ts
      useQuantityModal.ts
    farm/
      useFarmSelection.ts
      useFarmBatchUi.ts
      useShippingBoxUi.ts
      useGreenhouseUi.ts
    inventory/
      useEquipmentDisplay.ts
    mining/
      useMiningViewState.ts
  domain/
    drops/
      rollChanceQuantity.ts
      rollDropTable.ts
    enchantments/
      summarizeEnchantments.ts
      equipmentEffects.ts
    farm/
      batchLimits.ts
      plotRules.ts
      greenhouseRules.ts
    sleep/
      sleepOptions.ts
      napRules.ts
    save/
      migrations.ts
      validators.ts
  stores/
    useFarmStore.ts
    useInventoryStore.ts
    useMiningStore.ts
  tests/
    domain/
    stores/
    fixtures/
```

说明：

- `domain/` 只放纯规则函数，不依赖 Vue、Pinia、DOM 或路由。
- `composables/` 可以依赖 Vue 响应式能力，但不直接保存全局游戏状态。
- `stores/` 继续作为状态入口，但把可测试的业务规则下沉到 `domain/`。
- `components/game/*` 承担界面展示和交互，不承载复杂业务规则。
- 已完成的拆分应优先复用，不要重新引入大型全能组件或把 UI 派生数据放回视图文件。

## 阶段 0：建立重构安全网

### 目标

在大规模移动代码前，先建立最小但有效的自动化测试基础。

### 任务

1. 引入 Vitest。
   - 添加 `vitest`、`@vue/test-utils`、`jsdom`。
   - 新增 `vitest.config.ts`。
   - 在 `package.json` 添加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

2. 新建测试目录。

```text
src/tests/
  domain/
  stores/
  fixtures/
```

3. 为以下规则补第一批测试：
   - 背包同物品同品质叠加时不会产生 999 上限回归。
   - 掉落率 150%、200%、250% 分别能产生基础数量加额外概率数量。
   - 小憩不能跳到 2 点以后。
   - 没有睡袋时资源副本仍然会正常晕倒或回家。
   - 有睡袋时矿洞、竹林、瀚海资源副本允许原地睡觉。
   - 温室批量种植超过单次上限时不会一次性处理全部 10W 项。

### 验收

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

### 回滚点

测试基础设施可以单独提交，不应包含任何业务逻辑迁移。

### 当前状态

- 已完成 Vitest 基础设施和 `pnpm run test` 脚本。
- 当前测试套件已能作为后续重构的基础安全网。

## 阶段 1：修复现有 lint 警告和类型薄弱点

### 目标

让重构前的基础质量门禁更干净，减少后续 Agent 对警告的误判。

### 任务

1. 修复 `src/App.vue` 中未显式处理 Promise 的 lint 警告。
   - 对无需等待的 Promise 使用 `void`。
   - 对需要错误处理的 Promise 添加 `.catch()` 或 `try/catch`。

2. 收敛明显的 `any`。
   - 不要求一次性消灭所有 `any`。
   - 优先处理存档反序列化入口和新增功能相关模块。
   - 为旧存档输入定义 `UnknownSaveData`、`SerializedFarmState`、`SerializedInventoryState` 等类型。

3. 保留合理的兼容类型。
   - 反序列化旧存档时可以接受 `unknown`。
   - 类型收窄应在边界完成，不要让 `any` 深入业务逻辑。

### 验收

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

### 回滚点

该阶段只做安全修复和类型收敛，不移动大文件。

## 阶段 2：提取纯业务规则

### 目标

把最容易测试、最容易复用、最容易出回归的规则从 Store 和 Vue 文件中提取出来。

### 2.1 掉落倍率规则

目标文件：

```text
src/domain/drops/rollChanceQuantity.ts
src/domain/drops/rollDropTable.ts
```

迁移来源：

```text
src/stores/useMiningStore.ts
```

要求：

- `chance = 0` 时掉落 0。
- `chance = 0.5` 时 50% 概率掉落 1 份。
- `chance = 1` 时稳定掉落 1 份。
- `chance = 1.5` 时稳定掉落 1 份，另有 50% 概率掉落第 2 份。
- `chance = 2` 时稳定掉落 2 份。
- `chance = 2.5` 时稳定掉落 2 份，另有 50% 概率掉落第 3 份。
- 支持传入随机函数以便测试。

测试文件：

```text
src/tests/domain/drops.test.ts
```

### 2.2 附魔展示规则

目标文件：

```text
src/domain/enchantments/summarizeEnchantments.ts
src/domain/enchantments/equipmentEffects.ts
```

迁移来源：

```text
src/data/weapons.ts
src/views/game/InventoryView.vue
src/views/game/MiningView.vue
src/views/game/CharInfoView.vue
```

要求：

- 同种附魔按数量合并展示。
- 简略展示只显示前 N 种。
- 完整详情保留每种附魔的完整效果说明。
- 所有装备界面和矿洞界面使用同一个格式化入口。

测试文件：

```text
src/tests/domain/enchantments.test.ts
```

### 2.3 睡眠和小憩规则

目标文件：

```text
src/domain/sleep/napRules.ts
src/domain/sleep/sleepOptions.ts
```

迁移来源：

```text
src/views/GameLayout.vue
src/composables/useEndDay.ts
```

要求：

- 小憩可以在任意地点触发。
- 小憩不能跳到 2 点以后。
- 小憩被中断时根据实际经过时间恢复体力。
- 资源副本睡袋过夜逻辑和普通回家睡觉逻辑清晰分离。
- 判断玩家是否拥有睡袋时只依赖背包状态，不依赖 UI。

测试文件：

```text
src/tests/domain/sleep.test.ts
```

### 2.4 农田批量限制规则

目标文件：

```text
src/domain/farm/batchLimits.ts
src/domain/farm/plotRules.ts
src/domain/farm/greenhouseRules.ts
```

迁移来源：

```text
src/views/game/FarmView.vue
src/composables/useFarmActions.ts
src/stores/useFarmStore.ts
```

要求：

- 单次批量操作上限集中定义。
- 普通农田和温室共用相同的批量限制策略。
- 是否关闭一键操作菜单由“是否还有可操作项”统一判断。
- 大规模地块统计不得依赖重复多次全量扫描。

测试文件：

```text
src/tests/domain/farmBatch.test.ts
```

### 验收

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

### 回滚点

每个规则域单独提交。不要把掉落、睡眠、农田、附魔混在一个提交里。

### 当前状态

- 掉落倍率、睡眠/小憩、农田批量限制和附魔展示规则已拆出核心测试覆盖。
- 后续若继续迁移 Store 内部逻辑，应优先保持现有 domain API 稳定，并新增针对调用方的回归测试。

## 阶段 3：拆分 FarmView

### 目标

把 `FarmView.vue` 从大型全能视图拆成可维护的页面容器和子组件。页面容器只负责组合状态、路由跳转和弹窗开关。

### 建议组件

```text
src/components/game/farm/FarmFieldHeader.vue
src/components/game/farm/FarmPlotGrid.vue
src/components/game/farm/FarmPlotDetailDialog.vue
src/components/game/farm/FarmBatchActionsDialog.vue
src/components/game/farm/FarmBatchPlantDialog.vue
src/components/game/farm/FarmBatchFertilizeDialog.vue
src/components/game/farm/ShippingBoxDialog.vue
src/components/game/farm/ShippingBoxEntry.vue
src/components/game/farm/GreenhouseEntry.vue
src/components/game/farm/GreenhouseOverviewDialog.vue
src/components/game/farm/GreenhousePlotDialog.vue
src/components/game/farm/GreenhouseBatchPlantDialog.vue
src/components/game/farm/GreenhouseUpgradeDialog.vue
src/components/game/farm/FruitTreeSection.vue
src/components/game/farm/FruitTreeChopConfirmDialog.vue
src/components/game/farm/WildTreeSection.vue
src/components/game/farm/WildTreeChopConfirmDialog.vue
src/components/game/farm/LargeBatchConfirmDialog.vue
```

### 建议 composable

```text
src/composables/farm/useFarmSelection.ts
src/composables/farm/useFarmBatchUi.ts
src/composables/farm/useShippingBoxUi.ts
src/composables/farm/useGreenhouseUi.ts
```

### 拆分顺序

1. 已拆出的展示组件和弹窗组件保持现状，不要回填到 `FarmView.vue`。

2. 继续从 `FarmView.vue` 中迁出剩余动作编排。
   - 优先抽 `useFarmPlotActions.ts`：单地块浇水、除草、除虫、收获、清理。
   - 再抽 `useGreenhouseActions.ts`：温室种植、批量种植、收获、升级。
   - 最后抽 `useTreeActions.ts`：果树和野树的种植、砍伐、收获。

3. 每个动作 composable 必须以现有 domain 规则或 store action 为边界，不在 composable 中复制复杂规则。

### 保持不变

- 玩家点击路径不变。
- 文案不变。
- 批量操作上限不变。
- 温室升级效果不变。
- 出货箱结算逻辑不变。

### 验收

- 农田页面可打开。
- 普通种植、浇水、施肥、收获可用。
- 一键浇水、一键除虫、一键除草、一键收获可用。
- 一键操作只在没有可操作项时关闭。
- 温室批量种植大数量不会卡死。
- 出货箱可以放入、取回、结算。
- 果树和野树操作可用。

自动化命令：

```bash
pnpm run type-check
pnpm run lint
pnpm run test
pnpm run build
```

### 当前状态

- `FarmView.vue` 已降至约 1024 行。
- 已拆出 `useFarmSelection`、`useFarmBatchUi`、`useShippingBoxUi`、`useGreenhouseUi`、`useFarmPlotActions`、`useGreenhouseActions`、`useTreeActions`。
- 已为普通地块动作、温室动作、果树/野树动作补充 composable 回归测试。
- 最近一次完整验证通过：`pnpm run type-check`、`pnpm run lint`、`pnpm run test`、`pnpm run build`、`git diff --check`。
- 构建耗时约 110 秒，仍存在既有 Browserslist 数据过期和大 chunk 警告。
- 下一步推荐收尾 `GameLayout.vue` 的全局弹窗和睡眠/小憩流程拆分，并为 Store 边界、存档迁移和隔夜结算补测试。

## 阶段 4：拆分 GameLayout

### 目标

把 `GameLayout.vue` 中全局 UI、睡觉/小憩、设置、日志、虚空箱等逻辑拆开，降低主布局复杂度。

### 建议组件

```text
src/components/game/layout/SleepDialog.vue
src/components/game/layout/NapDialog.vue
src/components/game/layout/ResolvingDayOverlay.vue
src/components/game/layout/GameLogDialog.vue
src/components/game/layout/VoidChestDialog.vue
src/components/game/layout/VoidChestQuantityDialog.vue
```

### 建议 composable

```text
src/composables/layout/useSleepFlow.ts
src/composables/layout/useRestActions.ts
src/composables/layout/useGameLogs.ts
src/composables/layout/useVoidChestUi.ts
```

### 拆分顺序

1. 提取 `ResolvingDayOverlay`，保持行为完全不变。
2. 提取 `NapDialog`，复用阶段 2 的 `napRules`。
3. 提取 `SleepDialog`，复用阶段 2 的 `sleepOptions`。
4. 提取日志弹窗。
5. 提取虚空箱相关弹窗和数量输入。
6. 提取睡眠/小憩确认执行流程到 `useRestActions.ts`，让 `GameLayout.vue` 只负责弹窗绑定。

### 验收

- StatusBar 的“小憩”按钮仍可打开弹窗。
- 小憩不能超过凌晨 2 点。
- 睡袋在矿洞、竹林、瀚海资源副本可用。
- 没有睡袋时提示正确。
- 隔夜结算遮罩仍会出现。
- 设置、日志、虚空箱功能可正常打开和关闭。

### 当前状态

- `GameLayout.vue` 已降至约 599 行。
- 已拆出 `ResolvingDayOverlay`、`SleepDialog`、`NapDialog`、`GameLogDialog`、`VoidChestDialog`、`VoidChestDepositDialog`、`VoidChestQuantityDialog`。
- 已拆出 `useSleepFlow`、`useRestActions`、`useGameLogs`、`useVoidChestUi`。
- 已为睡眠/小憩预览、睡眠/小憩确认执行、睡袋资源副本过夜、日志和虚空箱相关流程补充测试覆盖。
- 已新增 `src/tests/components/StatusBar.test.ts`、`src/tests/views/GameLayout.test.ts` 和 `src/tests/bootstrap.test.ts`，覆盖状态栏、小憩入口、矿洞 HP、重复挂载性能、已开始游戏时的布局挂载，以及等待 Vue Router 初始导航后再挂载应用。
- 已修复两项浏览器启动回归：
  - `src/bootstrap.ts` 等待 `router.isReady()` 后再执行 `app.mount()`，避免主菜单初始路由为空。
  - `GameLayout.vue` 的弹窗暂停 watcher 已移动到 `useSleepFlow()` 返回 `showSleepConfirm`、`showNapConfirm` 之后，避免 setup 暂时性死区错误。
- 浏览器烟测已通过“主菜单 → 隐私协议 → 角色创建 → 田庄选择 → 农田”，并验证状态栏、“小憩”弹窗和设置弹窗可正常打开关闭，控制台无错误。
- 最近一次完整验证通过：`pnpm run type-check`、`pnpm run lint`、`pnpm run validate:data`、`pnpm run validate:docs`、全量 Vitest（108 个文件、589 项测试）、`pnpm run build`、`pnpm run build:electron` 和 `git diff --check`。
- Web 构建耗时约 109 秒，Electron 未压缩目录构建耗时约 307 秒；仍存在既有 Browserslist 数据过期、`useGameStore` 大 chunk、asar 禁用和 Node 子进程弃用提示。
- 阶段 4 已完成；后续只在新增布局行为或测试暴露回归时按单一主题继续维护。

## 阶段 5：拆分 Mining Store 和 Mining View

### 目标

将矿洞状态、地图生成、格子揭示、战斗、掉落、连战、睡袋清理逻辑拆为明确模块。

### 建议 Store 边界

保留：

```text
src/stores/useMiningStore.ts
```

新增纯规则：

```text
src/domain/mining/floorGeneration.ts
src/domain/mining/tileReveal.ts
src/domain/mining/combat.ts
src/domain/mining/statusEffects.ts
src/domain/mining/sweep.ts
```

新增类型：

```text
src/types/miningState.ts
```

### 拆分顺序

1. 提取掉落规则，优先复用阶段 2 的 `domain/drops`。（已完成）
2. 提取状态效果计算。（已完成）
3. 提取普通攻击、暴击、防御、闪避、吸血、再生等战斗计算。（进行中，已完成攻击/受击/暴击/吸血/眩晕、战斗道具效果、防御回合和反击阻断规则）
4. 提取楼层生成和安全层逻辑。（进行中，已完成重复挑战 BOSS 弱化替换后处理规则）
5. 提取扫荡预览和执行逻辑。（进行中，已完成扫荡目标安全层、预览伤害和落点状态规则）
6. 提取格子揭示规则。（进行中，已完成相邻可翻开判断、探索体力消耗、宝箱格子文案和连战自动探索汇总文案规则）
7. 最后拆 `MiningView.vue` 的展示组件。（进行中，已拆出装备与状态面板、骷髅矿穴状态面板、已击败 BOSS 面板、地图弹窗、电梯弹窗、离开确认弹窗、装备方案列表弹窗、装备方案详情弹窗、战斗道具列表弹窗、道具使用确认弹窗、装备属性详情弹窗、探索顶部状态面板、探索日志面板、探索操作面板、矿洞网格面板、战斗双方状态面板、战斗日志面板、战斗操作面板和战斗弹窗组合组件）

### 建议组件

```text
src/components/game/mining/MineHeader.vue
src/components/game/mining/MineGrid.vue
src/components/game/mining/MineCombatPanel.vue
src/components/game/mining/MineSweepDialog.vue
src/components/game/mining/MineEquipmentSummary.vue
src/components/game/mining/EnchantmentDetailDialog.vue
```

### 验收

- 进入普通矿洞和骷髅矿洞正常。
- 揭示空地、矿石、怪物、楼梯、陷阱、宝箱逻辑正常。
- 炸弹可用。
- 战斗胜利和失败正常。
- 掉落率超过 100% 时按倍率发放物品。
- 附魔简略展示不溢出，详情弹窗可查看完整说明。
- 睡袋睡觉会清理战斗状态但不破坏矿洞数据。

### 当前状态

- 已新增 `src/domain/mining/drops.ts`，提取怪物普通物品掉落倍率和掉落率加成规则。
- 已新增 `src/domain/mining/statusEffects.ts`，提取战斗状态创建、合并、查询和回合结算规则。
- 已新增 `src/domain/mining/combat.ts`，提取玩家攻击力、暴击率、受击伤害、单次攻击结算、战斗道具伤害/状态、防御回合和反击阻断规则。
- 已新增 `src/domain/mining/sweep.ts`，提取下一安全层计算、扫荡预览伤害/文案和扫荡落点状态规则。
- 已新增 `src/domain/mining/tileReveal.ts`，提取格子相邻可翻开判断、探索体力消耗、宝箱格子文案和连战自动探索汇总文案规则。
- 已新增 `src/domain/mining/floorGeneration.ts`，提取重复挑战 BOSS 层时的弱化 BOSS 判断和格子后处理替换规则。
- 已新增 `src/tests/domain/miningDrops.test.ts`、`src/tests/domain/miningStatusEffects.test.ts`、`src/tests/domain/miningCombat.test.ts`、`src/tests/domain/miningSweep.test.ts`、`src/tests/domain/miningTileReveal.test.ts`、`src/tests/domain/miningFloorGeneration.test.ts` 和 `src/tests/stores/mining.test.ts`，覆盖掉落、状态、战斗数值、战斗道具效果、防御与反击阻断、扫荡预览与落点状态、格子揭示、宝箱文案、连战自动探索汇总、BOSS 弱化替换、睡袋清理、离开矿洞和存档迁移边界。
- `useMiningStore.ts` 仍是矿洞状态入口，但战斗、掉落、扫荡预览/落点、格子揭示和楼层生成后处理核心公式已开始下沉到可单测的 `domain/mining` 模块。
- 最近一次 targeted 验证通过：`pnpm exec vitest run src/tests/domain/miningTileReveal.test.ts src/tests/domain/miningSweep.test.ts src/tests/domain/miningCombat.test.ts src/tests/domain/miningFloorGeneration.test.ts src/tests/domain/miningStatusEffects.test.ts src/tests/domain/miningDrops.test.ts src/tests/stores/mining.test.ts`，共 38 个测试；`pnpm run type-check` 通过。
- 已新增 `src/components/game/mining/MiningEquipmentStatusPanel.vue`，从 `MiningView.vue` 拆出顶部装备、HP、体力和附魔摘要展示面板。
- 已新增 `src/tests/components/MiningEquipmentStatusPanel.test.ts`，覆盖装备状态渲染、无附魔隐藏、详情事件和重复挂载性能。
- 已新增 `src/components/game/mining/SkullCavernStatusPanel.vue`，从 `MiningView.vue` 拆出骷髅矿穴解锁后的最深层、安全点和说明展示面板。
- 已新增 `src/tests/components/SkullCavernStatusPanel.test.ts`，覆盖未探索状态、最深层/安全点展示和重复挂载性能。
- 已新增 `src/components/game/mining/DefeatedBossListPanel.vue`，从 `MiningView.vue` 拆出已击败 BOSS 列表展示。
- 已新增 `src/tests/components/DefeatedBossListPanel.test.ts`，覆盖空列表隐藏、BOSS/区域展示和重复挂载性能。
- 已新增 `src/components/game/mining/MineMapDialog.vue`，从 `MiningView.vue` 拆出矿洞地图弹窗和安全点/区域说明展示。
- 已新增 `src/tests/components/MineMapDialog.test.ts`，覆盖关闭事件、安全点标记、已解锁/未解锁区域展示和重复挂载性能。
- 已新增 `src/components/game/mining/MineElevatorDialog.vue`，从 `MiningView.vue` 拆出普通矿洞入口、电梯楼层、自动探索开关和骷髅矿穴入口弹窗。
- 已新增 `src/tests/components/MineElevatorDialog.test.ts`，覆盖入口展示、自动探索开关、普通矿洞/骷髅矿穴入口事件、锁定隐藏和重复挂载性能。
- 已新增 `src/components/game/mining/MineLeaveConfirmDialog.vue`，从 `MiningView.vue` 拆出普通矿洞/骷髅矿穴离开确认弹窗。
- 已新增 `src/tests/components/MineLeaveConfirmDialog.test.ts`，覆盖普通矿洞与骷髅矿穴文案、取消/确认事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineEquipmentPresetListDialog.vue`，从 `MiningView.vue` 拆出装备方案列表弹窗，详情弹窗和装备属性解析暂留主视图。
- 已新增 `src/tests/components/MineEquipmentPresetListDialog.test.ts`，覆盖方案列表、当前方案标记、空状态、关闭/使用/查看事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineEquipmentPresetDetailDialog.vue`，从 `MiningView.vue` 拆出装备方案详情弹窗，装备属性解析仍留在主视图中处理。
- 已新增 `src/tests/components/MineEquipmentPresetDetailDialog.test.ts`，覆盖装备槽位展示、空槽位、关闭事件、装备详情事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatItemListDialog.vue`，从 `MiningView.vue` 拆出战斗/探索共用的可用道具列表弹窗，道具使用确认和数量选择暂留主视图。
- 已新增 `src/tests/components/MineCombatItemListDialog.test.ts`，覆盖可用道具展示、空状态、关闭/选择事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatItemConfirmDialog.vue`，从 `MiningView.vue` 拆出道具使用确认、批量数量选择和确认按钮展示，数量夹取与实际使用逻辑仍留在主视图。
- 已新增 `src/tests/components/MineCombatItemConfirmDialog.test.ts`，覆盖道具摘要、批量/非批量展示、取消/数量/确认事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineEquipmentPropertyDialog.vue`，从 `MiningView.vue` 拆出装备/附魔属性详情弹窗，属性内容生成仍留在主视图中处理。
- 已新增 `src/tests/components/MineEquipmentPropertyDialog.test.ts`，覆盖属性摘要、效果列表、空效果、关闭事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineExplorationHeaderPanel.vue`，从 `MiningView.vue` 拆出探索弹窗顶部楼层、特殊层、装备摘要、感染层提示、自动探索和炸弹模式提示。
- 已新增 `src/tests/components/MineExplorationHeaderPanel.test.ts`，覆盖楼层/区域/装备摘要、特殊层提示、自动探索、炸弹模式、离开/附魔详情/取消炸弹事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineExplorationLogPanel.vue`，从 `MiningView.vue` 拆出探索日志列表和最新日志高亮。
- 已新增 `src/tests/components/MineExplorationLogPanel.test.ts`，覆盖日志渲染、最新日志高亮、空日志和重复挂载性能。
- 已新增 `src/components/game/mining/MineExplorationActionsPanel.vue`，从 `MiningView.vue` 拆出扫荡、连战、自动探索、炸弹、怪物诱饵、战斗道具、楼梯和离开入口等探索操作区。
- 已新增 `src/tests/components/MineExplorationActionsPanel.test.ts`，覆盖全部操作展示、禁用状态、可选操作隐藏、事件转发和重复挂载性能。
- 已新增 `src/components/game/mining/MineGridPanel.vue`，从 `MiningView.vue` 拆出 6x6 矿洞网格展示和格子选择事件转发。
- 已新增 `src/tests/components/MineGridPanel.test.ts`，覆盖图标/样式/禁用状态、可点击格子事件和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatStatusPanel.vue`，从 `MiningView.vue` 拆出战斗弹窗中的玩家/怪物血量、状态、动画类和浮动伤害展示。
- 已新增 `src/tests/components/MineCombatStatusPanel.test.ts`，覆盖血量摘要、BOSS 标记、状态 tooltip、动画类、浮动文本、血条夹取和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatLogPanel.vue`，从 `MiningView.vue` 拆出战斗日志列表和最新日志高亮展示。
- 已新增 `src/tests/components/MineCombatLogPanel.test.ts`，覆盖日志渲染、最新日志高亮、空列表和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatActionsPanel.vue`，从 `MiningView.vue` 拆出攻击/防御/逃跑、自动战斗模式、战斗道具入口和装备方案入口。
- 已新增 `src/tests/components/MineCombatActionsPanel.test.ts`，覆盖操作展示、事件转发、锁定/禁用状态、可选入口隐藏和重复挂载性能。
- 已新增 `src/components/game/mining/MineCombatDialog.vue`，从 `MiningView.vue` 拆出战斗弹窗外壳、标题和战斗状态/操作/日志面板组装。
- 已新增 `src/tests/components/MineCombatDialog.test.ts`，覆盖普通战斗、BOSS 战、隐藏状态、事件转发和重复挂载性能。
- 已在 `src/domain/mining/tileReveal.ts` 新增 `MineTileRevealResult`，统一 `revealTile`/`engageRevealedMonster` 和各格子处理函数的返回结构。
- 已新增 `revealEmptyMineTile` 和 `revealFallbackMineTile`，先把空格子与未知格子的纯状态/文案规则从 `useMiningStore.ts` 下沉到 domain。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖空格子和 fallback 格子揭示状态与既有文案。
- 已新增 `calculateOreTileQuantity` 和 `revealOreMineTile`，将矿石格子的数量加成顺序、收集状态和既有文案规则从 `useMiningStore.ts` 下沉到 domain，Store 继续负责发放物品、经验、成就和任务副作用。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖矿工/山丘农场/探矿者/戒指/灵狐眼加成顺序，以及矿石格子收集状态与既有文案。
- 已新增 `revealTrapMineTile` 和 `revealMushroomMineTile`，将陷阱格子触发状态、生还/晕倒文案，以及蘑菇格子收集状态和既有文案规则从 `useMiningStore.ts` 下沉到 domain。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖陷阱生还/晕倒文案、触发状态、蘑菇收集状态和采集文案。
- 已新增 `revealStairsMineTile`，将楼梯格子的揭示状态、可通行文案、感染层剩余怪物阻塞文案和 BOSS 层阻塞文案从 `useMiningStore.ts` 下沉到 domain，Store 继续负责 `stairsFound` 和当前楼层状态判断。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖楼梯可通行、感染层阻塞和 BOSS 层阻塞三种既有文案与揭示状态。
- 已新增 `getMonsterTileCombatStartText`、`getBossTileCombatStartText` 和 `getRevealedMonsterCombatStartText`，将怪物/BOSS 格子初次遭遇、重复交战的 combat log 与返回文案规则从 `useMiningStore.ts` 下沉到 domain，Store 继续负责写入战斗状态。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖普通怪物、BOSS 弱化版、已揭示怪物重复交战和已揭示 BOSS 重复挑战的既有文案。
- 已新增 `calculateSkullCavernBossReward`，将骷髅矿穴 BOSS 铜钱奖励和稀有矿石数量的深度缩放公式从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责实际发放奖励和记录战利品。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖骷髅矿穴 BOSS 奖励在浅层、25 层和 120 层的既有缩放结果。
- 已新增 `calculateCombatDefeatPenalty` 和 `formatCombatDefeatMessage`，将战斗失败时战利品损失数量、背包物品掉落数量、铜钱惩罚封顶和失败文案从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责实际移除物品、扣钱、回血和清理状态。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖战斗失败惩罚封顶、半数战利品损失、背包掉落数量上限，以及普通矿洞/骷髅矿穴失败文案。
- 已新增 `formatMainMineBossFirstKillWeaponMessage`、`formatMainMineBossGearRewardMessage`、`formatMainMineBossMoneyRewardMessage` 和 `formatMainMineBossOreRewardMessage`，将主矿洞 BOSS 首杀武器、戒指/帽子/鞋子、铜钱和矿石奖励文案从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责去重判断和实际发放。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖主矿洞 BOSS 传说武器、装备、铜钱和矿石奖励文案。
- 已新增 `resolveMainMineBossFirstKillReward` 和 `resolveMainMineBossGearRewards`，将主矿洞 BOSS 首杀记录/首杀武器判定、戒指/帽子/鞋子补发判定从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责修改 defeatedBosses、发放装备和拼接展示文案。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖主矿洞 BOSS 首杀奖励判定、无首杀武器时仍记录首杀、重复击败不再触发首杀奖励，以及装备补发顺序和已拥有装备跳过逻辑。
- 已新增 `formatInfestedFloorClearMessage` 和 `formatInfestedFloorRemainingMonstersMessage`，将感染层清除奖励文案和剩余怪物文案从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责实际发放感染层清除奖励和更新楼梯状态。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖感染层清除奖励文案和剩余怪物文案。
- 已新增 `formatCombatEntryStartLine`、`formatChainCombatStartMessage` 和 `formatChainCombatNextMessage`，将连战/BOSS 战开战日志、连战开始文案和下一战提示文案从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责连战队列推进、战斗状态写入和连战结束后的整层自动探索副作用。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖连战开战、BOSS 战开战、连战开始和下一战提示文案。
- 已新增 `calculateTreasureGearDropAttempts`，将宝箱装备掉落在单格揭示和连战后整层自动探索中重复使用的“基础概率 + treasure_find 加成后再按倍率掷数量”公式从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责实际发放装备、重复装备自动出售和随机附魔。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖宝箱装备掉落概率加成传入 `rollChanceQuantity` 前的既有计算顺序。
- 已新增 `resolveTreasureGearDropDecision`，将宝箱装备掉落“未拥有则发放、已拥有则按售价自动售出”的判定从 `useMiningStore.ts` 下沉到 `domain/mining/combat.ts`，Store 继续负责实际发放装备、发钱、累计自动售出金额和随机武器附魔。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖宝箱装备发放与自动售出两种决策。
- 已扩展 `src/domain/enchantments/equipmentEffects.ts`，将装备效果名称、百分比/数值格式化和效果行生成规则从 `MiningView.vue` 下沉到 domain，`MiningView.vue` 继续负责查询具体装备定义和打开详情弹窗。
- 已扩展 `src/tests/domain/enchantments.test.ts`，覆盖攻击力、暴击率、掉落率和回合自愈等装备效果展示格式。
- 已扩展 `src/domain/enchantments/summarizeEnchantments.ts`，新增 `formatEnchantmentDetailRows` 和 `createWeaponEnchantmentDetailInfo`，将武器附魔详情弹窗的数据生成规则从 `MiningView.vue` 下沉到 domain，`MiningView.vue` 继续负责读取当前装备和打开弹窗。
- 已扩展 `src/tests/domain/enchantments.test.ts`，覆盖武器附魔详情行合并、空附魔不生成详情，以及武器附魔详情弹窗信息的既有分类/说明文案。
- 已扩展 `src/domain/enchantments/equipmentEffects.ts`，新增 `createWeaponDetailInfo`、`createRingDetailInfo`、`createHatDetailInfo` 和 `createShoeDetailInfo`，将武器/戒指/帽子/鞋子的详情弹窗数据生成规则从 `MiningView.vue` 下沉到 domain，`MiningView.vue` 继续负责根据类型查找装备定义并打开弹窗。
- 已扩展 `src/tests/domain/enchantments.test.ts`，覆盖武器详情的攻击力/类型/暴击率展示，以及戒指/帽子/鞋子详情分类和效果行格式。
- 已新增 `src/domain/mining/tileDisplay.ts`，将矿洞格子样式、图标和可点击判断从 `MiningView.vue` 下沉为纯展示规则，`MiningView.vue` 继续负责注入炸弹模式和相邻可翻开状态。
- 已新增 `src/tests/domain/miningTileDisplay.test.ts`，覆盖隐藏格、可探索格、已收集/已击败格、怪物/BOSS/宝箱/蘑菇图标，以及炸弹模式和已揭示怪物点击规则。
- 已新增 `src/domain/mining/navigationDisplay.ts`，将矿洞地图区域定义、安全点进度、当前区域、BOSS 名称/击败状态和进度条颜色从 `MiningView.vue` 下沉为纯展示规则，`MiningView.vue` 继续负责注入当前安全点和 BOSS 数据。
- 已新增 `src/tests/domain/miningNavigationDisplay.test.ts`，覆盖已探索区域、当前区域、已击败 BOSS、未解锁区域和缺失 BOSS 数据时的地图展示状态。
- 已扩展 `src/domain/mining/navigationDisplay.ts`，将普通矿洞电梯楼层分组、骷髅矿穴电梯楼层过滤和离开矿洞提示文案从 `MiningView.vue` 下沉为纯展示规则，`MiningView.vue` 继续负责注入已解锁安全点、当前安全点和当前楼层状态。
- 已扩展 `src/tests/domain/miningNavigationDisplay.test.ts`，覆盖普通矿洞电梯分区、骷髅矿穴安全点过滤，以及普通矿洞/骷髅矿穴安全点/非安全点离开提示。
- 已扩展 `src/domain/mining/combat.ts`，新增 `chooseAutoCombatAction`，将自动战斗攻击/防御选择从 `MiningView.vue` 下沉为纯规则，`MiningView.vue` 继续负责注入当前模式、怪物攻击、玩家 HP 和武器攻击等状态。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖强制攻击、强制防御和智能模式危险阈值的既有行为。
- 已新增 `src/domain/mining/autoExplore.ts`，将自动探索下一步动作选择从 `MiningView.vue` 下沉为纯规则，`MiningView.vue` 继续负责日志、音效、计时器、战斗启动和下楼等副作用。
- 已新增 `src/tests/domain/miningAutoExplore.test.ts`，覆盖自动探索未启用、停止、过晚、战斗中、连战、下楼和无可操作项停止的既有优先级。
- 已扩展 `src/domain/mining/tileReveal.ts`，新增连战结束整层自动探索的格子跳过、最终状态映射和楼梯解锁判断规则，`useMiningStore.ts` 继续负责实际物品发放、金钱、经验、成就和装备掉落副作用。
- 已扩展 `src/tests/domain/miningTileReveal.test.ts`，覆盖整层自动探索中已结算格子的跳过、各格子类型最终状态和全清后楼梯解锁判断。
- 已扩展 `src/domain/mining/combat.ts`，新增 `resolveTreasureGearDropDecisions`，将宝箱装备多次掉落尝试解析为发放/自动售出决策列表，`useMiningStore.ts` 继续负责库存、铜钱和随机附魔副作用。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖宝箱装备多次掉落尝试的顺序、发放/自动售出混合结果和零次尝试。
- 已扩展 `src/domain/mining/combat.ts`，新增 `resolveTreasureGearDropRoll`，将“宝箱装备掉落概率转尝试次数，再转发放/自动售出决策列表”的两步纯规则合并，`useMiningStore.ts` 继续负责随机附魔预生成和实际副作用。
- 已扩展 `src/tests/domain/miningCombat.test.ts`，覆盖宝箱装备掉落概率加成、尝试次数和决策列表的一体化解析。
- 已在 `useMiningStore.ts` 中新增共享 `applyTreasureGearDecision` helper，收敛单格宝箱和连战后整层自动探索中戒指/帽子/鞋子/武器装备发放与重复装备自动售出的重复分支，同时保持库存、铜钱、奖励展示和连战统计口径不变。
- 已在 `useMiningStore.ts` 中新增 `applyTreasureGearDropRolls` helper，收敛戒指/帽子/鞋子三类非武器宝箱装备掉落循环；武器掉落仍保留独立路径，以保持随机附魔预生成顺序不变。
- 已在 `useMiningStore.ts` 中新增 `applyWeaponTreasureGearDropRolls` helper，收敛单格宝箱和连战后整层自动探索的武器掉落循环，同时保留“先计算尝试次数、再预生成随机附魔、最后应用发放/自动售出”的既有顺序。
- 已在 `useMiningStore.ts` 中新增 `applyTreasureGearDropsForZone` helper，将单格宝箱和连战后整层自动探索共用的戒指/帽子/鞋子/武器宝箱装备掉落副作用收敛到同一入口，同时保持戒指、帽子、鞋子、武器的应用顺序不变。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖单格宝箱揭示时基础奖励、浅层宝箱戒指/帽子/鞋子掉落、重复戒指自动售出、装备入库、铜钱与体力副作用，作为宝箱装备掉落 helper 的 Store 级回归测试。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖连战结束后整层自动探索中的宝箱装备掉落、重复装备自动售出、奖励汇总文案和宝箱状态结算，确保 `applyTreasureGearDropsForZone` 的第二条调用路径有 Store 级回归保护。
- 已在 `useMiningStore.ts` 中新增 `applyMonsterGearDropsForZone` 及分类 helper，收敛普通怪物武器/戒指/帽子/鞋子掉落、重复装备自动售出和奖励文案拼接逻辑，同时保持原有武器→戒指→帽子→鞋子的结算顺序。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖普通怪物装备掉落四类装备、重复戒指自动售出、怪物击败文案和铜钱副作用，作为普通怪物装备掉落 helper 的 Store 级回归测试。
- 已在 `useMiningStore.ts` 中新增 `applyMainMineBossGearRewards` helper，收敛主矿洞 BOSS 戒指/帽子/鞋子奖励的实际发放和文案拼接逻辑，同时保持 domain 决策函数给出的奖励顺序。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖主矿洞 BOSS 首杀武器、戒指、帽子、铜钱、矿石奖励、首杀记录和格子状态结算，作为主矿洞 BOSS 奖励发放 helper 的 Store 级回归测试。
- 已在 `useMiningStore.ts` 中新增 `applyInfestedFloorClearRewards` helper，收敛感染层全清奖励的物品发放、战利品记录、铜钱发放和文案拼接逻辑。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖感染层最后一只怪物击败后的楼梯解锁、全清奖励、铜钱副作用、矿石入库和格子状态结算，作为感染层全清奖励 helper 的 Store 级回归测试。
- 已在 `useMiningStore.ts` 中新增 `usePermanentGuildItem` helper，收敛公会徽章、生命护符、幸运铜钱和守护符的批量数量夹取、背包扣除、永久加成写入和战斗日志记录逻辑。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖永久加成类矿洞道具的批量使用、数量夹取、四类永久属性加成、背包扣除、战斗日志记录和缺失物品提示，作为道具使用 helper 的 Store 级回归测试。
- 已在 `useMiningStore.ts` 中新增 `usePermanentGuildCombatItem` 和 `useSlayerCharm` helper，收敛 `useCombatItem` 中永久公会道具与猎魔符的高层分发表。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖猎魔符每次探索只能激活一次、重复使用不消耗物品，以及战斗中使用会记录日志。
- 已在 `useMiningStore.ts` 中新增 `useCombatEffectItem` helper，收敛 `COMBAT_ITEM_EFFECTS` 对应的玩家状态、战斗伤害、怪物状态、击杀结算和非战斗退回逻辑。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖伤害类战斗道具击杀怪物后的奖励结算、格子状态更新和探索中误用伤害道具时的物品退回。
- 已在 `useMiningStore.ts` 中新增 `useRestorativeCombatItem` helper，收敛食物/药剂类道具的满血满体校验、烹饪品委托、炼金师加成、恢复结算和战斗日志记录逻辑。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖恢复类矿洞道具在战斗中的炼金师加成、HP/体力恢复、物品消耗、日志记录，以及满血满体时不消耗物品的边界。
- 已在 `useMiningStore.ts` 中新增 `applyCombatDefeatSideEffects` helper，收敛战败时结束战斗/探索、清空状态、回滚本次探索战利品、随机丢失背包物品、扣除铜钱、恢复 HP 和退出骷髅矿穴的副作用。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖骷髅矿穴战败后的探索状态清理、战利品回滚、背包物品丢失、铜钱惩罚、HP 恢复、睡袋/状态清理和战败日志记录。
- 已在 `useMiningStore.ts` 中新增 `advanceNormalMineFloor` 和 `advanceSkullCavernFloor` helper，收敛普通矿洞/骷髅矿穴前进、最深层记录、安全点保存和 120 层转入骷髅矿穴的副作用。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖普通矿洞前进到安全点时保存安全点、重新生成楼层，以及骷髅矿穴前进到安全点时更新最深层和安全点。
- 已在 `useMiningStore.ts` 中新增 `clearCombatState` helper，复用离开矿洞和睡袋过夜时的战斗状态清理逻辑，同时保持睡袋过夜不清除探索状态和猎魔符效果。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖睡袋清理战斗状态但保留当前探索、楼层和猎魔符效果的边界。
- 已在 `useMiningStore.ts` 中新增 `applyMonsterLureToFloor` helper，收敛怪物诱饵统计现存怪物、筛选隐藏空格、随机放置新增怪物和更新楼层怪物总数的副作用。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖怪物诱饵消耗、按隐藏空格补充怪物、保留已揭示空格和更新楼层怪物总数的 Store 级回归。
- 已在 `useMiningStore.ts` 中新增 `beginMineExploration` helper，复用进入主矿洞和骷髅矿穴时的探索状态初始化、本次战利品清空、战斗状态清空、楼层生成和自动 BOSS 检查流程。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖从指定安全点进入主矿洞、未解锁骷髅矿穴时拒绝进入，以及解锁后从指定安全点进入骷髅矿穴并重置临时战斗状态。
- 已在 `useMiningStore.ts` 中新增 `clearTransientExplorationStateForLoad` helper，读档时统一清理非序列化的探索、战斗、格子和猎魔符瞬态状态。
- 已扩展 `src/tests/stores/mining.test.ts`，覆盖读档迁移旧安全点时会清理残留战斗怪物、战斗日志、战斗状态、格子和猎魔符效果。
- `MiningView.vue` 已降至约 1166 行。
- 最近一次 targeted 验证通过：`pnpm exec vitest run src/tests/stores/mining.test.ts src/tests/domain/miningCombat.test.ts`，共 45 个测试；`pnpm run type-check` 通过。
- 下一步推荐继续拆分剩余探索类副作用，或转向 `useInventoryStore.ts` 的物品/装备规则拆分；仍保持每次只拆一个可验证切片，并在每个切片后跑 targeted 测试、`pnpm run type-check` 和完整门禁。

## 阶段 6：拆分 Inventory Store 和装备展示

### 目标

降低背包、装备、工具、戒指、帽子、鞋子、附魔、临时背包、升级队列混在同一 Store 中的复杂度。

### 建议模块

```text
src/domain/inventory/itemStacks.ts
src/domain/inventory/equipmentSlots.ts
src/domain/inventory/toolUpgrades.ts
src/domain/inventory/equipmentPresets.ts
src/domain/inventory/capacity.ts
```

### Store 保持入口

`useInventoryStore.ts` 可以继续作为统一外观，但内部调用纯规则函数。不要急于拆成多个 Pinia Store，避免破坏存档和调用方。

### 当前状态

- 已新增 `src/domain/inventory/itemStacks.ts`，提取背包物品计数、随身物品计数和主背包/临时背包可放入容量计算规则。
- 已在 `src/domain/inventory/itemStacks.ts` 中继续提取 `removeItemFromStacks`，收敛物品删除前总量校验、按 `normal → fine → excellent → supreme` 消耗和指定品质删除规则。
- 已在 `src/domain/inventory/itemStacks.ts` 中继续提取 `addItemToStacks`，收敛主背包已有栈填充、新栈创建、溢出到临时背包和剩余丢失数量计算规则。
- 已在 `src/domain/inventory/itemStacks.ts` 中继续提取 `moveTempItemToStacks`，收敛临时背包单项迁移到主背包、部分迁移后保留剩余数量、可用容量下创建新主背包栈等规则。
- 已新增并扩展 `src/domain/inventory/equipmentEnchantments.ts`，提取 `applyEquipmentEnchantments`、`filterEquipmentEffectEnchantmentIds`、`createRandomEnchantmentResult`、`calculateDisenchantCost`、`createDisenchantResult` 和 `createCustomizeEnchantmentsResult`，收敛装备附魔列表写回、旧存档兼容字段 `enchantmentId` 同步、空附魔清除、武器通用装备效果过滤、随机附魔资金校验与消息、祛除附魔费用计算和定制附魔结果组装规则。
- 已新增 `src/domain/inventory/toolUpgrades.ts`，提取 `upgradeToolTier`、`startToolUpgrade` 和 `advanceToolUpgradesOneDay`，收敛工具升一级、同工具升级排队限制、2 天等待期和每日完成队列推进规则。
- 已新增 `src/domain/inventory/equipmentPresets.ts`，提取 `createEquipmentPresetState`、`deleteEquipmentPresetState`、`renameEquipmentPresetState`、`saveCurrentEquipmentToPresetState`、`planEquipmentPresetApplication` 和 `createEquipmentPresetApplicationMessage`，收敛装备方案创建上限、删除时清理当前方案、重命名空输入保护、当前装备写入方案、方案应用时装备索引匹配、空槽卸下、重复戒指槽冲突和缺失提示组装规则。
- 已新增并扩展 `src/domain/inventory/equipmentSales.ts`，提取 `planWeaponSale`、`planRingSale`、`planSingleSlotEquipmentSale`、`shiftEquippedIndexAfterSale`、`getEquipmentSellPrice` 和 `createEquipmentSaleMessage`，收敛武器出售限制、装备列表移除、戒指双槽索引修正、单槽装备索引修正、按装备类型查询售价和出售消息规则。
- 已新增并扩展 `src/domain/inventory/saveMigrations.ts`，提取 `migrateSavedInventoryItems`、`migrateSavedCapacity`、`migrateSavedTools`、`migrateSavedWeapons`、`migratePendingToolUpgrades`、`migrateSavedRings`、`migrateSavedHats`、`migrateSavedShoes`、`migrateSavedEquipmentPresets`、`migrateSavedActivePresetId` 和 `clampLoadedEquippedIndex`，收敛旧物品过滤、容量回退、旧工具补齐、旧武器 tier 迁移、附魔字段兼容、升级队列过滤、读档装备索引修正和装备方案读取规则。
- 已新增 `src/domain/inventory/equipmentSorting.ts`，提取 `sortWeaponsForInventory`、`sortRingsBySellPrice` 和 `sortEquipmentBySellPrice`，收敛武器按攻击力/附魔攻击/ID 排序、戒指按售价/ID 排序、单槽装备按售价/ID 排序以及排序后装备索引保持规则。
- 已新增 `src/domain/inventory/equipmentBonuses.ts`，提取 `sumEquipmentBonus`、`countActiveEquipmentSetPieces`、`getActiveEquipmentSetBonuses` 和 `createActiveEquipmentSetSummaries`，收敛戒指/帽子/鞋子基础效果、装备附魔效果、武器功能性附魔、套装奖励合计、套装激活件数和 UI 摘要规则。
- 已新增 `src/domain/inventory/capacity.ts`，提取 `expandStandardInventoryCapacity`、`expandExtraInventoryCapacity`、`INITIAL_INVENTORY_CAPACITY` 和 `MAX_STANDARD_INVENTORY_CAPACITY`，收敛普通背包扩容到 60 格封顶、额外扩容可继续突破上限的规则。
- 已新增 `src/domain/inventory/equipmentCrafting.ts`，提取 `createEquipmentCraftingPlan`，收敛戒指、帽子和鞋子制作时的可合成校验、材料不足提示、铜钱不足提示、消耗材料计划和成功消息组装规则。
- 已新增并扩展 `src/tests/domain/inventoryItemStacks.test.ts`，覆盖按品质计数、主背包+临时背包合并计数、部分栈/空槽容量计算、品质不匹配边界、添加物品优先填充已有栈、主背包满后溢出临时背包、主/临时背包均满时返回剩余数量、临时背包迁移、跨品质删除、指定品质删除和删除失败不变更原栈。
- 已新增并扩展 `src/tests/domain/inventoryEquipmentEnchantments.test.ts`，覆盖附魔列表写回、首个附魔同步到旧字段、清空附魔、不变更原装备对象/输入数组、武器附魔通用效果过滤、随机附魔资金不足/成功结果、祛除附魔费用与资金边界、定制附魔空输入/资金不足/成功结果。
- 已新增 `src/tests/domain/inventoryToolUpgrades.test.ts`，覆盖工具升一级、缺失工具/满级工具不升级、同工具重复排队失败和每日推进完成列表。
- 已新增并扩展 `src/tests/domain/inventoryEquipmentPresets.test.ts`，覆盖装备方案创建、数量上限、删除当前方案、重命名空输入保护、保存当前装备选择、应用方案时匹配拥有装备索引、缺失装备提示、旧方案重复戒指槽处理和应用结果消息。
- 已新增并扩展 `src/tests/domain/inventoryEquipmentSales.test.ts`，覆盖出售后装备索引修正、武器出售限制、戒指双槽修正、帽子/鞋子单槽修正、按装备类型注入式查询售价和出售消息。
- 已新增并扩展 `src/tests/domain/inventorySaveMigrations.test.ts`，覆盖未知物品过滤、有效物品克隆、容量回退、装备方案克隆、当前方案 ID 回退、缺失工具补齐、装备附魔字段规范化、新旧武器存档形态迁移、旧 `pendingUpgrade` 兼容、无效升级队列过滤、装备索引越界修正和戒指/帽子/鞋子读档兼容。
- 已新增 `src/tests/domain/inventoryEquipmentSorting.test.ts`，覆盖武器排序优先级、饰品按售价和 ID 排序、戒指双槽索引保持以及排序不变更源数组/源对象。
- 已新增 `src/tests/domain/inventoryEquipmentBonuses.test.ts`，覆盖装备基础效果、附魔效果、武器功能性附魔和套装奖励叠加，重复同 ID 戒指只计一次套装件数，套装奖励阈值和 UI 摘要状态。
- 已新增 `src/tests/domain/inventoryCapacity.test.ts`，覆盖初始容量 24、普通扩容每次 +4 且不超过 60、达到或超过普通上限后不再普通扩容、额外扩容可突破普通上限。
- 已新增 `src/tests/domain/inventoryEquipmentCrafting.test.ts`，覆盖不可制作装备、缺少材料、铜钱不足、成功制作消耗计划不可变等制作规则。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充 `moveFromTemp` 全量迁移、部分迁移和 `moveAllFromTemp` 批量迁移回归；同时修复 `moveAllFromTemp` 在主背包格子满但已有同类栈仍可叠加时过早停止的问题。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充工具升级队列 Store 回归，确认 `startUpgrade` 会进入 2 天等待、重复升级同一工具失败、`dailyUpgradeUpdate` 第二天完成并实际提升工具等级。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充装备方案 Store 回归，确认创建、重命名、保存当前武器、应用方案时缺失装备提示、旧方案重复戒指槽处理、删除当前方案和清理 `activePresetId` 的外部行为不变。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充定制附魔和祛除附魔 Store 回归，确认资金不足时不写回装备、成功时扣钱并同步 `enchantmentId` / `enchantmentIds`、祛除附魔时清空旧字段。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充装备出售 Store 回归，确认出售武器、戒指、帽子和鞋子后会正确修正装备索引并发放铜钱。
- 已扩展 `src/tests/stores/inventory.test.ts`，补充装备排序 Store 回归，确认排序后武器、戒指、帽子和鞋子仍指向原本装备的实例。
- 已将 `useInventoryStore.ts` 中的 `addItem`、`getItemCount`、`getCarriedItemCount`、`getAddableItemQuantity`、`removeItem`、`moveFromTemp`、`expandCapacity`、`expandCapacityExtra`、`setEquipmentEnchantments`、`getEquipmentEnchantmentEffects`、`getEquipmentBaseSellPrice`、`sellWeapon`、`sellRing`、`sellHat`、`sellShoe`、`sortEquipment`、`getEquipmentBonus`、`activeSetBonuses`、`activeSets`、`craftRing`、`craftHat`、`craftShoe`、`upgradeTool`、`startUpgrade`、`dailyUpgradeUpdate`、`createEquipmentPreset`、`deleteEquipmentPreset`、`renameEquipmentPreset`、`saveCurrentToPreset`、`applyEquipmentPreset`、`randomlyEnchantEquipment`、`disenchantEquipment`、`customizeEquipmentEnchantments` 和 `deserialize` 内的物品/容量/装备/工具/方案读取逻辑切换为调用纯规则 helper，保持 Store 外部 API 不变；物品存在校验、图鉴发现、浮动提示、装备定义查询、发钱、附魔 ID 规范化、随机附魔抽取、扣钱和实际装备 equip/unequip/writeback 副作用仍留在 Store 层，`deserialize` 中已无 `as any` 或 `Record<string, unknown>` 强转残留。
- 已保留 `MAX_STACK = 999_999_999` 的现有大堆叠策略，未改动装备、工具和存档结构。
- 最近一次 targeted 验证通过：`pnpm exec vitest run src/tests/domain/inventorySaveMigrations.test.ts src/tests/stores/inventory.test.ts --reporter=verbose`，共 19 个测试；`pnpm run type-check` 通过。
- Stage 6 已基本收尾；如无新回归，应转入阶段 7 的长列表分页/数量选择复用，不再继续扩大 Inventory Store 拆分范围。

### 优先迁移内容

1. 物品叠加和容量判断。
2. 临时背包迁移。
3. 装备附魔设置、随机附魔、洗附魔。
4. 工具升级队列。
5. 装备预设。

### 验收

- 同物品同品质可以大量叠加。
- 背包容量仍限制格子数，而不是堆叠数量。
- 临时背包逻辑不变。
- 工具升级跨天完成逻辑不变。
- 装备预设可保存和应用。
- 附魔详情展示与矿洞界面一致。

## 阶段 7：拆分 Processing、鱼塘、酒窖、育种等长列表逻辑

### 目标

把分页、批量放入、队列展示、机器任务等通用交互抽成可复用能力，避免每个页面重复实现。

### 通用组件和 composable

```text
src/components/game/common/PagedList.vue
src/components/game/common/QuantityPickerDialog.vue
src/composables/game/usePagination.ts
src/composables/game/useQuantityPicker.ts
```

### 迁移范围

- 鱼塘鱼苗放入和移除
- 育苗塘列表
- 酒窖槽位列表
- 牲口棚列表
- 育种台列表
- 加工机器任务列表

### 验收

- 所有可能超过 50 项的列表默认分页。
- 翻页不会改变当前选择或误执行操作。
- 批量数量选择支持 1、10、20、50、全部等现有需求。
- 每个列表空状态文案清晰。

### 当前状态

- 已新增 `src/composables/game/usePagination.ts`，统一默认 50 项分页、页码夹取、当前页切片和前后翻页/重置辅助方法。
- 已新增 `src/tests/composables/usePagination.test.ts`，覆盖默认页大小、页码夹取、列表缩短时的安全页、翻页、重置行为和 10 万项大列表重复翻页性能。
- `src/views/game/CottageView.vue` 的酒窖槽位列表已接入通用分页 composable，外部分页控件和现有空状态保持不变。
- `src/views/game/FishPondView.vue` 的鱼塘鱼群、可放入鱼苗、育苗塘和繁殖塘列表已接入通用分页 composable，放入/移除数量选择逻辑保持不变。
- `src/views/game/AnimalView.vue` 的鸡舍、牲口棚和马厩动物列表已接入通用分页 composable，每个建筑保留独立页码，喂食、抚摸、出售和改名交互保持不变。
- `src/views/game/ProcessingView.vue` 的种子制造机任务列表已接入通用分页 composable，每个机器槽位保留独立页码，收取和取消任务流程保持不变。
- `src/views/game/BreedingView.vue` 的种子箱、图鉴网格和育种选种弹窗已接入通用分页 composable，图鉴筛选和打开选种弹窗时会重置对应页码，选种、查看详情和育种流程保持不变。
- 已新增 `src/composables/game/useQuantityPicker.ts`，统一数量选择的最小值/最大值夹取、输入解析、加减、最小/最大和重置逻辑。
- 已新增 `src/tests/composables/useQuantityPicker.test.ts`，覆盖边界夹取、文本输入解析、动态最大值、快捷按钮和 10 万次重复更新性能。
- `src/composables/layout/useVoidChestUi.ts` 的虚空箱存取数量流程已接入通用数量选择 composable，现有 `VoidChestQuantityDialog` 外观和事件契约保持不变。
- `src/views/game/FishPondView.vue` 的鱼塘批量取出数量输入和快捷按钮已接入通用数量选择 composable，取出弹窗外观和实际移除流程保持不变。
- `src/views/game/ProcessingView.vue` 的加工制造数量输入和最少/最多快捷按钮已接入通用数量选择 composable，制造弹窗外观、动态最大可制造数量和批量制造流程保持不变。
- `src/views/game/FishPondView.vue` 的鱼塘放入鱼苗快捷数量已复用通用数量夹取规则，实际放入数量会按背包数量和鱼塘剩余容量裁剪，按钮禁用状态与可放入上限保持一致。
- `src/views/game/ShopView.vue` 的批量购买和批量出售数量输入、加减按钮、最少/最多快捷按钮已接入通用数量选择 composable，动态可购买/可出售上限和弹窗流程保持不变。
- `src/views/game/CookingView.vue` 的烹饪数量输入、加减按钮、最少/最多快捷按钮已接入通用数量选择 composable，可烹饪上限、烹饪耗时和弹窗流程保持不变。
- `src/views/game/HanhaiView.vue` 的瀚海贸易上架数量输入、加减按钮、最少/最多快捷按钮已接入通用数量选择 composable，预计积分和上架流程保持不变。
- `src/views/game/MiningView.vue` 的矿洞战斗物品批量使用数量已接入通用数量选择 composable，确认弹窗事件契约、批量使用上限和实际使用流程保持不变。
- 本阶段下一步建议进入阶段 8，开始拆分 `useEndDay.ts` 的隔夜结算处理器，并保留现有 `handleEndDay()` 外部入口。

## 阶段 8：整理隔夜结算

### 目标

把 `useEndDay.ts` 拆成按系统组织的结算处理器，并为超大存档预留分块处理能力。

### 建议结构

```text
src/domain/endDay/types.ts
src/domain/endDay/caveEndDay.ts
src/domain/endDay/farmEndDay.ts
src/domain/endDay/farmMapEndDay.ts
src/domain/endDay/greenhouseEndDay.ts
src/domain/endDay/animalEndDay.ts
src/domain/endDay/fishPondEndDay.ts
src/domain/endDay/processingEndDay.ts
src/domain/endDay/npcEndDay.ts
src/domain/endDay/eventsEndDay.ts
src/domain/endDay/morningEventEndDay.ts
src/domain/endDay/recipeEndDay.ts
src/domain/endDay/seasonEndDay.ts
src/composables/useEndDay.ts
```

### 迁移策略

1. 先提取不依赖 UI 的处理器。
2. 保留 `handleEndDay()` 作为唯一外部入口。
3. 每个处理器返回结构化结果，由 `useEndDay.ts` 汇总日志。
4. 对农田和温室处理器增加可选 chunk 参数。
5. 保持每日事件、NPC、天气、加工、动物等执行顺序不变。

### 验收

- 普通睡觉结算结果不变。
- 资源副本睡袋结算结果不变。
- 工具升级、作物成长、动物产出、鱼塘繁殖、NPC 事件均正常。
- 大量农田/温室数据不会在 UI 无反馈的情况下长时间卡死。

### 当前状态

- 已新增 `src/domain/endDay/fishPondEndDay.ts`，先将鱼塘每日结算的产物入包和日志格式化从 `useEndDay.ts` 抽出为独立处理器，`handleEndDay()` 仍是唯一外部入口。
- 已新增 `src/tests/domain/fishPondEndDay.test.ts`，覆盖未建造鱼塘跳过、产物入包/死亡/生病/育苗/自然繁衍/失败日志，以及 5,000 件产物和 500 条繁衍日志的性能边界。
- 已新增 `src/domain/endDay/caveEndDay.ts`，将山洞活跃天数推进、产物入包和品质日志格式化从 `useEndDay.ts` 抽出为独立处理器，调用顺序保持不变。
- 已新增 `src/tests/domain/caveEndDay.test.ts`，覆盖未选择山洞用途不推进天数、蘑菇/果蝠产物入包与品质日志，以及 5,000 件山洞产物的性能边界。
- 已新增 `src/domain/endDay/farmEndDay.ts`，将果树和野生树木的每日更新、产物入包与汇总日志抽出为同一处理器，保持果树先于野树的执行顺序。
- 已新增 `src/tests/domain/farmEndDay.test.ts`，覆盖空结果、季节参数、产物入包顺序和现有日志，并验证 5,000 件水果加 5,000 件采脂产物的处理耗时约 19ms。
- 已新增 `src/domain/endDay/processingEndDay.ts`，先承载酒窖每日升级处理，保留农舍 3 级解锁边界、每周期增值日志与每 16 次升级的陈酿年份日志。
- 已新增 `src/tests/domain/processingEndDay.test.ts`，覆盖未解锁跳过、普通增值、陈酿年份里程碑，以及 5,000 条酒窖升级结果约 4ms 的性能边界。
- 已扩展 `src/domain/endDay/farmEndDay.ts`，将农田虫害/杂草结果的日志格式化抽出为处理器；每日地块更新仍在原顺序执行，日志仍在工具升级和乌鸦袭击之后写入。
- 已新增 `src/domain/endDay/greenhouseEndDay.ts` 和 `src/domain/endDay/types.ts`，为农田/温室结算提供连续分块遍历、稳定顺序和每块完成进度回调；`handleEndDay()` 继续保持同步唯一入口。
- `useFarmStore.dailyUpdate()` 与 `greenhouseDailyUpdate()` 已增加可选 chunk 参数，默认调用行为不变；同步单次遍历与分块遍历的状态和统计结果已有 Store 等价性测试。
- `src/data/crops.ts` 已为作物 ID 和种子 ID 建立保留首项语义的只读索引，避免大存档日结为每个地块重复线性扫描全部作物数据。
- 已新增 `src/tests/domain/endDayChunking.test.ts`、`greenhouseEndDay.test.ts`、`cropLookup.test.ts` 和 `src/tests/stores/farm.test.ts`；实测 10 万农田地块约 925ms、10 万温室地块约 963ms、10 万次作物查询约 5ms。
- 已新增 `src/domain/endDay/animalEndDay.ts`，分别抽取动物产出、鸡舍/牲口棚孵化器和宠物拾取处理器；动物日更、晨间雇工/配偶、孵化器和宠物的相对调用位置保持不变。
- 已新增 `src/tests/domain/animalEndDay.test.ts`，覆盖空结果、产物入包、死亡/生病/康复日志、鸡舍先于牲口棚的孵化顺序、宠物拾取与无产物分支，以及 5,000 件动物产物和 500 个状态名称约 6ms 的性能边界。
- 已扩展 `src/domain/endDay/processingEndDay.ts`，新增工坊加工、育种进度和工具升级处理器；`useProcessingStore.dailyUpdate()` 返回自动收取与待收取名称，`useBreedingStore.dailyUpdate()` 返回按原顺序生成的日志和完成数量，`useEndDay.ts` 继续在原调用位置汇总日志。
- 育种核心算法新增可选日志接收器，手动育种默认仍直接写日志，隔夜育种则收集后由 `useEndDay.ts` 写入；变异、图鉴发现、杂交结果和普通育种完成的相对日志顺序保持不变。
- 已扩展 `src/tests/domain/processingEndDay.test.ts`，并新增 `src/tests/stores/processing.test.ts`、`src/tests/stores/breeding.test.ts`，覆盖空结果、重复名称首见顺序汇总、工具升级文案、加工/育种状态推进、Store 不直接写隔夜日志，以及每类 5,000 项批量结果的性能边界。
- 已新增 `src/domain/endDay/eventsEndDay.ts`，抽取日期推进前的 NPC/烹饪重置、瀚海赌局重置与通商结算、仙灵发现/能力解锁、旧存档体力加成修复、出货箱结算和委托过期处理；处理器通过日志与场景回调保持原始调用顺序。
- `useHanhaiStore.dailyTradeUpdate()` 已改为返回完成交易的物品、数量和积分，不再直接写隔夜日志；上架交易等手动流程仍保留原有即时日志。
- 已新增 `src/tests/domain/eventsEndDay.test.ts` 和 `src/tests/stores/hanhai.test.ts`，覆盖完整调用顺序、场景与日志交错、锁定通商分支、旧存档最大体力补齐、交易状态推进，以及各 5,000 项通商/发现/能力/委托批量结果的性能边界。
- 已新增 `src/domain/endDay/npcEndDay.ts` 的家庭事件处理器，按原顺序完成婚礼更新与事件、孕期出生/阶段变化/流产日志、子女成长和生育提议；婚礼对象缺失时仍回退为“心上人”，生育提议配偶缺失时仍回退为“配偶”。
- 已扩展 `src/domain/endDay/npcEndDay.ts`，新增跨越动物日更的夜间喂食协助与新日期晨间协助处理器；雇工喂食、配偶补喂、`animalStore.dailyUpdate()`、新日喂食标记、雇工浇水/收获/除草、配偶浇水/做饭/收获的相对顺序和随机调用次数保持不变。
- 已进一步扩展 `src/domain/endDay/npcEndDay.ts`，抽取 12 名知己的每日加成；每名知己的基础概率、2500 好感额外概率、随机调用次数、物品数量、五种物品名称回退词和全村好感跳过知己本人均保持不变。
- 已新增并扩展 `src/tests/domain/npcEndDay.test.ts`，覆盖三种出生品质原文案、家庭事件精确顺序、雇工与配偶喂食分支、晨间动作、12 名知己概率/随机次数/回退词/副作用顺序，以及 10,000 次家庭结算、100,000 地块晨间协助和 100,000 NPC 好感更新性能边界；当前该文件共 35 个测试。
- 已扩展 `src/domain/endDay/eventsEndDay.ts`，抽取天气与行情日志、换季前作物风险提示、晨间教程条件与临时标记清理、节日奖励和食谱、节日特殊效果、成就日志/食谱回调和山洞解锁；测试覆盖日志顺序、场景回调、随机副作用和 100,000 地块倒计时扫描。
- 已新增 `src/domain/endDay/farmMapEndDay.ts`，抽取荒野、竹林、山丘和溪流田庄的每日特殊效果，保留物品、伤害、作物破坏、技能经验、矿脉、鱼获上限和全部随机调用顺序，并覆盖 100,000 地块性能边界。
- 已新增 `src/domain/endDay/recipeEndDay.ts`，集中处理 NPC 多级好感、婚姻专属/通用婚后、技能、瀚海物品和成就食谱解锁；原食谱 ID、条件和日志时机保持不变。
- 已新增 `src/domain/endDay/morningEventEndDay.ts`，抽取晨间随机事件、选项事件、彩蛋、旁白、作物损失和好感效果；主骰、旁白选择和作物选择的随机调用顺序已有定向测试，100,000 地块筛选约 20ms。
- 已新增 `src/domain/endDay/seasonEndDay.ts`，抽取换季农田更新、日志、果树季节更新、桃源田庄自动施肥和教程标记；种植等级保持延迟获取，未换季或非标准田庄不会发生额外读取。
- `useEndDay.ts` 已降至约 633 行，`handleEndDay()` 继续作为唯一同步外部入口；剩余内容以顶层结算顺序、睡眠恢复模式和各 Store/处理器接线为主，阶段 8 不再为了降行数继续细碎拆分。
- 最新完整门禁通过：`pnpm run type-check`、`pnpm run lint`、`pnpm exec vitest run --reporter=dot --maxWorkers=2`（103 个文件、573 个测试）、`pnpm run build`、`git diff --check`；构建仍只有既有 Browserslist 数据过期和 `useGameStore` 大 chunk 警告。默认高并发全量测试曾触发 `GameLogDialog` 和 `MineElevatorDialog` 两项挂载微基准抖动，二者独立复跑通过，限制为 2 个 worker 后全量稳定通过；性能测试与生产构建仍不应并发运行。
- 阶段 8 已达到收尾标准。下一步进入阶段 9，优先用现有 Vitest 环境建立游戏数据一致性校验，不急于引入 `tsx` 或拆分大型数据文件；若未来需要真正跨帧显示结算进度，应先统一同步 `handleEndDay()` 调用点，再单独设计异步入口和存档中断恢复策略。

## 阶段 9：数据文件治理

### 目标

数据文件很大，但不应优先重构。等业务逻辑稳定后，再整理内容数据的可维护性。

### 实现

- 不要把 `crops.ts`、`breeding.ts` 等大数据文件盲目拆成几十个小文件。
- 已新增 `src/tests/data/gameDataValidation.test.ts`，直接复用 Vitest/Vite 的 TypeScript 和路径别名环境，不额外引入 `tsx`。
- 已新增 `pnpm run validate:data`，作为内容数据变更后的快速质量门禁。
- 已新增 `src/data/specialItems.ts`，集中维护“墨墨的fumo”的物品 ID、兑换输入、兑换输出、固定品质和识别函数。
- 烹饪、普通 NPC、隐藏 NPC 和物品目录均改为引用同一份 fumo 配置，不再各自维护字符串或数量常量。

### 校验范围

- 校验物品、作物、种子、鱼类、食谱、加工机器、加工配方、普通 NPC 和隐藏 NPC 的 ID 唯一性。
- 校验作物与种子、鱼类、烹饪输入输出、机器建造材料、加工输入输出、NPC 喜好、隐藏 NPC 供奉/求缘/结缘、怪物掉落和 BOSS 矿石奖励的物品引用存在。
- 校验售价、成长天数、再生天数、最大收获次数、加工数量、加工天数、配方数量、恢复值和掉落概率为有限且不低于业务下限的数值。
- 校验加工配方引用的机器存在。
- 校验 fumo 兑换固定为青菜 2000 个换极品 fumo 2000 个，且输入输出物品均存在。
- 对完整目录执行 100 轮引用扫描，并要求在 1 秒内完成；当前实测约 20ms。

### 已修复问题

- 显式消除了 `persimmon`、`osmanthus_tea`、`dragon_pearl` 和三个 `trade_*` 物品的历史重复 ID，同时保持原有首项解析语义。
- 果树产物与作物同 ID 时复用作物定义；手写通商物品优先于装备图鉴自动生成项，不使用全局静默去重。
- 新增基础物品 `stone`，修复三名 NPC 厌恶物品引用不存在的问题。
- 食谱产物校验改为检查实际生成的 `food_${recipe.id}`，与烹饪 Store 和物品目录规则一致。

### 验收

```bash
pnpm run type-check
pnpm run lint
pnpm run validate:data
pnpm exec vitest run --reporter=dot --maxWorkers=2
pnpm run build
git diff --check
```

- 阶段 9 数据校验共 6 项测试，全部通过。
- 阶段 9 收尾时全量验证为 104 个测试文件、579 项测试；阶段 10 增加文档校验后，最新全量验证为 105 个测试文件、582 项测试全部通过。
- 生产构建通过，仅保留既有 Browserslist 数据过期和 `useGameStore` 大 chunk 警告。
- 阶段 9 已达到收尾标准；下一步进入阶段 10，不继续拆分大型内容数据文件。

## 阶段 10：文档和 Agent 维护约定

### 目标

让未来 Agent 在新增功能时不再重新踩同样的坑。

### 新增文档

```text
docs-source/architecture.md
docs-source/save-compatibility.md
docs-source/game-rules.md
docs-source/electron-packaging.md
docs-source/testing-guide.md
```

### 文档内容

1. `architecture.md`
   - Vue、Pinia、domain、composable、component 的职责边界。
   - 新功能应该放在哪里。

2. `save-compatibility.md`
   - 存档字段迁移规则。
   - 禁止删除字段的流程。
   - 反序列化兼容模式。

3. `game-rules.md`
   - 掉落率倍率规则。
   - 小憩和睡袋规则。
   - 物品堆叠规则。
   - 农田批量上限。
   - 分页规则。

4. `electron-packaging.md`
   - 未压缩版输出策略。
   - 数据保存路径策略。
   - 为什么不再输出单 exe 便携版。

5. `testing-guide.md`
   - 如何跑测试。
   - 如何补规则测试。
   - 如何写存档迁移测试。

### 当前状态

- 五份维护文档已经完成，并以当前代码、测试、构建配置和存档实现为事实来源。
- 已新增 `src/tests/data/documentationValidation.test.ts`，自动检查文档存在性、必需章节、相对链接和扫描性能。
- `package.json` 已新增 `pnpm run validate:docs`，可独立运行阶段 10 文档门禁。
- 已完成读者检索验证，能够从文档中定位架构边界、存档兼容、玩法规则、Electron 打包和测试要求。
- 最新完整门禁通过：`pnpm run type-check`、`pnpm run lint`、`pnpm run validate:data`、`pnpm run validate:docs`、全量 Vitest（108 个文件、589 项测试）、`pnpm run build`、`pnpm run build:electron` 和 `git diff --check`。
- `pnpm run build:electron` 成功生成 `pkg/win-unpacked/`；构建仍保留既有 Browserslist 数据过期、`useGameStore` 大 chunk、有意关闭 asar 和 Node 子进程弃用提示，不阻断当前发布。
- 阶段 10 已达到收尾标准，阶段 0 至阶段 10 的计划工作全部完成。

## 后续变更拆分约定

原重构阶段已经完成，不应继续按旧列表重复拆分。后续提交应保持单一主题，并在提交前通过与改动范围匹配的门禁：

1. `fix:` 只修复一个可验证的行为问题，并附回归测试。
2. `feat:` 只新增一个玩法切片，规则、接线和测试应能独立说明。
3. `refactor:` 只调整职责边界，不同时改变玩法数值或存档语义。
4. `test:` 只补测试、基准或数据校验，不隐藏业务行为变更。
5. `docs:` 只更新维护文档、发布说明或架构决策。

## 后续维护 Agent 执行模板

后续 Agent 接到功能、修复或重构任务时，应按以下流程执行：

1. 先阅读与任务相关的维护文档，明确职责边界、兼容约束和保持不变项。
2. 运行基线命令：

```bash
git status --short
pnpm run type-check
pnpm run lint
```

3. 运行最接近改动范围的现有测试，记录修改前状态。
4. 只修改当前任务相关文件，不顺带重排无关模块。
5. 优先移动纯函数，保留外部调用入口。
6. 补或更新测试。
7. 按改动范围运行 `validate:data`、`validate:docs`、全量测试、Web 构建或 Electron 构建。
8. 检查 diff：

```bash
git diff --check
git diff --stat
```

9. 在最终回复中说明：
   - 改了什么
   - 没改什么
   - 跑了哪些命令
   - 是否存在剩余风险

## 手动回归清单

每完成一个较大阶段，应手动走一遍以下流程：

1. 新建存档。
2. 读旧存档。
3. 普通睡觉跨天。
4. 在矿洞使用睡袋睡觉。
5. 任意地点小憩。
6. 背包加入大量同类物品。
7. 农田批量浇水、除虫、除草、收获。
8. 温室批量种植大量作物。
9. 矿洞战斗并检查掉落。
10. 装备大量附魔并查看简略展示和详情。
11. 鱼塘、酒窖、育种台、牲口棚翻页。
12. Electron 未压缩版启动并检查存档路径。

## 重构完成记录

截至 2026-07-10，本轮完整重构已满足以下自动化条件：

- `pnpm run type-check` 通过。
- `pnpm run lint` 通过且无当前已知警告。
- 全量 Vitest 通过，共 108 个测试文件、589 项测试。
- `pnpm run validate:data` 通过，共 6 项数据一致性测试。
- `pnpm run validate:docs` 通过，共 3 项维护文档测试。
- `pnpm run build` 通过。
- `pnpm run build:electron` 通过并生成未压缩目录版。
- `git diff --check` 通过。
- 浏览器手动烟测通过新游戏创建、农田加载、状态栏、小憩和设置弹窗流程，控制台无错误。
- 核心规则存在测试覆盖：
  - 掉落倍率
  - 物品堆叠
  - 小憩时间限制
  - 睡袋资源副本过夜
  - 农田批量限制
  - 附魔合并展示
  - 存档迁移
- 以下文件的职责明显收窄：
  - `src/views/game/FarmView.vue`
  - `src/views/GameLayout.vue`
  - `src/stores/useMiningStore.ts`
  - `src/stores/useInventoryStore.ts`
  - `src/composables/useEndDay.ts`
- 新增玩法应能根据 `architecture.md` 判断放置位置。
- 存档兼容规则有文档说明。
- 后续提交仍必须遵守“重构与新玩法分离”的约定。

手动回归清单仍属于发布前检查，不由单元测试和构建结果替代。

## 后续维护优先级

最高优先级：

1. 修改存档字段、ID 或反序列化逻辑时，同步更新迁移测试和 `save-compatibility.md`。
2. 修改玩法数值或随机规则时，优先调整 `domain` 规则和定向测试，避免在 View 或多个 Store 中复制公式。
3. 涉及超大数量时，同时验证分页、分块结算和性能边界，不只验证界面能够显示。

中优先级：

1. 基于实际加载性能评估 `useGameStore` 大 chunk，再决定是否做路由级动态导入或构建分块。
2. 如需引入统一 `saveVersion`，应作为独立迁移设计实施，并覆盖旧存档升级和失败回退。
3. 每次桌面版发布前运行 Electron 构建并验证 `userdata` 路径、旧存档迁移和目录可写回退。

低优先级：

1. 没有明确维护收益时拆分大型内容数据文件。
2. 样式细节微调。
3. 非关键页面的小规模重排。

## 风险提示

- 存档迁移是最高风险区域，任何字段重命名都必须兼容旧存档。
- 随机系统重构必须支持注入随机函数，否则测试不可控。
- 超大数量玩法不能只依赖前端分页，结算和统计也要避免重复全量扫描。
- Electron 数据路径和 Web 数据路径可能不同，重构存档时必须分别验证。
- Vue 组件拆分后不要通过深层 prop drilling 传递大量状态，必要时使用局部 composable。
- 不要在 Store 之间制造新的循环依赖。

## 后续维护入口

阶段 0 至阶段 10 已全部完成。接到新任务时，从任务类型对应的文档开始，而不是从本计划重新执行历史阶段：

1. 模块放置、依赖方向或职责拆分：阅读 `architecture.md`。
2. 存档字段、ID、数据目录或旧版本兼容：阅读 `save-compatibility.md`。
3. 掉落、小憩、睡袋、堆叠、批量或分页规则：阅读 `game-rules.md`。
4. Windows 打包、未压缩版、数据路径或发布问题：阅读 `electron-packaging.md`。
5. 测试选择、性能边界、迁移测试或质量门禁：阅读 `testing-guide.md`。

只有在现有边界无法容纳新需求、测试暴露重复逻辑，或性能数据证明存在新瓶颈时，才启动新的独立重构计划。
