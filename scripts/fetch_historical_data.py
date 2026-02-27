import requests
from bs4 import BeautifulSoup
import csv
import os
import re
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# CEA 月度页面映射（需要逐步探测完整映射）
CEA_MONTHLY_PAGES = {
    (2025, 12): 'https://www.ccn.ac.cn/carbon-market/carbon-emissions-trading/ceadate/7854.html',
    (2025, 11): 'https://www.ccn.ac.cn/carbon-market/carbon-emissions-trading/ceadate/7753.html',
    (2025, 10): 'https://www.ccn.ac.cn/carbon-market/carbon-emissions-trading/ceadate/7695.html',
}

# CCER 年度数据页面
CCER_YEARLY_PAGE = 'https://www.ccn.ac.cn/carbon-market/ccer/ccerdate/219.html'

def parse_cea_monthly(url, year, month):
    """解析 CEA 月度数据页面"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        tables = soup.find_all('table')
        
        daily_data = {}
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
            
            # 检查表头
            header_cells = rows[0].find_all(['th', 'td'])
            headers = [cell.get_text(strip=True) for cell in header_cells]
            
            if '时间' not in headers and '时间' not in ' '.join(headers):
                continue
            if not any('收盘' in h or '开盘' in h for h in headers):
                continue
            
            # 提取数据行
            for row in rows[1:]:
                cells = row.find_all('td')
                if len(cells) < 6:
                    continue
                
                row_data = {}
                for i, cell in enumerate(cells):
                    if i < len(headers):
                        row_data[headers[i]] = cell.get_text(strip=True).replace(',', '')
                
                date_str = row_data.get('时间', '')
                if not date_str:
                    continue
                
                # 标准化日期格式
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            y, m, d = parts
                            normalized_date = f"{y}-{int(m):02d}-{int(d):02d}"
                        else:
                            continue
                    else:
                        continue
                    
                    if normalized_date not in daily_data:
                        daily_data[normalized_date] = {
                            'date': normalized_date,
                            '开盘': [], '最高': [], '最低': [], '收盘': [],
                            '涨跌幅度': [], '成交量': [], '成交额': [],
                            'source': url,
                            'source_name': '上海环境能源交易所'
                        }
                    
                    # 收集各配额年度的数据
                    field_mapping = {
                        '开盘': '开盘（元）',
                        '最高': '最高（元）',
                        '最低': '最低（元）',
                        '收盘': '收盘（元）',
                        '涨跌幅度': '涨跌幅度（%）',
                        '成交量': '成交量（吨）',
                        '成交额': '成交额（元）'
                    }
                    for field_key, field_name in field_mapping.items():
                        val = row_data.get(field_name, '').replace('%', '')
                        if val and val not in ['——', '-', '']:
                            try:
                                daily_data[normalized_date][field_key].append(float(val))
                            except:
                                pass
                    
                except Exception as e:
                    logger.warning(f"日期解析失败: {date_str}, 错误: {e}")
                    continue
        
        # 聚合各配额年度数据（成交量加权平均）
        results = []
        for date, data in sorted(daily_data.items()):
            if data['收盘'] and data['成交量']:
                # 计算成交量加权的综合价格
                total_volume = sum(data['成交量'])
                if total_volume > 0:
                    weighted_close = sum(c * v for c, v in zip(data['收盘'], data['成交量'])) / total_volume
                    weighted_open = sum(o * v for o, v in zip(data['开盘'], data['成交量'])) / total_volume if data['开盘'] else weighted_close
                    weighted_high = max(data['最高']) if data['最高'] else weighted_close
                    weighted_low = min(data['最低']) if data['最低'] else weighted_close
                    
                    # 涨跌幅取成交量加权平均
                    changes = data.get('涨跌幅度', [])
                    avg_change = sum(c * v for c, v in zip(changes, data['成交量'])) / total_volume if changes else 0
                    
                    results.append({
                        'date': date,
                        '开盘': round(weighted_open, 2),
                        '最高': round(weighted_high, 2),
                        '最低': round(weighted_low, 2),
                        '收盘': round(weighted_close, 2),
                        '涨跌幅': round(avg_change, 2),
                        'source': url,
                        'source_name': '上海环境能源交易所'
                    })
        
        return results
        
    except Exception as e:
        logger.error(f"解析 CEA 月度页面失败 {url}: {e}")
        return []

def parse_ccer_yearly(url):
    """解析 CCER 年度数据页面"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        tables = soup.find_all('table')
        
        results = []
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
            
            headers = [cell.get_text(strip=True) for cell in rows[0].find_all(['th', 'td'])]
            headers_str = ' '.join(headers)
            
            if '时间' not in headers_str or '均价' not in headers_str:
                continue
            
            for row in rows[1:]:
                cells = row.find_all('td')
                if len(cells) < 4:
                    continue
                
                row_data = {}
                for i, cell in enumerate(cells):
                    if i < len(headers):
                        row_data[headers[i]] = cell.get_text(strip=True).replace(',', '')
                
                date_str = row_data.get('时间', '')
                if not date_str:
                    continue
                
                try:
                    if '/' in date_str:
                        parts = date_str.split('/')
                        if len(parts) == 3:
                            y, m, d = parts
                            normalized_date = f"{y}-{int(m):02d}-{int(d):02d}"
                        else:
                            continue
                    else:
                        continue
                    
                    # 提取数值 - 处理带千分位逗号的数字
                    volume = row_data.get('总成交量（吨）', row_data.get('成交量（吨）', '')).replace('——', '').replace(',', '')
                    amount = row_data.get('成交额（元）', '').replace('——', '').replace(',', '')
                    price = row_data.get('均价（元/吨）', '').replace('——', '').replace(',', '')
                    change = row_data.get('涨跌幅（%）', '').replace('——', '').replace('%', '')
                    
                    results.append({
                        'date': normalized_date,
                        '成交量': volume if volume else '',
                        '成交额': amount if amount else '',
                        '均价': price if price else '',
                        '涨跌幅': change if change else '0',
                        'source': url,
                        'source_name': '北京绿色交易所'
                    })
                    
                except Exception as e:
                    logger.warning(f"CCER 日期解析失败: {date_str}, 错误: {e}")
                    continue
        
        return results
        
    except Exception as e:
        logger.error(f"解析 CCER 年度页面失败 {url}: {e}")
        return []

