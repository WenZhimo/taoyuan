@echo off
setlocal
title Taoyuan EXE Builder
cd /d "%~dp0"

echo ========================================
echo  Taoyuan EXE Builder started
echo ========================================
echo.
echo Project: %CD%
echo Log: %CD%\build-exe.log
echo.
echo If this window stays here, the build script is running.
echo Please wait...
echo.

if not exist "%~dp0scripts\build-exe.ps1" (
  echo ERROR: scripts\build-exe.ps1 was not found.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build-exe.ps1"
set "BUILD_EXIT_CODE=%ERRORLEVEL%"

echo.
if "%BUILD_EXIT_CODE%"=="0" (
  echo Build finished successfully.
) else (
  echo Build failed. Please check build-exe.log in this folder.
)
echo.
pause
exit /b %BUILD_EXIT_CODE%
