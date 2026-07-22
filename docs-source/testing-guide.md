# 测试与质量门禁指南

项目使用 Vitest、jsdom 和 Vue Test Utils。测试集中在 `src/tests/`，路径别名 `@` 指向 `src`。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm run type-check` | Vue/TypeScript 类型检查 |
| `pnpm run lint` | ESLint 检查 |
| `pnpm run validate:data` | 游戏数据 ID、引用、数值和特殊契约校验 |
| `pnpm run validate:docs` | 阶段 10 文档、必需章节、相对链接和扫描性能校验 |
| `pnpm run test` | 单进程文件调度运行全部测试，并用进度点持续输出当前状态 |
| `pnpm run test:watch` | 开发时监听测试 |
| `pnpm exec vitest run <file>` | 运行指定测试文件 |
| `pnpm exec vitest run --reporter=dot --maxWorkers=2` | 推荐的稳定全量测试命令 |
| `pnpm run build` | 类型检查并构建 Web 产物 |
| `pnpm run build:electron` | 构建 Windows 未压缩目录版 |

## 推荐验证顺序

```bash
pnpm run type-check
pnpm run lint
pnpm run validate:data
pnpm run validate:docs
pnpm run test
pnpm run build
git diff --check
```

涉及 Electron 主进程、preload、打包配置或数据路径时，再运行：

```bash
pnpm run build:electron
```

`pnpm run test` 使用 dot reporter：长时间运行时会持续打印进度点，避免误以为进程卡死；单个用例超时为 15 秒，仍可捕获真正挂起的测试。

不要并行运行全量测试、性能测试和生产构建。CPU 竞争会让组件挂载微基准产生无意义抖动。

## 测试目录

| 目录 | 目标 |
| --- | --- |
| `src/tests/domain/` | 纯规则、迁移、边界值、随机注入、性能 |
| `src/tests/stores/` | Pinia 状态变化、跨动作一致性、序列化/反序列化 |
| `src/tests/composables/` | 响应式流程、页面动作编排、UI 状态 |
| `src/tests/components/` | Props、渲染、事件转发、局部交互、挂载性能 |
| `src/tests/data/` | 数据目录唯一性、引用和契约 |

## 规则测试

纯规则应优先下沉到 `src/domain/`，测试至少包含：

1. 正常路径。
2. 最小值、最大值和边界相等。
3. 负数、空数组、缺失字段、非有限数值等异常输入。
4. 输入对象未被修改。
5. 随机分支使用注入的固定随机函数。
6. 大数据量或高频调用的性能边界。

示例思路：

```ts
expect(rollChanceQuantity(1.5, () => 0.49)).toBe(2)
expect(rollChanceQuantity(1.5, () => 0.5)).toBe(1)
expect(rollChanceQuantity(-1, () => 0)).toBe(0)
```

不要通过循环真实随机数来断言概率分布，这类测试慢且容易抖动。

## Store 测试

Store 测试应：

- 每个测试创建新的 Pinia。
- 通过公开动作修改状态，不直接伪造内部闭包变量。
- 同时断言状态、返回值和关键副作用。
- 对批量操作验证部分失败、容量不足和重复调用。
- 对 `deserialize()` 使用真实旧数据形状。

常见初始化：

```ts
beforeEach(() => {
  setActivePinia(createPinia())
})
```

跨 Store 测试只覆盖确实需要的组合，不要为一个纯公式挂载完整游戏。

## 组件测试

组件测试关注：

- Props 是否正确显示。
- 空状态、禁用状态和边界文案。
- 用户操作是否发出正确事件。
- 重复挂载是否残留全局监听器、定时器或状态。
- 长文本、大数量和大量列表项是否不会破坏结构。

展示组件优先浅依赖测试；只有路由、Store 或全局弹窗契约确实重要时才挂载更完整环境。

## 存档迁移测试

任何存档字段变化都必须先阅读 [存档兼容约定](./save-compatibility.md)。

迁移测试建议使用纯函数：

```ts
it('loads the legacy field and prefers the new field', () => {
  expect(migrate({ oldField: 3 })).toBe(3)
  expect(migrate({ oldField: 3, newField: 5 })).toBe(5)
  expect(migrate({})).toBe(DEFAULT_VALUE)
})
```

必须检查：

- 旧字段、新字段和缺失字段。
- 合法的 `0`、`false` 和空数组。
- 旧 ID 到新 ID 的映射。
- 未知 ID 和越界索引。
- 输入对象未被修改。
- 迁移结果可再次迁移且保持稳定。
- 大存档迁移时间在合理边界内。

## 数据校验

`pnpm run validate:data` 当前校验：

- 核心目录 ID 唯一。
- 烹饪、加工、NPC、隐藏 NPC、怪物和 BOSS 奖励引用存在。
- 加工配方引用有效机器。
- 售价、天数、数量、恢复值和掉落概率符合下限。
- “墨墨的fumo”兑换契约。
- 完整目录引用扫描性能。

新增数据类型时，应把它加入校验集合，而不是只为当前报错打补丁。

## 性能测试

性能测试用于防止数量级退化，不用于宣称精确基准。

推荐模式：

1. 在计时前创建夹具，除非夹具创建本身就是被测内容。
2. 纯函数使用 10,000 至 500,000 次循环计算平均耗时。
3. 列表和日结算使用 5,000、10,000 或 100,000 级真实形状数据。
4. 组件使用多次 mount/unmount 的平均耗时。
5. 阈值应能捕获明显退化，同时给 CI 和低性能机器留余量。
6. 同一个性能断言独立复跑仍应稳定。

已知注意事项：

- 组件挂载微基准对并发 worker 和系统负载敏感。
- 推荐全量测试限制为 2 个 worker。
- 如果全量套件中单个微基准失败，先独立复跑；若独立稳定通过，再检查阈值是否过窄。
- 不要用删除性能断言的方式解决真实的算法退化。

## 功能变更测试矩阵

| 变更 | 最低测试 |
| --- | --- |
| 纯公式 | domain 正常/边界/异常测试 |
| Store 动作 | domain 测试 + Store 状态测试 |
| 新弹窗或面板 | component 渲染/事件测试 |
| 大列表 | 分页功能 + 10 万项性能测试 |
| 批量动作 | 上限、剩余项、重复执行、性能 |
| 随机掉落 | 注入随机源的确定性测试 |
| 存档字段 | 旧数据迁移 + Store 加载测试 |
| 内容数据 | `validate:data` 扩展 |
| Electron 路径 | 构建后手动创建/读取存档 |

## 失败处理

- 先独立运行失败文件，确认是稳定失败还是资源竞争。
- 类型错误先修根因，不用 `as any` 或关闭检查绕过。
- 性能退化先分析算法复杂度和重复全量扫描。
- 构建失败查看完整输出；双击构建则查看 `build-exe.log`。
- 修复后必须重新运行受影响测试和最终全量门禁。

## 提交前检查

- [ ] 新规则有功能测试。
- [ ] 大数量路径有性能测试。
- [ ] 存档变化有旧数据迁移测试。
- [ ] 数据变化通过 `validate:data`。
- [ ] 类型检查和 lint 通过。
- [ ] 全量测试稳定通过。
- [ ] Web 构建通过。
- [ ] Electron 相关改动完成桌面构建和启动验证。
- [ ] `git diff --check` 无空白错误。
