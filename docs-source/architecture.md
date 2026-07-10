# 桃源乡架构与模块边界

本文用于指导后续功能开发和重构。代码是行为事实来源；当本文与代码不一致时，应先确认行为是否发生了有意变更，再同步代码、测试和文档。

## 运行时概览

- `src/main.ts` 创建 Vue 应用、Pinia 和路由，并为 setup store 补充 `$reset()`。
- `src/router/index.ts` 使用 Hash 路由，页面组件均按路由懒加载。
- `src/views/GameLayout.vue` 是游戏内页面外壳，负责状态栏、全局弹窗、地图导航和跨页面流程组装。
- Pinia Store 保存可序列化游戏状态；纯计算规则优先下沉到 `src/domain/`。
- `src/composables/useEndDay.ts` 是隔夜结算的唯一同步外部入口，具体结算规则分布在 `src/domain/endDay/`。

## 分层职责

| 目录 | 负责 | 不负责 |
| --- | --- | --- |
| `src/types/` | 跨模块数据结构、联合类型、序列化形状 | 业务计算、Store 访问、UI 状态 |
| `src/data/` | 静态配置、物品/作物/NPC/配方定义、只读查找函数 | 玩家运行时状态、弹窗流程 |
| `src/domain/` | 可单元测试的纯规则、迁移、格式化、规划与结算函数 | Vue 响应式状态、路由、日志、音效、浏览器 API |
| `src/stores/` | 权威可变状态、跨动作一致性、序列化/反序列化、实际发放或扣除资源 | 大段模板、重复 UI 状态、难以测试的内联公式 |
| `src/composables/` | 复用的响应式流程、页面动作编排、Store 与 UI 之间的适配 | 持久化权威状态、静态内容目录 |
| `src/components/` | Props/Events 驱动的展示和局部交互 | 直接重建跨模块业务规则 |
| `src/views/` | 路由页面组装、选择 Store/composable、连接事件 | 可复用纯规则、巨型重复弹窗实现 |

## 依赖方向

推荐依赖方向：

```text
types / data
      ↓
    domain
      ↓
    stores
      ↓
  composables
      ↓
views / components
```

允许的例外：

- `data` 可以引用 `types`。
- `domain` 可以引用 `types` 和只读 `data`，但不能引用 Store、路由或浏览器 API。
- Store 可以调用其他 Store，但必须避免形成循环依赖；跨 Store 逻辑应由明确的上层入口编排。
- 页面级 composable 可以协调多个 Store，因为它本身不拥有持久化状态。

## 纯规则约定

纯规则应满足：

1. 相同输入产生相同输出。
2. 不直接修改传入对象；返回新对象、决策结果或变更计划。
3. 随机行为通过参数注入随机函数，默认值可以是 `Math.random`。
4. 不写游戏日志、不播放音效、不切换路由、不读写 `localStorage`。
5. 为边界值、旧数据形状和大数据量补测试。

现有示例：

- `src/domain/drops/`：超过 100% 的掉落倍率。
- `src/domain/sleep/`：小憩时间和睡袋地点规则。
- `src/domain/inventory/`：堆叠、装备、迁移、容量和排序。
- `src/domain/farm/`：批量上限和农田规则。
- `src/domain/mining/`：战斗、掉落、扫荡、格子揭示和状态效果。
- `src/domain/endDay/`：各子系统隔夜结算处理器。

## Store 约定

- Store 是运行时状态的唯一权威来源，不要在组件中维护第二份可持久化副本。
- 实际扣除、发放、装备、状态写入和序列化由 Store 完成。
- 复杂动作应先调用 domain 函数得到结果，再一次性应用结果，避免计算与副作用交错。
- `serialize()` 返回普通对象；`deserialize()` 必须兼容缺失字段和旧字段。
- 新增跨 Store 调用前先检查依赖方向；若 A Store 和 B Store 互相调用，应改为 composable 或专用编排入口。

## Composable 约定

Composable 分三类：

- 通用游戏交互放在 `src/composables/game/`，例如分页和数量选择。
- 页面外壳流程放在 `src/composables/layout/`，例如睡眠、小憩、日志和虚空箱 UI。
- 农田页面流程放在 `src/composables/farm/`，例如地块动作、温室、树木和出货箱。

Composable 可以持有弹窗开关、当前选择、分页页码等临时 UI 状态，但不应替代 Store 保存游戏进度。

## Component 与 View 约定

- 可复用组件优先接收简单 Props，并通过 Events 返回用户意图。
- 组件内可以有输入框、展开状态等局部状态，但业务结果由父级 composable 或 Store 决定。
- 同一页面的组件放在对应功能目录，如 `components/game/farm/`、`layout/`、`mining/`。
- View 负责组装，不应重新实现 domain 已有规则。
- 当一个弹窗包含独立标题、内容、按钮和事件契约时，应拆为组件；只有几行且不复用的展示可以留在 View。

## 隔夜结算边界

`handleEndDay()` 必须继续作为唯一同步入口，原因是隔夜逻辑依赖严格顺序：

- 先读取当日状态，再执行各系统日更。
- 日志、奖励、随机事件和场景回调存在相对顺序。
- 最后执行自动存档。

新增隔夜规则时：

1. 在 `src/domain/endDay/` 新建或扩展处理器。
2. 让处理器返回日志、奖励或回调决策。
3. 在 `handleEndDay()` 的正确顺序位置接线。
4. 同时测试处理器和入口层的调用顺序。

不要为了减少 `useEndDay.ts` 行数而破坏顺序或引入异步入口。

## 新功能放置决策

| 问题 | 放置位置 |
| --- | --- |
| 只是新增物品、NPC、配方或静态数值？ | `data/`，并扩展数据校验 |
| 是可由输入直接计算的规则？ | `domain/<feature>/` |
| 会修改玩家长期状态？ | 对应 Store |
| 协调多个 Store、弹窗、日志或音效？ | 页面级 composable |
| 只是展示 Props 并派发事件？ | component |
| 是新的可导航页面？ | view，并在 router 中懒加载 |
| 会改变存档形状？ | Store `serialize/deserialize`、迁移函数和迁移测试 |

## 禁止的常见做法

- 在 Vue 模板或点击处理器中复制掉落、体力、售价、堆叠等公式。
- 为绕过类型错误写入无依据的 `as any`。
- 使用全局静默去重掩盖数据 ID 冲突。
- 在多个页面各自维护同一个特殊物品 ID 或业务常量。
- 在 domain 中导入 Store、router、音效或日志。
- 新增大列表但不分页，或只分页 UI 而让热路径重复全量扫描。
- 修改存档字段却不补旧存档测试。

## 完成检查

新增或重构功能至少应确认：

1. 规则放在正确层级。
2. 没有新的 Store 循环依赖。
3. 数据 ID 和引用通过 `pnpm run validate:data`。
4. 功能测试覆盖正常、边界和失败路径。
5. 大列表、批量动作或热循环有性能测试。
6. 存档形状变化遵守 [存档兼容约定](./save-compatibility.md)。
7. 全量质量门禁遵守 [测试指南](./testing-guide.md)。
