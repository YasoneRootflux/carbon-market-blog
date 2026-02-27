import { useState, useEffect, useCallback } from 'react';
import type { CEAData, CCERData, MarketData, CEASummary, DataAnalysis } from '@/types/carbon-market';

// CSV 解析函数
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      result.push(obj);
    }
  }
  return result;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// 获取当前工作日
const getCurrentWorkDate = (): string => {
  const now = new Date();
  const day = now.getDay();
  
  if (day === 0) {
    now.setDate(now.getDate() - 2);
  } else if (day === 6) {
    now.setDate(now.getDate() - 1);
  }
  
  return now.toISOString().split('T')[0];
};

// 检查是否工作日
const isWorkDay = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

// 获取前一个工作日
const getPrevWorkDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  do {
    date.setDate(date.getDate() - 1);
  } while (!isWorkDay(date.toISOString().split('T')[0]));
  return date.toISOString().split('T')[0];
};

// CEA 数据转换为汇总
const summarizeCEAByDate = (ceaData: CEAData[]): CEASummary[] => {
  const grouped = new Map<string, CEAData[]>();
  
  ceaData.forEach(item => {
    if (!grouped.has(item.date)) {
      grouped.set(item.date, []);
    }
    grouped.get(item.date)!.push(item);
  });
  
  return Array.from(grouped.entries()).map(([date, items]) => {
    const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
    const totalTurnover = items.reduce((sum, item) => sum + item.turnover, 0);
    const weightedAvgPrice = totalVolume > 0 ? totalTurnover / totalVolume : 0;
    
    const mainContract = items.reduce((max, item) => 
      item.volume > max.volume ? item : max, items[0]);
    
    return {
      date,
      totalVolume,
      totalTurnover,
      weightedAvgPrice,
      mainContract: mainContract.quotaYear,
      mainOpen: mainContract.open,
      mainHigh: mainContract.high,
      mainLow: mainContract.low,
      mainClose: mainContract.close,
      mainChangePercent: mainContract.changePercent,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 生成分析文本
const generateAnalysis = (ceaSummary: CEASummary | null, ccer: CCERData | null, isLatest: boolean): DataAnalysis => {
  const today = getCurrentWorkDate();
  const note = isLatest ? undefined : `注：当前展示为 ${ceaSummary?.date || ccer?.date} 的数据，${today} 数据尚未更新`;
  
  let ceaAnalysis = '';
  let ccerAnalysis = '';
  let marketTrend = '';
  
  if (ceaSummary) {
    const changeDirection = ceaSummary.mainChangePercent >= 0 ? '上涨' : '下跌';
    const changeAmount = Math.abs(ceaSummary.mainChangePercent).toFixed(2);
    ceaAnalysis = `今日CEA主力合约${ceaSummary.mainContract}收盘价为${ceaSummary.mainClose.toFixed(2)}元/吨，较前一交易日${changeDirection}${changeAmount}%。`;
    ceaAnalysis += `成交量${(ceaSummary.totalVolume / 10000).toFixed(2)}万吨，成交额${(ceaSummary.totalTurnover / 100000000).toFixed(4)}亿元。`;
    
    if (ceaSummary.mainChangePercent > 1) {
      ceaAnalysis += '市场情绪积极，价格呈现明显上涨趋势。';
    } else if (ceaSummary.mainChangePercent < -1) {
      ceaAnalysis += '市场情绪谨慎，价格出现一定回调。';
    } else {
      ceaAnalysis += '市场波动较小，价格走势相对平稳。';
    }
  }
  
  if (ccer) {
    if (ccer.volume > 0) {
      const changeDirection = ccer.changePercent >= 0 ? '上涨' : '下跌';
      const changeAmount = Math.abs(ccer.changePercent).toFixed(2);
      ccerAnalysis = `CCER今日成交${ccer.volume}吨，成交均价${ccer.avgPrice.toFixed(2)}元/吨，较前一交易日${changeDirection}${changeAmount}%。`;
      
      if (ccer.changePercent > 5) {
        ccerAnalysis += '自愿减排市场交易活跃，价格涨幅明显。';
      } else if (ccer.changePercent < -5) {
        ccerAnalysis += '自愿减排市场出现一定调整。';
      } else {
        ccerAnalysis += '自愿减排市场交易平稳。';
      }
    } else {
      ccerAnalysis = 'CCER今日无成交。';
    }
  }
  
  if (ceaSummary && ccer) {
    if (ceaSummary.mainChangePercent > 0 && ccer.changePercent > 0) {
      marketTrend = '碳市场整体呈现上涨态势，强制减排市场与自愿减排市场同步向好，显示市场对碳资产的需求持续增加。';
    } else if (ceaSummary.mainChangePercent < 0 && ccer.changePercent < 0) {
      marketTrend = '碳市场整体回调，强制减排市场与自愿减排市场同步下行，建议关注后续政策动向及市场供需变化。';
    } else {
      marketTrend = '碳市场呈现分化走势，建议关注各市场间的价差变化及套利机会。';
    }
  } else if (ceaSummary) {
    marketTrend = '基于CEA市场走势分析，碳市场整体运行平稳。';
  }
  
  return {
    ceaAnalysis,
    ccerAnalysis,
    marketTrend,
    dataSource: '上海环境能源交易所、北京绿色交易所',
    sourceUrl: 'https://www.ccn.ac.cn/cets',
    note,
  };
};

export const useCarbonData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [latestData, setLatestData] = useState<MarketData | null>(null);
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null);
  const [usingFallbackDate, setUsingFallbackDate] = useState(false);

  const fetchData = useCallback(async (targetDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 加载 CEA 数据
      const ceaResponse = await fetch('data/cea_history.csv');
      const ceaText = await ceaResponse.text();
      const ceaRaw = parseCSV(ceaText);
      
      // 加载 CCER 数据
      const ccerResponse = await fetch('data/ccer_history.csv');
      const ccerText = await ccerResponse.text();
      const ccerRaw = parseCSV(ccerText);
      
      // 转换 CEA 数据
      const ceaData: CEAData[] = ceaRaw.map(row => ({
        date: row.date,
        quotaYear: 'CEA24', // 默认主力合约
        open: parseFloat(row['开盘']) || 0,
        high: parseFloat(row['最高']) || 0,
        low: parseFloat(row['最低']) || 0,
        close: parseFloat(row['收盘']) || 0,
        changePercent: parseFloat(row['涨跌幅']) || 0,
        volume: 0, // CSV中没有成交量，设为0
        turnover: 0,
      }));
      
      // 转换 CCER 数据
      const ccerData: CCERData[] = ccerRaw.map(row => ({
        date: row.date,
        volume: parseInt(row['成交量']) || 0,
        turnover: parseFloat(row['成交额']) || 0,
        avgPrice: parseFloat(row['均价']) || 0,
        changePercent: parseFloat(row['涨跌幅']) || 0,
      }));
      
      const today = targetDate || getCurrentWorkDate();
      const ceaSummaries = summarizeCEAByDate(ceaData);
      
      let ceaForToday = ceaSummaries.find(item => item.date === today);
      let ccerForToday = ccerData.find(item => item.date === today);
      
      let actualDate = today;
      let isFallback = false;
      
      // 如果今天没有数据，查找最近的历史数据
      if (!ceaForToday && !ccerForToday) {
        let searchDate = getPrevWorkDay(today);
        let searchCount = 0;
        
        while (searchCount < 30 && (!ceaForToday || !ccerForToday)) {
          if (!ceaForToday) {
            ceaForToday = ceaSummaries.find(item => item.date === searchDate);
          }
          if (!ccerForToday) {
            ccerForToday = ccerData.find(item => item.date === searchDate);
          }
          
          if (ceaForToday || ccerForToday) {
            actualDate = searchDate;
            isFallback = true;
            break;
          }
          
          searchDate = getPrevWorkDay(searchDate);
          searchCount++;
        }
      }
      
      setUsingFallbackDate(isFallback);
      
      // 构建所有数据
      const allData: MarketData[] = ceaSummaries.map(cea => {
        const ccer = ccerData.find(c => c.date === cea.date);
        return {
          date: cea.date,
          cea,
          ccer: ccer || null,
          hasData: true,
        };
      });
      
      // 添加只有 CCER 的数据
      ccerData.forEach(ccer => {
        if (!allData.find(d => d.date === ccer.date)) {
          allData.push({
            date: ccer.date,
            cea: null,
            ccer,
            hasData: true,
          });
        }
      });
      
      allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latest: MarketData = {
        date: actualDate,
        cea: ceaForToday || null,
        ccer: ccerForToday || null,
        hasData: !!(ceaForToday || ccerForToday),
      };
      
      setMarketData(allData);
      setLatestData(latest);
      
      if (latest.cea || latest.ccer) {
        setAnalysis(generateAnalysis(latest.cea, latest.ccer, !isFallback));
      }
      
    } catch (err) {
      setError('数据加载失败，请稍后重试');
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const getHistory = useCallback((days: number = 30) => {
    return marketData.slice(0, days);
  }, [marketData]);

  return {
    loading,
    error,
    marketData,
    latestData,
    analysis,
    usingFallbackDate,
    refresh,
    getHistory,
  };
};

export default useCarbonData;
