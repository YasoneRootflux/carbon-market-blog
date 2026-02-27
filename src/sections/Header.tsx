import { useTranslation } from 'react-i18next';
import { RefreshCw, Moon, Sun, Database } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdate?: string;
  usingFallback?: boolean;
  fallbackDate?: string;
}

export default function Header({ onRefresh, loading, usingFallback, fallbackDate }: HeaderProps) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('header.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {usingFallback && fallbackDate && (
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <span>{t('header.historicalData')}: {fallbackDate}</span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              <RefreshCw className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', loading && 'animate-spin')} />
              <span className="hidden sm:inline">{t('header.refresh')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
