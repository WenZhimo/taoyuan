# 桃源乡 二次开发版

> 原版项目：[setube/taoyuan](https://github.com/setube/taoyuan)
>
> 本仓库基于原版《桃源乡》二次开发而来，保留原作的核心玩法、素材风格与技术基础，并在此基础上进行功能扩展、体验优化、桌面端适配和本地化维护。原作者与原项目版权归属仍以原版仓库和 `LICENSE` 文件为准。

《桃源乡》是一款文字版田园模拟经营游戏，灵感来自星露谷物语，采用像素风与中国风视觉设计。玩家可以经营农场、饲养动物、钓鱼、下矿、烹饪、加工、送礼、完成任务，并逐步扩展自己的村庄生活。

## 本仓库改动方向

本二次开发版主要围绕以下方向维护：

- 优化桌面端体验，支持 Windows 未压缩目录版打包。
- 调整存档读写位置，使桌面版数据保存到程序目录 `userdata/`。
- 改进大存档导入、保存、导出时的性能与反馈。
- 优化大批量种植、农田、温室、加工、鱼塘、酒窖、牲口棚等大量数据场景。
- 增加分页、进度反馈、批量操作和一键操作等便利功能。
- 扩展背包、仓库、商店、送礼等界面的物品展示与操作体验。
- 修复若干原版中影响游戏流程或桌面端使用的问题。

## 主要特性

- **田园经营**：种植作物、施肥浇水、扩展农田、建设温室，经营四季农场。
- **畜牧养殖**：饲养多种动物，管理鸡舍、牧场、牲口棚等设施。
- **钓鱼与鱼塘**：在不同地点钓鱼，建设鱼塘并养殖鱼苗。
- **矿洞与资源副本**：探索矿洞、瀚海等区域，采集资源并进行战斗。
- **加工与烹饪**：使用加工设备、酒坊、灶台等生产食物与加工品。
- **NPC 社交**：与村民聊天、送礼、提升好感度并触发事件。
- **装备与附魔**：收集装备、强化属性，并查看附魔详情。
- **存档管理**：支持本地存档、导入导出和桌面版程序目录数据保存。

## 二次开发版体验改动

- 同种物品可合并显示，不同品质数量按品质颜色分别标注。
- 大量列表项默认分页显示，减少一次性渲染造成的卡顿。
- 大批量操作会分块处理，并提供进度或加载反馈。
- 商店购买上限、设施容量、批量种植、加工流程等做了便利化调整。
- 桌面版构建只保留 Windows 未压缩目录版输出。
- 打包版设置与存档数据保存在程序目录下，避免写入 C 盘用户目录。

## 快速开始

### 环境要求

- Node.js
- pnpm

建议使用项目锁定依赖安装，不要混用 npm、yarn 和 pnpm。

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

启动后按终端提示访问本地地址，一般为：

```text
http://localhost:5173
```

### Web 生产构建

```bash
pnpm build
```

### 预览 Web 构建结果

```bash
pnpm preview
```

## Windows 桌面版打包

本仓库当前只保留 Windows 未压缩目录版输出，不再导出安装包、ZIP 或单 EXE 便携版。

### 命令行构建

```bash
pnpm build:electron
```

构建产物位于：

```text
pkg/win-unpacked/
```

启动程序：

```text
pkg/win-unpacked/taoyuan.exe
```

### 双击脚本构建

也可以直接双击：

```text
build-exe.bat
```

脚本会显示阶段进度，并将构建日志写入：

```text
build-exe.log
```

## 桌面版数据位置

桌面版的设置和存档数据保存在程序目录：

```text
userdata/
```

重新打包时请避免删除玩家正在使用的 `userdata/` 目录。若需要分发新版程序，建议只替换程序文件，保留原有 `userdata/`。

## 常用命令

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm run type-check

# ESLint 检查
pnpm run lint

# 校验游戏数据
pnpm run validate:data

# 校验文档与数据一致性
pnpm run validate:docs

# 运行完整测试
pnpm test

# 构建 Web 版本
pnpm build

# 构建 Windows 未压缩目录版
pnpm build:electron
```

## 项目结构

```text
src/
├─ components/       游戏 UI 组件
├─ views/            页面级视图
├─ composables/      可复用交互逻辑
├─ domain/           纯业务规则
├─ stores/           Pinia 状态
├─ data/             静态游戏数据
├─ tests/            Vitest 测试
├─ types/            TypeScript 类型定义
├─ utils/            通用工具
└─ workers/          Web Worker

electron/            Electron 入口
scripts/             构建脚本
docs-source/         文档源文件
pkg/                 桌面端构建输出
```

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Vitest
- Electron
- Tone.js
- Capacitor

## 开发注意事项

- 修改玩法数据后，建议运行 `pnpm run validate:data` 和相关测试。
- 修改文档或数据映射后，建议运行 `pnpm run validate:docs`。
- 修改存档结构时必须保持旧存档兼容，提供默认值或迁移逻辑。
- 大批量操作应自动分块处理全部目标，不应让玩家反复点击内部批次。
- 可能产生大量条目的列表应分页展示，默认每页 50 项。
- 涉及桌面端、存档路径或 Electron 的改动，需要实际启动 `pkg/win-unpacked/taoyuan.exe` 做烟雾测试。

## 截图

![游戏截图 1](images/1.png)

![游戏截图 2](images/2.png)

## 原版项目

本仓库不是原版官方仓库。若你想查看原始实现、提交 issue 给原作者，或了解原版发布信息，请访问：

- GitHub：[setube/taoyuan](https://github.com/setube/taoyuan)
- TapTap：[桃源乡](https://www.taptap.cn/app/816558)

## 许可

本项目沿用原项目许可协议。请查看 [LICENSE](LICENSE) 文件，并遵守原作者关于非商业使用、署名和演绎作品的要求。
