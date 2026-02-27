#!/bin/bash
# 碳市场行情监测系统 - 部署脚本
# 在本地执行此脚本完成部署

set -e

echo "================================"
echo "碳市场行情监测系统 - 部署脚本"
echo "================================"
echo ""

# 检查是否已配置 Git
git config --global user.email "carbon@monitor.local" 2>/dev/null || true
git config --global user.name "Carbon Monitor" 2>/dev/null || true

# 进入项目目录
cd "$(dirname "$0")"

echo "步骤 1/4: 检查 GitHub 仓库..."
REPO_URL="https://github.com/liujunyang666/carbon-market-blog"
if curl -s -o /dev/null -w "%{http_code}" "$REPO_URL" | grep -q "200"; then
    echo "  ✓ 仓库已存在"
else
    echo "  ✗ 仓库不存在，请在 GitHub 手动创建"
    echo "    访问: https://github.com/new"
    echo "    仓库名: carbon-market-blog"
    echo "    设为 Public"
    exit 1
fi

echo ""
echo "步骤 2/4: 配置远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/liujunyang666/carbon-market-blog.git
echo "  ✓ 远程仓库已配置"

echo ""
echo "步骤 3/4: 推送代码..."
git branch -M main
git push -u origin main --force
echo "  ✓ 代码已推送"

echo ""
echo "步骤 4/4: 启用 GitHub Pages..."
echo "  请手动完成以下步骤:"
echo "  1. 访问: https://github.com/liujunyang666/carbon-market-blog/settings/pages"
echo "  2. Source 选择 'Deploy from a branch'"
echo "  3. Branch 选择 'main'，文件夹选择 '/docs'"
echo "  4. 点击 Save"
echo ""

echo "================================"
echo "部署完成!"
echo "================================"
echo ""
echo "访问地址: https://liujunyang666.github.io/carbon-market-blog/"
echo ""
echo "数据更新: 工作日 15:30 自动执行"
echo "手动触发: https://github.com/liujunyang666/carbon-market-blog/actions"
echo ""

read -p "按 Enter 键退出..."
