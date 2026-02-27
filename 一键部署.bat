@echo off
chcp 65001 > nul
echo ================================================
echo  中国碳市场行情监测系统 - 一键部署工具
echo ================================================
echo.
echo 正在检查环境...

where git > nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装 Git
    echo 下载地址: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [OK] Git 已安装

echo.
echo 步骤 1: 配置 Git 用户信息
git config --global user.email "carbon@monitor.local" 2> nul
git config --global user.name "Carbon Monitor" 2> nul

echo.
echo 步骤 2: 初始化本地仓库
cd /d "%~dp0"
git init
git add .
git commit -m "Initial commit" 2> nul || echo 已提交过

echo.
echo 步骤 3: 连接远程仓库
echo 请确保你已在 GitHub 创建名为 carbon-market-blog 的公开仓库
echo.
set /p username="请输入你的 GitHub 用户名: "

git remote remove origin 2> nul
git remote add origin https://github.com/%username%/carbon-market-blog.git

echo.
echo 步骤 4: 推送代码到 GitHub
echo 首次推送需要登录 GitHub，请在弹出的窗口中授权...
git branch -M main
git push -u origin main

echo.
echo ================================================
echo  代码推送完成！
echo ================================================
echo.
echo 最后一步: 启用 GitHub Pages
echo 1. 访问: https://github.com/%username%/carbon-market-blog/settings/pages
echo 2. Source 选择 "Deploy from a branch"
echo 3. Branch 选择 "main"，文件夹选择 "/docs"
echo 4. 点击 Save
echo.
echo 等待 2-3 分钟后，访问:
echo https://%username%.github.io/carbon-market-blog/
echo.
pause
