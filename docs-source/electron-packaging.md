# Windows Electron 打包与数据路径

当前桌面端只输出 Windows 未压缩目录版，不生成安装包、ZIP 或单 EXE 便携版。

## 当前构建产物

前端构建：

```text
docs/
```

Electron 主进程与 preload：

```text
dist-electron/main.js
dist-electron/preload.js
```

Windows 未压缩应用：

```text
pkg/win-unpacked/
pkg/win-unpacked/taoyuan.exe
```

`package.json` 的关键配置：

- `asar: false`
- `directories.output: "pkg"`
- Windows target 只有 `dir`
- 可执行文件名为 `taoyuan`

## 构建方式

命令行：

```bash
pnpm run build:electron
```

Windows 双击：

```text
build-exe.bat
```

双击脚本会调用 `scripts/build-exe.ps1`，执行：

1. 检查 Node.js 和 pnpm。
2. 缺少 `node_modules` 时安装依赖。
3. TypeScript 类型检查。
4. 构建 Vite 前端到 `docs/`。
5. 用 esbuild 构建 Electron main/preload。
6. 清理旧 `pkg/` 内容并调用 `electron-builder --win dir`。

完整日志写入项目根目录的 `build-exe.log`。

## 如何分发和运行

- 分发整个 `pkg/win-unpacked/` 文件夹。
- 玩家运行其中的 `taoyuan.exe`。
- 不要只复制 EXE；同目录的 DLL、resources、locales 和其他运行时文件都是必需的。
- 如需压缩传输，可以在构建完成后手动压缩整个 `win-unpacked` 文件夹；构建脚本本身不生成 ZIP。

## 数据保存位置

正式版启动时，`electron/main.js` 会在创建窗口前配置用户数据目录：

```text
<taoyuan.exe 所在目录>/userdata/
```

其中主要包含：

- Chromium `Local Storage`，游戏存档位于其中。
- `settings.json`，保存关闭到托盘、开机启动等桌面设置。

开发模式不修改 Electron 默认 `userData` 路径。

### 旧数据迁移

正式版切换到本地 `userdata/` 时，会尝试从系统默认用户目录复制：

```text
Local Storage/
settings.json
```

仅当目标项不存在时复制，不覆盖已经存在的本地数据。

### 回退行为

如果程序目录无法创建或写入 `userdata/`：

- 主进程会记录错误。
- 应用继续使用 Electron 默认用户数据目录。
- 在 Windows 上，这通常位于用户的 AppData 范围，因此仍可能写入 C 盘。

因此“完全不写 C 盘”的前提是：

1. `win-unpacked` 位于当前用户可写目录。
2. `userdata/` 能成功创建和写入。
3. 不要把程序放在需要管理员权限的受保护目录。

上述保证只针对本项目配置的 Electron `userData` 和 `settings.json`。Windows、Chromium、杀毒软件或开机启动功能仍可能使用系统临时目录、注册表或其他系统位置，不能把它理解为操作系统层面的绝对零写入。

## 为什么不再生成单 EXE

单 EXE 便携目标通常需要先把 Electron 运行时和应用资源解压到临时目录。该项目资源和 Chromium 运行时较大，可能导致：

- 首次启动等待很久。
- 杀毒软件重复扫描解压文件。
- 每次启动产生额外磁盘 IO。
- 相邻数据目录和真实运行目录不一致。
- 故障时难以判断程序仍在解压还是已经卡死。

未压缩目录版直接从现有文件启动，启动路径稳定，也更适合把 `userdata/` 放在可执行文件旁。

## 构建耗时

耗时主要来自：

- 首次下载 Electron 运行时和 electron-builder 依赖。
- Vite 同时输出现代和 legacy 资源。
- 大型 `useGameStore` 相关 chunk 的转换和压缩。
- electron-builder 复制完整 Chromium 运行时。
- 杀毒软件扫描 `pkg/win-unpacked`。

构建脚本配置了 Electron 国内镜像。第一次仍可能需要数分钟，后续通常会使用缓存。

## 常见故障

### 清理 `pkg` 失败

通常是旧版游戏仍在运行并占用文件。完全退出 `taoyuan.exe` 后重试。

### 窗口长时间没有新提示

查看 `build-exe.log` 的最后几行，确认当前停在依赖下载、Vite 构建还是 electron-builder。

### 只复制 EXE 后无法启动

恢复完整 `win-unpacked` 文件夹。目录版不是单文件程序。

### 存档仍出现在系统用户目录

检查：

- 程序目录是否可写。
- 是否成功创建 `userdata/`。
- 控制台或日志中是否出现 `Failed to use local user data path`。

## 发布前验证

1. `pnpm run type-check`
2. `pnpm run lint`
3. `pnpm exec vitest run --reporter=dot --maxWorkers=2`
4. `pnpm run build:electron`
5. 启动 `pkg/win-unpacked/taoyuan.exe`
6. 新建并读取存档
7. 退出后确认 `userdata/` 已生成
8. 再次启动确认存档可读
9. 验证设置、托盘退出和开机启动选项
10. 在干净目录复制整个 `win-unpacked` 后再次启动

存档字段兼容规则见 [存档兼容约定](./save-compatibility.md)。
