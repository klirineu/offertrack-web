import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench } from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Tipagem baseada na tabela offer_metrics do Supabase
interface OfferMetric {
  id: string;
  offer_id: string;
  count: number;
  checked_at: string;
}

const PERIODS = [
  { label: '7 dias', value: 7 },
  { label: '30 dias', value: 30 },
  { label: '90 dias', value: 90 },
  { label: 'Tudo', value: 0 },
];

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        OfferTrack
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
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export default function OfferMetrics() {
  const { offerId } = useParams();
  const [metrics, setMetrics] = useState<OfferMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(7);
  const [open, setOpen] = React.useState(false);
  const { user, profile, } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError('');
      let fromDate;
      if (period > 0) {
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
      setLoading(false);
    }
    if (offerId) fetchMetrics();
  }, [offerId, period]);

  const chartData = {
    labels: metrics.map(m => new Date(m.checked_at).toLocaleString()),
    datasets: [
      {
        label: 'Quantidade de Anúncios',
        data: metrics.map(m => m.count),
        fill: false,
        borderColor: 'rgb(16,185,129)',
        backgroundColor: 'rgba(16,185,129,0.2)',
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
      label: "Filtro de Tráfego",
      href: "#",
      icon: (
        <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
      ),
      subLinks: [
        { label: "Requisições", href: "/traffic-filter/requests", icon: <Circle className="h-4 w-4" /> },
        { label: "Domínios", href: "/traffic-filter/domains", icon: <Circle className="h-4 w-4" /> },
        { label: "Relatórios", href: "/traffic-filter/reports", icon: <Circle className="h-4 w-4" /> },
        { label: "Campanha", href: "/traffic-filter/campaigns", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    {
      label: "Ferramentas",
      href: "#",
      icon: <Wrench className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />,
      subLinks: [
        { label: "Criptografar Texto", href: "/tools/encrypt", icon: <Circle className="h-4 w-4" /> },
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Sites", href: "/tools/clonesites", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    {
      label: "Logout",
      href: "/logout",
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
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Métricas da Oferta</h1>
            <div className="ml-auto flex gap-2 items-center">
              <label className="font-semibold text-gray-700 dark:text-gray-200">Período:</label>
              <select
                className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={period}
                onChange={e => setPeriod(Number(e.target.value))}
              >
                {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              {loading && <div className="text-gray-500 dark:text-gray-400">Carregando...</div>}
              {error && <div className="text-red-500 font-semibold">{error}</div>}
              {!loading && !error && metrics.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 text-center flex flex-col items-center gap-2">
                  <span className="text-4xl">📉</span>
                  <span>Nenhuma métrica registrada para este período.</span>
                </div>
              )}
              {!loading && !error && metrics.length > 0 && (
                <div className="w-full" style={{ minHeight: 320 }}>
                  <Line data={chartData} options={{
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
                    responsive: true,
                    maintainAspectRatio: false,
                  }} height={320} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 