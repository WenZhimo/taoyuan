# Repository Guidelines

## 适用范围

本文件记录长期适用于本项目的 Agent 规则。具体玩法数值、单次修复目标和临时操作不属于长期约束；开始工作前应先阅读相关代码、测试及 `docs-source/refactor-plan.md`，并以现有实现和用户最新要求为准。

## 项目结构与编码规范

- `src/components/` 放 Vue UI，`src/views/` 放页面，`src/composables/` 放可复用交互逻辑，`src/domain/` 放纯业务规则，`src/stores/` 放 Pinia 状态，`src/data/` 放静态游戏数据。
- 测试位于 `src/tests/<area>/`，文件名使用 `*.test.ts`。Electron 入口在 `electron/`，文档源文件在 `docs-source/`。
- 使用 Vue 3、TypeScript、两空格缩进和无分号风格；组件使用 PascalCase，组合式函数使用 `useXxx`，源码导入优先使用 `@/`。
- UI 组件只负责展示和交互编排；计算、迁移、批处理等逻辑应放入 domain、store 或 composable，并优先复用现有实现。
- 修改存档结构时必须提供旧存档兼容、默认值或迁移逻辑，不得让已有存档无法读取。
- 注释说明“为什么”，不要复述代码。重大重构应同步更新 `docs-source/refactor-plan.md`。

## 长期性能与体验要求

- 大批量操作必须一次确认后自动分块处理全部目标，定期让出主线程；不得把内部批次大小变成玩家需要反复点击的操作上限。
- 可能明显卡顿的操作必须提供加载动画或进度条、已处理数量，并在适用时支持取消。
- 可能产生大量条目的列表应分页展示，默认每页 50 项，避免一次渲染全部内容。
- 新功能应覆盖其所有合理入口和场景，不能只修复单一页面而留下同类界面行为不一致。

## 禁止事项

- 未经明确要求，不得删除现有文档、功能、测试或用户的未提交改动，也不得进行无关重构。
- 未经明确要求，不得提交、推送、强制覆盖历史或清理工作区。
- Windows 构建只保留未压缩目录版 `pkg/win-unpacked/`；不得重新启用安装包、ZIP 或单 EXE 便携版。
- 打包版设置和存档数据必须保存在程序目录的 `userdata/`，不得回退到 C 盘用户目录。
- 不得用静默截断、硬编码上限或清零方式掩盖性能和数据问题。

## 构建与测试命令

- `pnpm dev`：启动开发服务器。
- `pnpm run type-check`：TypeScript/Vue 类型检查。
- `pnpm run lint`：ESLint 检查。
- `pnpm run validate:data`：校验游戏数据。
- `pnpm run validate:docs`：校验文档与数据一致性。
- `pnpm test`：运行完整 Vitest 测试。
- `pnpm build`：构建 Web 生产版本。
- `pnpm build:electron`：构建 Windows 未压缩版。
- `build-exe.bat`：双击构建入口；必须显示阶段进度，并将错误写入 `build-exe.log`。

## 完成标准

- 针对改动添加或更新回归测试，先运行相关测试，再运行类型检查、Lint、数据校验、文档校验和完整测试。
- 涉及前端构建时执行 `pnpm build`；涉及桌面端、存档路径或 Electron 时执行 `pnpm build:electron` 或 `build-exe.bat`。
- 桌面端改动不能只确认“打包成功”：必须实际启动 `pkg/win-unpacked/taoyuan.exe` 做烟雾测试，并验证关键流程、存档读写位置和错误日志。
- 性能改动必须使用大规模数据验证，并确认界面持续响应、进度反馈有效、结果完整且不会重复结算。
- 结束前执行 `git diff --check`，检查无意修改和错误文件；无法完成的测试或人工验证必须明确说明。
- Commit 使用 `feat:`、`fix:`、`refactor:`、`test:`、`docs:`、`chore:` 等 Conventional Commits 前缀，并保持单一逻辑职责。
