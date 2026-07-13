# 存档兼容与迁移约定

存档兼容是本项目最高风险边界之一。任何字段重命名、删除、类型变化或 ID 变化，都必须先证明旧存档能够安全加载。

## 当前存档格式

- 最多 3 个槽位，键名为 `taoyuanxiang_save_0` 至 `taoyuanxiang_save_2`。
- 数据以 JSON 组装后使用 AES 加密，保存在浏览器 `localStorage`。
- 导出文件扩展名为 `.tyx`，内容仍是同一段加密字符串。
- 导入时先尝试解密和解析，失败则拒绝写入槽位。
- 当前根对象没有统一的 `saveVersion`；兼容性主要由各 Store 的 `deserialize()` 和局部迁移函数承担。

根对象当前包含：

```text
game, player, inventory, farm,
skill, npc, mining, cooking, processing, achievement,
animal, home, fishing, wallet, quest, shop, settings,
warehouse, breeding, museum, guild, secretNote, hanhai,
fishPond, tutorial, hiddenNpc, savedAt
```

`game`、`player`、`inventory`、`farm` 当前直接加载；其余模块在根字段存在时才调用对应 `deserialize()`。

## 兼容原则

1. **读取宽容，写入统一。** 新版本可以读取旧形状，但只写当前标准形状。
2. **缺失字段必须有默认值。** 不允许因为旧存档没有新字段而报错。
3. **旧字段先兼容读取，再停止写入。** 不能在同一次改动中直接重命名并删除旧字段入口。
4. **数组和对象不能直接复用存档引用。** 应克隆后写入响应式状态。
5. **无效 ID 要有明确策略。** 可过滤已删除内容、映射替代 ID，或保留为占位项；模组内容相关背包物品默认保留 ID、数量、品质和 `compositionTags`，不可静默清零。
6. **数值校验不能依赖 truthy。** `0` 可能是合法值，应使用 `??`、`Number.isFinite()` 和明确边界。
7. **迁移必须幂等。** 同一份旧数据重复经过迁移，结果应稳定。

## 新增字段

新增可持久化字段时必须：

1. 在 Store 状态中定义默认值。
2. 在 `serialize()` 中写入字段。
3. 在 `deserialize()` 中使用 `data.field ?? defaultValue` 或专用迁移函数。
4. 对数组、Map 替代结构和嵌套对象做克隆/规范化。
5. 增加“旧存档缺少该字段”的测试。
6. 若字段影响跨模块规则，增加加载后的行为测试，而不只检查对象相等。

示例：

```ts
const migratedValue = Number.isFinite(data.newValue)
  ? Math.max(0, data.newValue)
  : DEFAULT_VALUE
```

## 字段重命名

重命名必须采用双读单写：

```ts
const currentValue = data.newField ?? data.oldField ?? DEFAULT_VALUE
```

- `serialize()` 只写 `newField`。
- `deserialize()` 暂时同时读取 `newField` 和 `oldField`。
- 测试至少覆盖旧字段、新字段、两者同时存在和两者都缺失。
- 两者同时存在时，新字段优先。
- 在没有统一版本迁移机制前，不应删除旧字段读取逻辑。

## 禁止直接删除字段

删除存档字段必须经过以下流程：

1. 搜索字段在所有 Store、domain、组件、导入导出和测试中的用途。
2. 明确旧数据是忽略、转换、合并还是映射到替代字段。
3. 先停止业务写入，但保留 `deserialize()` 对旧字段的读取或忽略逻辑。
4. 添加旧存档夹具，证明加载后状态和玩法仍正确。
5. 若字段跨 Store，验证加载顺序不会让其他 Store 读取到未迁移状态。
6. 只有在引入明确的存档版本与逐版本迁移链后，才考虑永久移除旧字段读取代码。

在当前无 `saveVersion` 的格式下，默认结论是：**不永久删除旧字段兼容入口。**

## 当前迁移示例

`src/domain/inventory/saveMigrations.ts` 已覆盖：

- 保留背包物品 ID、数量、品质、锁定状态和 `compositionTags`；旧存档缺少 `compositionTags` 时迁移为空数组，未知物品不再被过滤。
- 为旧存档补齐所有必需工具。
- 将旧的单个 `weapon.tier` 映射到当前武器定义 ID。
- 将单个 `enchantmentId` 规范化为 `enchantmentIds` 数组。
- 将旧的单个 `pendingUpgrade` 转为 `pendingUpgrades`。
- 过滤无效或已完成的工具升级。
- 补齐装备默认值并限制越界装备索引。
- 克隆装备方案，避免修改输入存档对象。

这些迁移保持在纯 domain 层，Store 只负责读取迁移结果并写入状态。

## 反序列化模式

推荐顺序：

1. 检查根数据是否为对象。
2. 读取简单标量并应用默认值/边界。
3. 迁移数组和嵌套对象。
4. 过滤未知 ID 或转换旧 ID。
5. 修复派生索引和当前选择。
6. 最后一次性写入 Store 状态。

避免：

- 在迁移过程中调用会扣资源、写日志或触发成就的正常游戏动作。
- 直接把未知对象展开进 Store。
- 用 `data.value || default` 覆盖合法的 `0`、空字符串或 `false`。
- 在多个 Store 中分别实现同一个旧字段转换。

## 根级 Store 变更

新增需要存档的 Store 时：

- 在 `saveToSlot()` 中添加 `serialize()` 结果。
- 在 `loadFromSlot()` 中使用可选读取，确保旧存档没有该根字段时仍可加载。
- 确认新游戏 `$reset()` 后状态正确。
- 增加根级加载或 Store 反序列化测试。

移除 Store 时不能直接删除根字段处理，应先让新版本安全忽略旧根字段。

## ID 变更

物品、作物、NPC、装备、配方等 ID 一旦进入存档，就视为持久化 API。

- 显示名称可以修改，ID 不应随名称修改。
- 必须改 ID 时，建立旧 ID 到新 ID 的映射，并测试旧存档。
- 删除内容时，明确退款、替换、过滤或占位策略。
- 新增数据后运行 `pnpm run validate:data`，但数据校验不能替代存档迁移测试。

## 测试要求

每个迁移至少覆盖：

- 当前格式。
- 最老的仍支持格式。
- 缺失字段。
- `0`、空数组、空字符串、`false` 等边界值。
- 未知 ID、越界索引和无效数值。
- 输入对象未被修改。
- 大数组迁移的性能边界。

迁移测试优先放在 `src/tests/domain/`；需要验证 Pinia 状态时再补 `src/tests/stores/`。

完整流程见 [测试指南](./testing-guide.md)。

## 桌面端保存位置

Electron 正式版会尝试将 Chromium `Local Storage` 和 `settings.json` 放在可执行文件旁的 `userdata/`。目录不可写时会回退到系统默认用户目录。具体策略见 [桌面打包指南](./electron-packaging.md)。

## 变更检查清单

- [ ] 是否改变了任何序列化字段或持久化 ID？
- [ ] 旧字段是否仍可读取？
- [ ] 新字段是否有默认值？
- [ ] 是否误用 truthy 覆盖合法零值？
- [ ] 是否有纯迁移函数和旧存档测试？
- [ ] 是否验证输入对象不被修改？
- [ ] 是否运行类型检查、全量测试和构建？
