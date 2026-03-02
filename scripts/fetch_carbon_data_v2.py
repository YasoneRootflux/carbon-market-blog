"""
碳市场数据抓取脚本 v2
数据来源：碳中和网 https://www.ccn.ac.cn/cets
适配2026年页面结构（数据以p标签形式展示，非table）
"""
import requests
from bs4 import BeautifulSoup
import csv
import json
import os
import re
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
SOURCE_URL = 'https://www.ccn.ac.cn/cets'


def fetch_current_data():
    """抓取当前最新行情数据"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(SOURCE_URL, headers=headers, timeout=30)
        response.encoding = 'utf-8'

        if response.status_code != 200:
            logger.error(f"请求失败，状态码: {response.status_code}")
            return None

        soup = BeautifulSoup(response.text, 'html.parser')

        # 找CEA的h3（包含日期的sub标签）
        cea_h3 = None
        for h3 in soup.find_all('h3'):
            if '全国碳市场综合价格行情' in h3.get_text():
                cea_h3 = h3
                break

        if not cea_h3:
            logger.error("未找到CEA行情标题")
            return None

        # 提取日期（从sub标签）
        sub = cea_h3.find('sub')
        data_date = datetime.now().strftime('%Y-%m-%d')
        if sub:
            date_text = sub.get_text()
            date_match = re.search(r'（(\d{4})年(\d{1,2})月(\d{1,2})日）', date_text)
            if date_match:
                year, month, day = date_match.groups()
                data_date = f"{year}-{int(month):02d}-{int(day):02d}"
                logger.info(f"数据日期: {data_date}")

        # 获取CEA所在的column div
        col_div = cea_h3.parent

        # 提取所有p标签文本
        ps = [p.get_text(strip=True) for p in col_div.find_all('p')]
        logger.info(f"找到 {len(ps)} 个p标签: {ps}")

        # 解析CEA数据（前5个是字段名，接下来5个是值）
        cea_data = {'date': data_date, 'source': SOURCE_URL, 'source_name': '上海环境能源交易所'}
        ccer_data = {'date': data_date, 'source': SOURCE_URL, 'source_name': '北京绿色交易所'}

        # CEA字段映射
        cea_fields_map = {
            '开盘（元/吨）': '开盘',
            '最高（元/吨）': '最高',
            '最低（元/吨）': '最低',
            '收盘（元/吨）': '收盘',
            '涨跌幅（%）': '涨跌幅',
        }
        # CCER字段映射
        ccer_fields_map = {
            '成交量（吨）': '成交量',
            '成交额（元）': '成交额',
            '均价（元/吨）': '均价',
            '涨跌幅（%）': '涨跌幅',
        }

        # ---- 解析CEA数据 ----
        # 找'开盘（元/吨）'作为CEA数据起始标志
        cea_start_idx = None
        for i, p in enumerate(ps):
            if p == '开盘（元/吨）':
                cea_start_idx = i
                break

        if cea_start_idx is not None:
            # 连续5个字段名，后跟5个值
            cea_keys = ps[cea_start_idx:cea_start_idx + 5]
            cea_values = ps[cea_start_idx + 5:cea_start_idx + 10]
            for k, v in zip(cea_keys, cea_values):
                clean_key = cea_fields_map.get(k, k)
                clean_val = v if v != '——' else ''
                cea_data[clean_key] = clean_val
            logger.info(f"CEA数据: {cea_data}")
        else:
            logger.warning("未找到CEA字段数据")

        # ---- 解析CCER数据 ----
        # 通过'来源：上海环境能源交易所'定位分隔点，CCER数据在其后
        source_cea_idx = None
        for i, p in enumerate(ps):
            if '上海环境能源交易所' in p:
                source_cea_idx = i
                break

        if source_cea_idx is not None:
            ccer_start_idx = source_cea_idx + 1
            # 连续4个字段名，后跟4个值
            ccer_keys = ps[ccer_start_idx:ccer_start_idx + 4]
            ccer_values = ps[ccer_start_idx + 4:ccer_start_idx + 8]
            for k, v in zip(ccer_keys, ccer_values):
                clean_key = ccer_fields_map.get(k, k)
                clean_val = v if v != '——' else ''
                ccer_data[clean_key] = clean_val
            logger.info(f"CCER数据: {ccer_data}")
        else:
            logger.warning("未找到CCER字段数据（未找到上海环境能源交易所来源标记）")

        return {
            'date': data_date,
            'cea': cea_data,
            'ccer': ccer_data,
            'fetch_time': datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"抓取失败: {e}", exc_info=True)
        return None


def get_last_data_date():
    """获取本地最新数据日期"""
    cea_file = os.path.join(DATA_DIR, 'cea_history.csv')
    if os.path.exists(cea_file):
        with open(cea_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if rows:
                return rows[-1]['date']
    return None


def is_duplicate(data_date):
    """检查是否已存在该日期的数据"""
    last_date = get_last_data_date()
    if last_date and last_date == data_date:
        logger.info(f"日期 {data_date} 的数据已存在，跳过插入")
        return True
    return False


def save_data(data):
    """保存数据到 CSV（自动去重）"""
    os.makedirs(DATA_DIR, exist_ok=True)

    data_date = data['date']

    # 检查去重
    if is_duplicate(data_date):
        return {'cea_inserted': 0, 'ccer_inserted': 0, 'reason': 'duplicate'}

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
            'last_data_date': data_date,
            'source_url': SOURCE_URL,
            'fetch_status': 'success',
            'cea_data': data['cea'],
            'ccer_data': data['ccer']
        }, f, ensure_ascii=False, indent=2)

    logger.info(f"数据已保存: {data_date}")
    return {'cea_inserted': 1, 'ccer_inserted': 1, 'reason': 'new_data'}


def main():
    """主函数"""
    logger.info("=" * 50)
    logger.info("开始抓取碳市场数据...")
    logger.info(f"数据来源: {SOURCE_URL}")
    logger.info(f"执行时间: {datetime.now().isoformat()}")
    logger.info("=" * 50)

    data = fetch_current_data()
    if not data:
        logger.error("抓取失败，无法获取数据")
        exit(1)

    result = save_data(data)

    logger.info("=" * 50)
    logger.info(f"抓取完成！数据日期: {data['date']}")
    logger.info(f"CEA数据: 开盘={data['cea'].get('开盘','N/A')}, 收盘={data['cea'].get('收盘','N/A')}, 涨跌幅={data['cea'].get('涨跌幅','N/A')}%")
    logger.info(f"CCER数据: 成交量={data['ccer'].get('成交量','N/A')}吨, 均价={data['ccer'].get('均价','N/A')}元/吨, 涨跌幅={data['ccer'].get('涨跌幅','N/A')}%")
    logger.info(f"插入结果: CEA={result['cea_inserted']}条, CCER={result['ccer_inserted']}条 ({result['reason']})")
    logger.info("=" * 50)

    # 输出JSON结果供调用方解析
    print(json.dumps({
        'success': True,
        'date': data['date'],
        'fetch_time': data['fetch_time'],
        'cea': data['cea'],
        'ccer': data['ccer'],
        'inserted': result
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
