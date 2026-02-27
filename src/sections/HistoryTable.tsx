import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MarketData } from '@/types/carbon-market';
import { cn } from '@/lib/utils';

interface HistoryTableProps {
  data: MarketData[];
}

export default function HistoryTable({ data }: HistoryTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-red-500';
    if (value < 0) return 'text-green-500';
    return 'text-gray-500';
  };

  return (
    <div className="rounded-2xl bg-white shadow-lg shadow-gray-200/50 dark:bg-gray-800 dark:shadow-gray-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.date')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.ceaClose')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.ceaChange')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.ccerPrice')}</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.ccerChange')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{t('history.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {currentData.map((item, index) => (
              <tr
                key={item.date}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors',
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'
                )}
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.date}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                  {item.cea ? item.cea.mainClose.toFixed(2) : '-'}
                </td>
                <td className={cn('px-4 py-3 text-right text-sm', getChangeColor(item.cea?.mainChangePercent || 0))}>
                  {item.cea ? `${item.cea.mainChangePercent > 0 ? '+' : ''}${item.cea.mainChangePercent.toFixed(2)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                  {item.ccer ? item.ccer.avgPrice.toFixed(2) : '-'}
                </td>
                <td className={cn('px-4 py-3 text-right text-sm', getChangeColor(item.ccer?.changePercent || 0))}>
                  {item.ccer ? `${item.ccer.changePercent > 0 ? '+' : ''}${item.ccer.changePercent.toFixed(2)}%` : '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <a
                    href="https://www.ccn.ac.cn/cets"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('history.detail')}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('history.showing')} {startIndex + 1} {t('history.to')} {Math.min(endIndex, data.length)} {t('history.items')} {data.length} {t('history.total')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
