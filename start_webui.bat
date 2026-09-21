@echo off
chcp 65001 >nul
cd /d "%~dp0"
title DouK-Downloader Web UI

if not exist "venv\Scripts\python.exe" (
    echo [错误] 未找到虚拟环境，请先执行:
    echo    python -m venv venv
    echo    venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo 正在启动 Web UI 服务器...
echo 启动后请在浏览器打开: http://127.0.0.1:8000
echo 按 Ctrl+C 退出服务
echo.
"venv\Scripts\python.exe" web_server.py
pause