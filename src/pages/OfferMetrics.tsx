import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, TrendingUp, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { useAuth } from '../context/AuthContext';
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

import LogoBranco from '../assets/logo-branco.png';
import IconBranco from '../assets/ico-branco.png';
import { supabase } from '../lib/supabase';

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={LogoBranco} alt="" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Clonup
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src={IconBranco} alt="" />
    </Link>
  );
};

export default function OfferMetrics() {
  const { offerId } = useParams();
  const [metrics, setMetrics] = useState<OfferMetric[]>([]);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<PeriodValue>(7);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = React.useState(false);
  const { theme } = useThemeStore();
  const { user, profile } = useAuth();

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
  const fetchMetrics = async () => {
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
  };

  useEffect(() => {
    fetchMetrics();
  }, [offerId, period]);

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
        ? date.toLocaleTimeString()
        : date.toLocaleDateString();
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

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Layout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },

    // {
    //   label: "Filtro de Tráfego",
    //   href: "#",
    //   icon: (
    //     <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
    //   ),
    //   subLinks: [
    //     { label: "Requisições", href: "/traffic-filter/requests", icon: <Circle className="h-4 w-4" /> },
    //     { label: "Domínios", href: "/traffic-filter/domains", icon: <Circle className="h-4 w-4" /> },
    //     { label: "Relatórios", href: "/traffic-filter/reports", icon: <Circle className="h-4 w-4" /> },
    //     { label: "Campanha", href: "/traffic-filter/campaigns", icon: <Circle className="h-4 w-4" /> },
    //   ],
    // },
    {
      label: "Ferramentas",
      href: "#",
      icon: <Wrench className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />,
      subLinks: [
        { label: "Criptografar Texto", href: "/tools/encrypt", icon: <Circle className="h-4 w-4" /> },
        { label: "Remover Metadados", href: "/tools/removemetadados", icon: <Circle className="h-4 w-4" /> },
        { label: "Trackeamento", href: "/tools/trackeamento", icon: <Circle className="h-4 w-4" /> },
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Sites", href: "/tools/clonesites", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Quiz", href: "/tools/clonequiz", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <SettingsIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={`w-64 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0`}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: profile?.full_name || user?.email || 'Usuário',
                href: "/profile",
                icon: (
                  <img
                    src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || user?.email || 'U')}
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className={`${open ? 'pl-72' : 'pl-14'} transition-all duration-300`}>
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-6 h-6 text-blue-600" />
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Métricas da Oferta
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
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

                <div className="flex-1 flex items-center gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">Período:</label>
                  <div className="flex flex-wrap gap-2">
                    {PERIODS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${period === p.value
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
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Informações da Oferta */}
          {offer && (
            <div className="mb-6">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {offer.title}
                </h2>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={offer.offerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                  >
                    Página da Oferta <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={offer.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                  >
                    Landing Page <ArrowRight className="h-4 w-4" />
                  </a>
                  <span className={`px-2 py-1 rounded text-sm ${{
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Anúncios Atuais
                </h3>
                <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  {lastMetric.toLocaleString()}
                </p>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Variação no Período
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {variation > 0 ? '+' : ''}{variation.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Variação Percentual
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {percentVariation > 0 ? '+' : ''}{percentVariation.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico */}
          <div className={`rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } p-6`}>
            {loading && (
              <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Carregando...
              </div>
            )}
            {error && (
              <div className="text-red-500 font-semibold flex items-center justify-center h-80">
                {error}
              </div>
            )}
            {!loading && !error && metrics.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-center flex flex-col items-center justify-center h-80 gap-2">
                <span className="text-4xl">📉</span>
                <span>Nenhuma métrica registrada para este período.</span>
              </div>
            )}
            {!loading && !error && metrics.length > 0 && (
              <div className="w-full" style={{ height: '400px' }}>
                <Line
                  data={chartData}
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === 'dark' ? '#fff' : '#059669',
                          font: { weight: 'bold' },
                          padding: 16,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw as number;
                            return `Anúncios: ${value.toLocaleString()}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        ticks: { color: theme === 'dark' ? '#d1d5db' : '#6b7280' },
                        grid: { color: theme === 'dark' ? 'rgba(55,65,81,0.2)' : 'rgba(156,163,175,0.2)' },
                      },
                      y: {
                        ticks: {
                          color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                          callback: (value) => value.toLocaleString()
                        },
                        grid: { color: theme === 'dark' ? 'rgba(55,65,81,0.2)' : 'rgba(156,163,175,0.2)' },
                      },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 