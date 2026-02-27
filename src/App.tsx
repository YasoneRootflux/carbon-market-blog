import { useTranslation } from 'react-i18next';
import { useCarbonData } from '@/hooks/useCarbonData';
import Header from '@/sections/Header';
import DataOverview from '@/sections/DataOverview';
import PriceChart from '@/sections/PriceChart';
import DataAnalysis from '@/sections/DataAnalysis';
import HistoryTable from '@/sections/HistoryTable';
import Footer from '@/sections/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, BarChart3, FileText, Calendar } from 'lucide-react';

function App() {
  const { t } = useTranslation();
  const { 
    loading, 
    error, 
    marketData, 
    latestData, 
    analysis, 
    usingFallbackDate, 
    refresh, 
    getHistory 
  } = useCarbonData();

  const historyData = getHistory(30);

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/30 flex-shrink-0">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors duration-300">
      <Header 
        onRefresh={refresh} 
        loading={loading}
        lastUpdate={latestData?.date}
        usingFallback={usingFallbackDate}
        fallbackDate={latestData?.date}
      />

      <main className="flex-1 container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {error && (
          <Alert variant="destructive" className="mb-6 shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !latestData && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Skeleton className="h-[350px] sm:h-[450px] rounded-2xl" />
              <Skeleton className="h-[350px] sm:h-[450px] rounded-2xl" />
            </div>
            <Skeleton className="h-[300px] sm:h-[450px] rounded-2xl" />
            <Skeleton className="h-[400px] sm:h-[600px] rounded-2xl" />
          </div>
        )}

        {(!loading || latestData) && (
          <div className="space-y-8 sm:space-y-12">
            <section className="animate-fade-in">
              <SectionTitle icon={TrendingUp} title={t('sections.todayMarket')} />
              <DataOverview 
                cea={latestData?.cea || null}
                ccer={latestData?.ccer || null}
              />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <SectionTitle icon={BarChart3} title={t('sections.trendChart')} />
              <PriceChart data={historyData} />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <SectionTitle icon={FileText} title={t('sections.marketAnalysis')} />
              <DataAnalysis analysis={analysis} />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <SectionTitle icon={Calendar} title={t('sections.historyData')} />
              <HistoryTable data={marketData} />
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
