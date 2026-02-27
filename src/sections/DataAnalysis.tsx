import { useTranslation } from 'react-i18next';
import { FileText, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import type { DataAnalysis } from '@/types/carbon-market';

interface DataAnalysisProps {
  analysis: DataAnalysis | null;
}

export default function DataAnalysis({ analysis }: DataAnalysisProps) {
  const { t } = useTranslation();

  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50">
        <p className="text-center text-gray-500 dark:text-gray-400">暂无分析数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50">
      {analysis.note && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {analysis.note}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CEA Analysis */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-900/20 dark:to-teal-900/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-emerald-500 p-1.5">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{t('analysis.ceaAnalysis')}</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.ceaAnalysis}</p>
        </div>

        {/* CCER Analysis */}
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 dark:from-teal-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-teal-500 p-1.5">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{t('analysis.ccerAnalysis')}</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.ccerAnalysis}</p>
        </div>
      </div>

      {/* Market Trend */}
      <div className="mt-4 sm:mt-6 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-indigo-500 p-1.5">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{t('analysis.marketTrend')}</h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.marketTrend}</p>
      </div>

      {/* Data Source */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('analysis.dataSource')}: {analysis.dataSource}
          </span>
        </div>
        <a
          href={analysis.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          {t('analysis.viewOriginal')} →
        </a>
      </div>
    </div>
  );
}
