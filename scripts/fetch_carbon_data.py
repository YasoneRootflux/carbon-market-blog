import requests
from bs4 import BeautifulSoup
import csv
import json
import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
SOURCE_URL = 'https://www.ccn.ac.cn/cets'

def fetch_current_data():
    """抓取当前最新行情数据"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(SOURCE_URL, headers=headers, timeout=30)
        response.encoding = 'utf-8'
        
        if response.status_code != 200:
            logger.error(f"请求失败，状态码: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 提取日期
        date_elem = soup.find(string=lambda x: x and '全国碳市场综合价格行情' in x)
        if not date_elem:
            logger.error("未找到日期元素")
            return None
        
        # 解析日期，格式如 "（2026年2月26日）"
        date_text = date_elem.strip()
        import re
        date_match = re.search(r'（(\d{4})年(\d{1,2})月(\d{1,2})日）', date_text)
        if date_match:
            year, month, day = date_match.groups()
            data_date = f"{year}-{int(month):02d}-{int(day):02d}"
        else:
            data_date = datetime.now().strftime('%Y-%m-%d')
        
        # 提取 CEA 数据
        cea_section = soup.find('h3', string=lambda x: x and '全国碳市场综合价格行情' in x)
        cea_data = {'date': data_date, 'source': SOURCE_URL, 'source_name': '上海环境能源交易所'}
        
        if cea_section:
            table = cea_section.find_next('table')
            if table:
                rows = table.find_all('tr')
                if len(rows) >= 2:
                    headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                    values = [td.get_text(strip=True) for td in rows[1].find_all('td')]
                    
                    for h, v in zip(headers, values):
                        h_clean = h.replace('（元/吨）', '').replace('（%）', '').strip()
                        cea_data[h_clean] = v
        
        # 提取 CCER 数据
        ccer_section = soup.find('h3', string=lambda x: x and '全国温室气体自愿减排交易行情' in x)
        ccer_data = {'date': data_date, 'source': SOURCE_URL, 'source_name': '北京绿色交易所'}
        
        if ccer_section:
            table = ccer_section.find_next('table')
            if table:
                rows = table.find_all('tr')
                if len(rows) >= 2:
                    headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                    values = [td.get_text(strip=True) for td in rows[1].find_all('td')]
                    
                    for h, v in zip(headers, values):
                        h_clean = h.replace('（吨）', '').replace('（元）', '').replace('（元/吨）', '').replace('（%）', '').strip()
                        ccer_data[h_clean] = v
        
        return {
            'date': data_date,
            'cea': cea_data,
            'ccer': ccer_data,
            'fetch_time': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"抓取失败: {e}")
        return None

def get_last_available_data():
    """获取本地最新数据日期"""
    cea_file = os.path.join(DATA_DIR, 'cea_history.csv')
    if os.path.exists(cea_file):
        with open(cea_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if rows:
                return rows[-1]['date']
    return None

def save_data(data):
    """保存数据到 CSV"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 保存 CEA 数据
    cea_file = os.path.join(DATA_DIR, 'cea_history.csv')
    cea_exists = os.path.exists(cea_file)
    
    with open(cea_file, 'a', newline='', encoding='utf-8') as f:
        cea_fields = ['date', '开盘', '最高', '最低', '收盘', '涨跌幅', 'source', 'source_name']
        writer = csv.DictWriter(f, fieldnames=cea_fields)
        if not cea_exists:
            writer.writeheader()
        
        cea_row = {k: data['cea'].get(k, '') for k in cea_fields}
        writer.writerow(cea_row)
    
    # 保存 CCER 数据
    ccer_file = os.path.join(DATA_DIR, 'ccer_history.csv')
    ccer_exists = os.path.exists(ccer_file)
    
    with open(ccer_file, 'a', newline='', encoding='utf-8') as f:
        ccer_fields = ['date', '成交量', '成交额', '均价', '涨跌幅', 'source', 'source_name']
        writer = csv.DictWriter(f, fieldnames=ccer_fields)
        if not ccer_exists:
            writer.writeheader()
        
        ccer_row = {k: data['ccer'].get(k, '') for k in ccer_fields}
        writer.writerow(ccer_row)
    
    # 保存元数据
    meta_file = os.path.join(DATA_DIR, 'last_fetch.json')
    with open(meta_file, 'w', encoding='utf-8') as f:
        json.dump({
            'last_fetch': data['fetch_time'],
            'last_data_date': data['date'],
            'source_url': SOURCE_URL
        }, f, ensure_ascii=False, indent=2)
    
    logger.info(f"数据已保存: {data['date']}")

def main():
    """主函数"""
    logger.info("开始抓取碳市场数据...")
    
    data = fetch_current_data()
    if data:
        save_data(data)
        logger.info(f"成功抓取 {data['date']} 数据")
    else:
        logger.error("抓取失败")
        exit(1)

if __name__ == '__main__':
    main()