def save_to_csv(data, filename, fields):
    """保存数据到 CSV"""
    os.makedirs(DATA_DIR, exist_ok=True)
    filepath = os.path.join(DATA_DIR, filename)
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in data:
            writer.writerow({k: row.get(k, '') for k in fields})
    
    logger.info(f"已保存 {len(data)} 条记录到 {filepath}")

def main():
    """主函数：回填历史数据"""
    logger.info("开始回填历史数据...")
    
    # 1. 抓取 CEA 历史数据
    cea_all_data = []
    for (year, month), url in CEA_MONTHLY_PAGES.items():
        logger.info(f"抓取 CEA {year}年{month}月数据...")
        data = parse_cea_monthly(url, year, month)
        cea_all_data.extend(data)
        logger.info(f"  获取 {len(data)} 条记录")
    
    # 按日期排序
    cea_all_data.sort(key=lambda x: x['date'])
    
    # 保存 CEA 数据
    cea_fields = ['date', '开盘', '最高', '最低', '收盘', '涨跌幅', 'source', 'source_name']
    save_to_csv(cea_all_data, 'cea_history.csv', cea_fields)
    
    # 2. 抓取 CCER 历史数据
    logger.info("抓取 CCER 历史数据...")
    ccer_data = parse_ccer_yearly(CCER_YEARLY_PAGE)
    ccer_data.sort(key=lambda x: x['date'])
    
    # 保存 CCER 数据
    ccer_fields = ['date', '成交量', '成交额', '均价', '涨跌幅', 'source', 'source_name']
    save_to_csv(ccer_data, 'ccer_history.csv', ccer_fields)
    
    logger.info(f"CCER 数据: {len(ccer_data)} 条记录")
    logger.info("历史数据回填完成")

if __name__ == '__main__':
    main()
