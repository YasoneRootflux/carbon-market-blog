import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { CEASummary, CCERData } from '@/types/carbon-market';

interface DataOverviewProps {
  cea: CEASummary | null;
  ccer: CCERData | null;
}

function ChangeIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <TrendingUp className="h-4 w-4" />
        <span>+{value.toFixed(2)}%</span>
      </div>
    );
  }
  if (value < 0) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <TrendingDown className="h-4 w-4" />
        <span>{value.toFixed(2)}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-gray-500">
      <Minus className="h-4 w-4" />
      <span>0.00%</span>
    </div>
  );
}

export default function DataOverview({ cea, ccer }: DataOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* CEA Card */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('cea.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('cea.subtitle')}</p>
          </div>
          <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {cea ? (
          <>
            <div className="mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {cea.mainClose.toFixed(2)}
                <span className="text-base sm:text-lg font-normal text-gray-500 ml-1">{t('cea.unit')}</span>
              </div>
              <ChangeIndicator value={cea.mainChangePercent} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cea.open')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{cea.mainOpen.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cea.high')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{cea.mainHigh.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cea.low')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{cea.mainLow.toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('cea.close')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{cea.mainClose.toFixed(2)}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('cea.noData')}</p>
            <p className="text-sm mt-1">{t('cea.refreshHint')}</p>
          </div>
        )}
      </div>

      {/* CCER Card */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('ccer.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('ccer.subtitle')}</p>
          </div>
          <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900/30">
            <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
        </div>

        {ccer ? (
          <>
            <div className="mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {ccer.avgPrice.toFixed(2)}
                <span className="text-base sm:text-lg font-normal text-gray-500 ml-1">{t('ccer.unit')}</span>
              </div>
              <ChangeIndicator value={ccer.changePercent} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('ccer.volume')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {ccer.volume.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('ccer.turnover')}</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {(ccer.turnover / 10000).toFixed(2)}万
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>{t('ccer.noData')}</p>
            <p className="text-sm mt-1">{t('ccer.holidayHint')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
