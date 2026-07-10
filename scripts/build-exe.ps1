$ErrorActionPreference = 'Stop'

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogPath = Join-Path $ProjectRoot 'build-exe.log'
$PackageDir = Join-Path $ProjectRoot 'pkg'
$PackagedUserDataPath = Join-Path $PackageDir 'win-unpacked\userdata'
$BuildStateDir = Join-Path $ProjectRoot '.build-state'
$UserDataBackupPath = Join-Path $BuildStateDir 'win-unpacked-userdata'
$script:ShouldRestoreUserData = $false

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

function Assert-ProjectPath {
  param(
    [string] $Path,
    [string] $Description
  )

  $resolvedRoot = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\') + '\'
  $resolvedPath = [System.IO.Path]::GetFullPath($Path)
  if (-not $resolvedPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to use $Description outside project: $resolvedPath"
  }
}

function Get-DirectoryStats {
  param([string] $Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return [pscustomobject]@{ Files = 0; Bytes = 0L }
  }

  $files = @(Get-ChildItem -LiteralPath $Path -Recurse -Force -File -ErrorAction Stop)
  $bytes = ($files | Measure-Object -Property Length -Sum).Sum
  if ($null -eq $bytes) {
    $bytes = 0L
  }
  return [pscustomobject]@{ Files = $files.Count; Bytes = [long] $bytes }
}

function Backup-PackagedUserData {
  Assert-ProjectPath $PackagedUserDataPath 'packaged user data'
  Assert-ProjectPath $UserDataBackupPath 'user data backup'

  if (Test-Path -LiteralPath $PackagedUserDataPath) {
    New-Item -ItemType Directory -Path $BuildStateDir -Force | Out-Null
    if (Test-Path -LiteralPath $UserDataBackupPath) {
      Remove-Item -LiteralPath $UserDataBackupPath -Recurse -Force
    }

    Copy-Item -LiteralPath $PackagedUserDataPath -Destination $UserDataBackupPath -Recurse -Force
    $script:ShouldRestoreUserData = $true
    $stats = Get-DirectoryStats $UserDataBackupPath
    $message = "Backed up packaged user data: $($stats.Files) files, $($stats.Bytes) bytes."
    Write-Host $message -ForegroundColor Green
    Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value $message
    return
  }

  if (Test-Path -LiteralPath $UserDataBackupPath) {
    $script:ShouldRestoreUserData = $true
    Write-Host "Using user data backup left by a previous interrupted build: $UserDataBackupPath" -ForegroundColor Yellow
    Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "Using existing user data backup: $UserDataBackupPath"
    return
  }

  Write-Host 'No packaged user data found; nothing to preserve.'
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value 'No packaged user data found; nothing to preserve.'
}

function Restore-PackagedUserData {
  param([switch] $KeepBackup)

  if (-not $script:ShouldRestoreUserData -or -not (Test-Path -LiteralPath $UserDataBackupPath)) {
    return
  }

  Assert-ProjectPath $PackagedUserDataPath 'packaged user data'
  Assert-ProjectPath $UserDataBackupPath 'user data backup'

  $backupStats = Get-DirectoryStats $UserDataBackupPath
  $targetParent = Split-Path -Parent $PackagedUserDataPath
  New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
  if (Test-Path -LiteralPath $PackagedUserDataPath) {
    Remove-Item -LiteralPath $PackagedUserDataPath -Recurse -Force
  }
  Copy-Item -LiteralPath $UserDataBackupPath -Destination $PackagedUserDataPath -Recurse -Force

  $restoredStats = Get-DirectoryStats $PackagedUserDataPath
  if ($restoredStats.Files -ne $backupStats.Files -or $restoredStats.Bytes -ne $backupStats.Bytes) {
    throw "User data restore verification failed. Backup remains at: $UserDataBackupPath"
  }

  $message = "Restored packaged user data: $($restoredStats.Files) files, $($restoredStats.Bytes) bytes."
  Write-Host $message -ForegroundColor Green
  Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value $message

  if (-not $KeepBackup) {
    Remove-Item -LiteralPath $UserDataBackupPath -Recurse -Force
    if ((Test-Path -LiteralPath $BuildStateDir) -and -not (Get-ChildItem -LiteralPath $BuildStateDir -Force)) {
      Remove-Item -LiteralPath $BuildStateDir -Force
    }
    $script:ShouldRestoreUserData = $false
  }
}

function Clear-PackageOutput {
  if (-not (Test-Path -LiteralPath $PackageDir)) {
    return
  }

  Assert-ProjectPath $PackageDir 'package output'

  try {
    Get-ChildItem -LiteralPath $PackageDir -Force | Remove-Item -Recurse -Force -ErrorAction Stop
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
    Write-Step '[1/7] Installing dependencies...'
    Invoke-BuildCommand 'pnpm' @('install')
  } else {
    Write-Step '[1/7] node_modules found, skipping install.'
  }

  Write-Step '[2/7] Running TypeScript type check...'
  Invoke-BuildCommand 'pnpm' @('exec', 'vue-tsc', '-b')

  Write-Step '[3/7] Building frontend assets...'
  Invoke-BuildCommand 'pnpm' @('exec', 'vite', 'build')

  Write-Step '[4/7] Building Electron files...'
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

  Write-Step '[5/7] Backing up packaged user data...'
  Backup-PackagedUserData

  Write-Step '[6/7] Cleaning previous package output...'
  Clear-PackageOutput

  Write-Step '[7/7] Packaging Windows unpacked app...'
  Write-Host 'Downloading Electron runtime may take several minutes the first time.'
  Write-Host "Electron mirror: $env:ELECTRON_MIRROR"
  Invoke-BuildCommand 'pnpm' @('exec', 'electron-builder', '--win', 'dir')

  Write-Step '[Restore] Restoring packaged user data...'
  Restore-PackagedUserData

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
  if ($script:ShouldRestoreUserData) {
    try {
      Write-Host ''
      Write-Host 'Attempting to restore packaged user data after build failure...' -ForegroundColor Yellow
      Restore-PackagedUserData -KeepBackup
      Write-Host "A safety backup was kept at: $UserDataBackupPath" -ForegroundColor Yellow
    } catch {
      Add-Content -LiteralPath $LogPath -Encoding UTF8 -Value "USER DATA RESTORE ERROR: $($_.Exception.Message)"
      Write-Host "WARNING: Automatic user data restore failed. Backup remains at: $UserDataBackupPath" -ForegroundColor Red
    }
  }

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
