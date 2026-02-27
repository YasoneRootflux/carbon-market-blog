// CEA碳排放权交易数据
export interface CEAData {
  date: string;
  quotaYear: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changePercent: number;
  volume: number;
  turnover: number;
  listedVolume?: number;
  listedTurnover?: number;
  blockVolume?: number;
  blockTurnover?: number;
}

// CCER自愿减排交易数据
export interface CCERData {
  date: string;
  volume: number;
  turnover: number;
  avgPrice: number;
  changePercent: number;
}

// 综合行情数据
export interface MarketData {
  date: string;
  cea: CEASummary | null;
  ccer: CCERData | null;
  hasData: boolean;
}

// CEA汇总数据
export interface CEASummary {
  date: string;
  totalVolume: number;
  totalTurnover: number;
  weightedAvgPrice: number;
  mainContract: string;
  mainOpen: number;
  mainHigh: number;
  mainLow: number;
  mainClose: number;
  mainChangePercent: number;
}

// 数据分析文本
export interface DataAnalysis {
  ceaAnalysis: string;
  ccerAnalysis: string;
  marketTrend: string;
  dataSource: string;
  sourceUrl: string;
  note?: string;
}
