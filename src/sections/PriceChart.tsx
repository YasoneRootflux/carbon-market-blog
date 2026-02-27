import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MarketData } from '@/types/carbon-market';
import { cn } from '@/lib/utils';

interface PriceChartProps {
  data: MarketData[];
}

export default function PriceChart({ data }: PriceChartProps) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState(30);

  const chartData = data
    .slice(0, timeRange)
    .reverse()
    .map((item) => ({
      date: item.date.slice(5),
      cea: item.cea?.mainClose || null,
      ccer: item.ccer?.avgPrice || null,
    }));

  const ranges = [
    { label: t('chart.last7Days'), value: 7 },
    { label: t('chart.last14Days'), value: 14 },
    { label: t('chart.last30Days'), value: 30 },
  ];

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('chart.priceTrend')}</h3>
        <div className="flex gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                timeRange === range.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cea"
              name={t('chart.ceaClose')}
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ccer"
              name={t('chart.ccerPrice')}
              stroke="#14B8A6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
