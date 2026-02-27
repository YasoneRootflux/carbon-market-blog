#!/bin/bash
# 中国碳市场行情监测系统 - Mac/Linux 一键部署

echo "================================================"
echo "  中国碳市场行情监测系统 - 一键部署工具"
echo "================================================"
echo ""

# 检查 Git
if ! command -v git &> /dev/null; then
    echo "[错误] 未检测到 Git，请先安装:"
    echo "  Mac: brew install git"
    echo "  Linux: sudo apt install git"
    exit 1
fi

echo "[OK] Git 已安装"

# 配置 Git
git config --global user.email "carbon@monitor.local" 2> /dev/null || true
git config --global user.name "Carbon Monitor" 2> /dev/null || true

# 进入目录
cd "$(dirname "$0")"

echo ""
echo "步骤 1: 初始化本地仓库"
git init
git add .
git commit -m "Initial commit" 2> /dev/null || echo "已提交过"

echo ""
echo "步骤 2: 连接远程仓库"
echo "请确保你已在 GitHub 创建名为 carbon-market-blog 的公开仓库"
echo ""
read -p "请输入你的 GitHub 用户名: " username

git remote remove origin 2> /dev/null || true
git remote add origin "https://github.com/${username}/carbon-market-blog.git"

echo ""
echo "步骤 3: 推送代码到 GitHub"
git branch -M main
git push -u origin main

echo ""
echo "================================================"
echo "  代码推送完成！"
echo "================================================"
echo ""
echo "最后一步: 启用 GitHub Pages"
echo "1. 访问: https://github.com/${username}/carbon-market-blog/settings/pages"
echo "2. Source 选择 'Deploy from a branch'"
echo "3. Branch 选择 'main'，文件夹选择 '/docs'"
echo "4. 点击 Save"
echo ""
echo "等待 2-3 分钟后，访问:"
echo "https://${username}.github.io/carbon-market-blog/"
echo ""

read -p "按 Enter 键退出..."
