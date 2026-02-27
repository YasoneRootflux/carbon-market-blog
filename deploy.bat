@echo off
chcp 65001
cls
echo ================================================
echo   中国碳市场行情监测系统 - 一键部署
echo ================================================
echo.
echo [1/4] 检查环境...

where git > nul 2>&1
if %errorlevel% neq 0 (
    echo [X] 未检测到 Git
    echo     请访问 https://git-scm.com/download/win 下载安装
    pause
    exit /b 1
)
echo [OK] Git 已安装

echo.
echo [2/4] 配置 Git...
git config --global user.email "carbon@monitor.local" 2> nul
git config --global user.name "Carbon Monitor" 2> nul
echo [OK] Git 配置完成

echo.
echo [3/4] 准备代码...
cd /d "%~dp0"
git init 2> nul
git add . 2> nul
git commit -m "Initial commit" 2> nul
echo [OK] 代码已准备

echo.
echo [4/4] 推送到 GitHub...
echo.
echo 提示: 请先访问 https://github.com/new 创建仓库
echo 仓库名: carbon-market-blog
echo 选择: Public
echo.
set /p username=请输入你的 GitHub 用户名: 

git remote remove origin 2> nul
git remote add origin https://github.com/%username%/carbon-market-blog.git
git branch -M main 2> nul

echo.
echo 正在推送代码，请稍候...
git push -u origin main

echo.
echo ================================================
echo   推送完成！
echo ================================================
echo.
echo 最后一步：启用 GitHub Pages
echo 1. 访问 https://github.com/%username%/carbon-market-blog/settings/pages
echo 2. Source 选择 Deploy from a branch
echo 3. Branch 选择 main，文件夹选择 /docs
echo 4. 点击 Save
echo.
echo 等待 2-3 分钟后访问:
echo https://%username%.github.io/carbon-market-blog/
echo.
pause
