# 中国碳市场行情监测系统

个人动态博客，自动抓取每日 CEA 与 CCER 行情数据，可视化展示。

## 在线访问

部署后访问：`https://[你的GitHub用户名].github.io/carbon-market-blog/`

## 数据来源

| 市场 | 来源 | 链接 |
|------|------|------|
| CEA | 上海环境能源交易所 | https://www.ccn.ac.cn/cets |
| CCER | 北京绿色交易所 | https://www.ccn.ac.cn/cets |

## 项目结构

```
.
├── data/                      # 数据文件（自动更新）
│   ├── cea_history.csv       # CEA 历史行情
│   ├── ccer_history.csv      # CCER 历史行情
│   └── last_fetch.json       # 元数据
├── scripts/
│   ├── fetch_carbon_data.py  # 每日数据抓取
│   └── fetch_historical_data.py  # 历史数据回填
├── .github/workflows/
│   └── daily_fetch.yml       # 定时任务（工作日15:30）
├── docs/
│   └── index.html            # 可视化页面（GitHub Pages）
└── README.md
```

## 部署步骤

### 1. 创建 GitHub 仓库

在 GitHub 新建仓库 `carbon-market-blog`，设为 Public。

### 2. 上传代码

```bash
cd carbon-market-blog
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[用户名]/carbon-market-blog.git
git push -u origin main
```

### 3. 启用 GitHub Pages

- 进入仓库 Settings → Pages
- Source 选择 "Deploy from a branch"
- Branch 选择 "main"，文件夹选择 "/docs"
- 保存后等待几分钟，访问 `https://[用户名].github.io/carbon-market-blog/`

### 4. 验证自动化

- 进入 Actions 标签页，确认 workflows 已启用
- 可手动触发 "Daily Carbon Market Data Fetch" 测试

## 数据更新机制

| 触发条件 | 时间 | 行为 |
|----------|------|------|
| 定时任务 | 工作日 15:30 UTC+8 | 自动抓取并提交 |
| 手动触发 | 任意时间 | Actions 页面点击 "Run workflow" |
| 本地执行 | 开发调试 | `python scripts/fetch_carbon_data.py` |

## 历史数据覆盖范围

| 数据类型 | 起始日期 | 记录数 |
|----------|----------|--------|
| CEA | 2025-10-09 | 60+ |
| CCER | 2024-01-22 | 204+ |

## 本地开发

```bash
# 安装依赖
pip install requests beautifulsoup4

# 抓取历史数据
python scripts/fetch_historical_data.py

# 抓取今日数据
python scripts/fetch_carbon_data.py

# 启动本地服务器预览
cd docs && python -m http.server 8000
# 访问 http://localhost:8000
```

## 数据字段说明

**CEA**
- date: 交易日期
- 开盘/最高/最低/收盘: 成交量加权平均价格（元/吨）
- 涨跌幅: 较前一日变化百分比
- source: 数据来源页面 URL
- source_name: 数据来源机构

**CCER**
- date: 交易日期
- 成交量: 当日总成交量（吨）
- 成交额: 当日总成交额（元）
- 均价: 加权平均价格（元/吨）
- 涨跌幅: 较前一日变化百分比
- source: 数据来源页面 URL
- source_name: 数据来源机构

## 容错机制

- 当日数据未更新时，页面自动显示最新可用数据并标注日期
- 网络失败时，前端使用内嵌示例数据确保页面可渲染
- 每个数据点附带来源链接，可一键跳转原文核查

## 扩展计划

- [ ] 补充 2025年1-9月 CEA 历史数据（探测更多月度页面）
- [ ] 添加成交量走势图
- [ ] 添加价格区间统计（最高/最低/平均）
- [ ] 添加同比/环比分析文字
