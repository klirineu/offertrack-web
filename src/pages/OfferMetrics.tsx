import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, Layout } from 'lucide-react';
import { StandardNavigation } from '../components/StandardNavigation';
import { useThemeStore } from '../store/themeStore';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Tipagem baseada na tabela offer_metrics do Supabase
interface OfferMetric {
  id: string;
  offer_id: string;
  count: number;
  checked_at: string;
}

interface Offer {
  id: string;
  title: string;
  offerUrl: string;
  landingPageUrl: string;
  status: string;
  createdAt: string;
}

const PERIODS = [
  { label: 'Últimas 24h', value: 1 },
  { label: 'Hoje', value: 'today' },
  { label: 'Últimos 7 dias', value: 7 },
  { label: 'Últimos 30 dias', value: 30 },
  { label: 'Últimos 90 dias', value: 90 },
  { label: 'Tudo', value: 0 },
] as const;

type PeriodValue = (typeof PERIODS)[number]['value'];

import { supabase } from '../lib/supabase';

export default function OfferMetrics() {
  const { offerId } = useParams();
  const [metrics, setMetrics] = useState<OfferMetric[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<PeriodValue>(7);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useThemeStore();

  // Função para buscar dados da oferta
  useEffect(() => {
    async function fetchOffer() {
      if (!offerId) return;
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (error) {
        setError('Erro ao buscar dados da oferta');
      } else if (data) {
        setOffer(data);
      }
    }
    fetchOffer();
  }, [offerId]);

  // Função para buscar métricas
  const fetchMetrics = useCallback(async () => {
    if (!offerId) return;
    setRefreshing(true);
    setError('');
    let fromDate;

    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      fromDate = today.toISOString();
    } else if (typeof period === 'number' && period > 0) {
      const d = new Date();
      d.setDate(d.getDate() - period);
      fromDate = d.toISOString();
    }

    let query = supabase
      .from('offer_metrics')
      .select('*')
      .eq('offer_id', offerId)
      .order('checked_at', { ascending: true });
    if (fromDate) query = query.gte('checked_at', fromDate);
    const { data, error } = await query;
    if (error) setError('Erro ao buscar métricas');
    else setMetrics(data || []);
    setRefreshing(false);
    setLoading(false);
  }, [offerId, period]);

  useEffect(() => {
    fetchMetrics();
  }, [offerId, period, fetchMetrics]);

  // Cálculos de métricas
  const lastMetric = metrics[metrics.length - 1]?.count || 0;
  const firstMetric = metrics[0]?.count || 0;
  const variation = lastMetric - firstMetric;
  const percentVariation = firstMetric === 0 ? 0 : (variation / firstMetric) * 100;
  const isPositive = variation >= 0;

  const chartData = {
    labels: metrics.map(m => {
      const date = new Date(m.checked_at);
      return typeof period === 'number' && period <= 1
        ? date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        : date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
    }),
    datasets: [
      {
        label: 'Quantidade de Anúncios',
        data: metrics.map(m => m.count),
        fill: true,
        borderColor: 'rgb(16,185,129)',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.2,
      },
    ],
  };

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Layout className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Métricas da Oferta
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={fetchMetrics}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                title="Atualizar métricas"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="font-medium text-gray-700 dark:text-gray-200 text-sm">Período:</label>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {PERIODS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${period === p.value
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          {/* Informações da Oferta */}
          {offer && (
            <div className="mb-6">
              <div className={`p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {offer.title}
                </h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                  <a
                    href={offer.offerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Página da Oferta <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={offer.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Landing Page <ArrowRight className="h-4 w-4" />
                  </a>
                  <span className={`inline-flex px-2 py-1 rounded text-xs sm:text-sm ${{
                    waiting: 'bg-yellow-100 text-yellow-800',
                    testing: 'bg-blue-100 text-blue-800',
                    approved: 'bg-green-100 text-green-800',
                    invalid: 'bg-red-100 text-red-800',
                  }[offer.status]
                    }`}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cards de Métricas */}
          {!loading && !error && metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className={`p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Último Valor
                </h3>
                <p className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {lastMetric}
                </p>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Variação
                </h3>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl sm:text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {isPositive ? '+' : ''}{variation}
                  </p>
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Variação %
                </h3>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl sm:text-3xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {isPositive ? '+' : ''}{percentVariation.toFixed(1)}%
                  </p>
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gráfico */}
          {!loading && !error && metrics.length > 0 && (
            <div className={`p-4 sm:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                Evolução das Métricas
              </h3>
              <div className="h-64 sm:h-80">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === 'dark' ? '#fff' : '#059669',
                          font: { weight: 'bold' },
                          padding: 16,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: { color: theme === 'dark' ? '#d1d5db' : '#6b7280' },
                        grid: { color: theme === 'dark' ? 'rgba(55,65,81,0.2)' : 'rgba(156,163,175,0.2)' },
                      },
                      y: {
                        ticks: { color: theme === 'dark' ? '#d1d5db' : '#6b7280' },
                        grid: { color: theme === 'dark' ? 'rgba(55,65,81,0.2)' : 'rgba(156,163,175,0.2)' },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Estados de Loading e Error */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && metrics.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-gray-500 ${theme === 'dark' ? 'dark:text-gray-400' : ''}`}>
                Nenhuma métrica encontrada para este período.
              </p>
            </div>
          )}
        </main>
      </div>
    </StandardNavigation>
  );
} 