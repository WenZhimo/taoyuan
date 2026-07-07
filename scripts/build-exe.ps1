$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogPath = Join-Path $ProjectRoot 'build-exe.log'

Set-Location $ProjectRoot

# Use mirror URLs to avoid Electron/Electron Builder downloads hanging on GitHub.
$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
$env:npm_config_electron_mirror = $env:ELECTRON_MIRROR
$env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/'

function Write-Step {
  param([string] $Message)
  Write-Host ''
  Write-Host $Message -ForegroundColor Cyan
}

function Invoke-BuildCommand {
  param(
    [string] $Command,
    [string[]] $Arguments
  )

  $display = "$Command $($Arguments -join ' ')"
  Write-Host "> $display"
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "> $display"

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'

  try {
    & $Command @Arguments 2>&1 | ForEach-Object {
      $line = $_.ToString()
      Write-Host $line
      Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value $line
    }

    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($exitCode -ne 0) {
    throw "Command failed with exit code $exitCode`: $display"
  }
}

function Clear-PackageOutput {
  $pkgDir = Join-Path $ProjectRoot 'pkg'
  if (-not (Test-Path -LiteralPath $pkgDir)) {
    return
  }

  $resolvedRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
  $resolvedPkg = [System.IO.Path]::GetFullPath($pkgDir)
  if (-not $resolvedPkg.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clean package output outside project: $resolvedPkg"
  }

  try {
    Get-ChildItem -LiteralPath $pkgDir -Force | Remove-Item -Recurse -Force -ErrorAction Stop
  } catch {
    throw "Failed to clean pkg output. Close any running Taoyuan game window or installer, then try again. Details: $($_.Exception.Message)"
  }
}

try {
  "Taoyuan EXE build started at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Set-Content -LiteralPath $LogPath -Encoding UTF8
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "ProjectRoot: $ProjectRoot"

  Write-Host ''
  Write-Host '========================================' -ForegroundColor Green
  Write-Host ' Taoyuan Windows EXE Build Script' -ForegroundColor Green
  Write-Host '========================================' -ForegroundColor Green
  Write-Host ''

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js was not found. Please install Node.js first: https://nodejs.org/'
  }

  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Step '[Setup] pnpm not found, trying Corepack...'
    if (-not (Get-Command corepack -ErrorAction SilentlyContinue)) {
      throw 'pnpm/corepack was not found. Please run: npm install -g pnpm'
    }
    Invoke-BuildCommand 'corepack' @('enable')
  }

  if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'node_modules'))) {
    Write-Step '[1/6] Installing dependencies...'
    Invoke-BuildCommand 'pnpm' @('install')
  } else {
    Write-Step '[1/6] node_modules found, skipping install.'
  }

  Write-Step '[2/6] Running TypeScript type check...'
  Invoke-BuildCommand 'pnpm' @('exec', 'vue-tsc', '-b')

  Write-Step '[3/6] Building frontend assets...'
  Invoke-BuildCommand 'pnpm' @('exec', 'vite', 'build')

  Write-Step '[4/6] Building Electron files...'
  Invoke-BuildCommand 'pnpm' @(
    'exec', 'esbuild', 'electron/main.js',
    '--bundle',
    '--platform=node',
    '--format=esm',
    '--outfile=dist-electron/main.js',
    '--external:electron'
  )

  Invoke-BuildCommand 'pnpm' @(
    'exec', 'esbuild', 'electron/preload.js',
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--outfile=dist-electron/preload.js',
    '--external:electron'
  )

  Write-Step '[5/6] Cleaning previous package output...'
  Clear-PackageOutput

  Write-Step '[6/6] Packaging Windows unpacked app...'
  Write-Host 'Downloading Electron runtime may take several minutes the first time.'
  Write-Host "Electron mirror: $env:ELECTRON_MIRROR"
  Invoke-BuildCommand 'pnpm' @('exec', 'electron-builder', '--win', 'dir')

  Write-Host ''
  Write-Host '========================================' -ForegroundColor Green
  Write-Host ' Build completed' -ForegroundColor Green
  Write-Host '========================================' -ForegroundColor Green
  Write-Host ''
  Write-Host "Output folder: $(Join-Path $ProjectRoot 'pkg')"

  Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'pkg') -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like '*unpacked*' } |
    ForEach-Object {
      Write-Host "Generated unpacked app: $($_.FullName)" -ForegroundColor Green
      $exePath = Join-Path $_.FullName 'taoyuan.exe'
      if (Test-Path -LiteralPath $exePath) {
        Write-Host "Run: $exePath" -ForegroundColor Green
      }
    }

  exit 0
} catch {
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value ''
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "ERROR: $($_.Exception.Message)"

  Write-Host ''
  Write-Host '========================================' -ForegroundColor Red
  Write-Host ' Build failed' -ForegroundColor Red
  Write-Host '========================================' -ForegroundColor Red
  Write-Host ''
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ''
  Write-Host "Log file: $LogPath"

  exit 1
}
