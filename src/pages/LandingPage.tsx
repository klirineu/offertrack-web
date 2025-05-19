import React, { useEffect, useState } from 'react';
import { Sun, Moon, Mail, LayoutDashboard, Link as LinkIcon, Shield, Download, FileText, Lock, TrendingUp } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import logoDark from '../assets/favicon.png';
import logoLight from '../assets/favicon.png';
import editorImg from '../assets/editor.png';
import { Column } from '../components/Column';
import { supabase } from '../lib/supabase';

// Dados mockados para o board visual
const mockOffers = [
  {
    id: '1',
    title: 'Oferta Summer',
    offerUrl: '#',
    landingPageUrl: '#',
    description: 'Landing de verão para promoções.',
    tags: ['verão', 'promo'],
    status: 'waiting' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    metrics: [],
  },
  {
    id: '2',
    title: 'Black Friday',
    offerUrl: '#',
    landingPageUrl: '#',
    description: 'Oferta especial Black Friday.',
    tags: ['blackfriday'],
    status: 'approved' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    metrics: [],
  },
  {
    id: '3',
    title: 'Webinar',
    offerUrl: '#',
    landingPageUrl: '#',
    description: 'Webinar de vendas.',
    tags: ['webinar'],
    status: 'testing' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    metrics: [],
  },
];

const columns = [
  // { id: 'waiting' as const, title: 'Waiting', color: 'yellow' },
  { id: 'testing' as const, title: 'Testing', color: 'blue' },
  { id: 'approved' as const, title: 'Approved', color: 'green' },
  // { id: 'invalid' as const, title: 'Invalid', color: 'red' },
];

// Dados mockados para o gráfico
const mockMetrics = [
  { checked_at: '2024-06-01T12:00:00Z', count: 2 },
  { checked_at: '2024-06-02T12:00:00Z', count: 3 },
  { checked_at: '2024-06-03T12:00:00Z', count: 4 },
  { checked_at: '2024-06-04T12:00:00Z', count: 3 },
  { checked_at: '2024-06-05T12:00:00Z', count: 5 },
];

const chartData = {
  labels: mockMetrics.map(m => new Date(m.checked_at).toLocaleDateString()),
  datasets: [
    {
      label: 'Quantidade de Anúncios',
      data: mockMetrics.map(m => m.count),
      fill: false,
      borderColor: 'rgb(16,185,129)',
      backgroundColor: 'rgba(16,185,129,0.2)',
      tension: 0.2,
    },
  ],
};

type Plan = {
  id: string;
  name: string;
  price: number;
  max_libraries: number;
  max_clones: number;
  max_anticlone: number;
  max_cloaker_requests: number | null;
  features: string[];
};

// Seção de funcionalidades poderosas
const features = [
  {
    icon: <LayoutDashboard className="h-6 w-6 text-accent" />,
    title: 'Dashboard de Ofertas',
    desc: 'Visualize e gerencie todas suas campanhas em um único lugar, com métricas importantes e controle total.',
  },
  {
    icon: <LinkIcon className="h-6 w-6 text-accent" />,
    title: 'Clonador de Sites',
    desc: 'Clone páginas de vendas com apenas um clique, preservando todos os elementos e funcionalidades originais.',
  },
  {
    icon: <Shield className="h-6 w-6 text-accent" />,
    title: 'Anticlone',
    desc: 'Proteja suas páginas contra cópias não autorizadas com nossa tecnologia exclusiva de proteção.',
  },
  {
    icon: <Download className="h-6 w-6 text-accent" />,
    title: 'Download de Criativos',
    desc: 'Baixe imagens, vídeos e outros elementos de campanhas bem-sucedidas para inspirar suas próximas criações.',
  },
  {
    icon: <FileText className="h-6 w-6 text-accent" />,
    title: 'Remover Metadados',
    desc: 'Limpe imagens e vídeos antes de subir para plataformas, aumentando sua segurança digital.',
  },
  {
    icon: <Lock className="h-6 w-6 text-accent" />,
    title: 'Criptografar Texto',
    desc: 'Gere textos protegidos para uso em redes sociais, mantendo suas estratégias seguras.',
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-accent" />,
    title: 'Ofertas Escaladas',
    desc: 'Ferramenta avançada para automatizar e escalar suas ofertas mais bem-sucedidas com facilidade.',
  },
  {
    icon: <Shield className="h-6 w-6 text-accent" />,
    title: 'Cloaker',
    desc: 'Proteja suas campanhas e evite bloqueios de anúncios com tecnologia avançada de cloaking.',
  },
];

function FeatureCard({ icon, title, desc, theme }: { icon: React.ReactNode; title: string; desc: string; theme: string }) {
  return (
    <div className={theme === 'dark'
      ? 'bg-[#111827] rounded-lg shadow p-6 hover:shadow-xl transition border border-[#232b3b] group flex flex-col gap-2'
      : 'bg-white rounded-lg shadow p-6 hover:shadow-xl transition border border-gray-100 group flex flex-col gap-2'}>
      <div className="flex items-center gap-3 mb-2">
        {React.cloneElement(icon as React.ReactElement, {
          className: `h-7 w-7 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'} transition-colors duration-200`,
        })}
        <h3 className={theme === 'dark' ? 'text-xl font-semibold text-blue-400 group-hover:text-blue-300 transition-colors' : 'text-xl font-semibold text-blue-700 group-hover:text-blue-800 transition-colors'}>{title}</h3>
      </div>
      <p className={theme === 'dark' ? 'text-gray-300 group-hover:text-gray-100 transition-colors' : 'text-gray-600 group-hover:text-gray-800 transition-colors'}>{desc}</p>
    </div>
  );
}

export function LandingPage() {
  const { theme, toggleTheme } = useThemeStore();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    supabase.from('plans').select('*').order('price', { ascending: true }).then(({ data }) => {
      if (data) setPlans(data as Plan[]);
    });
  }, []);

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      {/* Header */}
      <header className={theme === 'dark' ? 'fixed w-full top-0 z-50 bg-[#131a29] border-b border-[#374151]' : 'fixed w-full top-0 z-50 bg-white border-b border-gray-200'}>
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Clonup logo" className="w-8 h-8" />
            <span className="text-xl font-bold">Clonup</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Recursos</a>
            <a href="#planos" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Planos</a>
            <a href="#faq" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>FAQ</a>
            <a href="/login" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Entrar</a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
          <a href="#planos" className={theme === 'dark' ? 'ml-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors' : 'ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'}>Começar</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={theme === 'dark' ? 'pt-32 pb-0 px-4 bg-[#111827] text-center' : 'pt-32 pb-0 px-4 bg-white text-center'} id="hero">
        <div className="max-w-4xl mx-auto">
          <h1 className={theme === 'dark' ? 'text-4xl md:text-6xl font-bold mb-6 leading-tight' : 'text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900'}>Clone, Analise e Proteja suas Ofertas com Clonup</h1>
          <p className={theme === 'dark' ? 'text-xl text-[#cbd5e1] max-w-2xl mx-auto mb-8' : 'text-xl text-gray-600 max-w-2xl mx-auto mb-8'}>Tudo o que afiliados, produtores e media buyers precisam numa só plataforma.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#preview" className={theme === 'dark' ? 'px-8 py-3 bg-[#2563eb] text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors' : 'px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors'}>Ver Demo</a>
            <a href="#planos" className={theme === 'dark' ? 'px-8 py-3 bg-[#131a29] text-white rounded-lg text-lg font-semibold hover:bg-[#374151] border border-[#374151]' : 'px-8 py-3 bg-gray-100 text-gray-900 rounded-lg text-lg font-semibold hover:bg-gray-200 border border-gray-200'}>Comece Grátis</a>
          </div>
          <div id="preview" className={theme === 'dark' ? 'rounded-xl shadow-lg bg-[#131a29] p-4 max-w-2xl mx-auto my-6' : 'rounded-xl shadow-lg bg-gray-100 p-4 max-w-2xl mx-auto my-6'}>
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <video
                src="/assets/editor-demo.mp4"
                poster="/assets/editor-demo-poster.png"
                controls
                className="w-full h-full object-cover rounded-lg"
                style={{ maxHeight: 320 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features & Previews */}
      <section id="features" className={theme === 'dark' ? 'py-0 px-2 sm:px-4 bg-[#131a29]' : 'py-0 px-2 sm:px-4 bg-gray-50'}>
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Coluna 1: Editor visual */}
          <div className="max-w-4xl mx-auto mt-16">
            <div>
              <h2 className={theme === 'dark' ? 'text-2xl font-bold mb-2' : 'text-2xl font-bold mb-2 text-gray-900'}>Editor Interativo Clone Inteligente</h2>
              <p className={theme === 'dark' ? 'text-[#cbd5e1] mb-4' : 'text-gray-600 mb-4'}>Crie ou clone landings em segundos com nosso editor visual.</p>
              <div className={theme === 'dark' ? 'rounded-lg bg-[#111827] p-4' : 'rounded-lg bg-white p-4'}>
                <img src={editorImg} className='w-full h-full' alt="" />
              </div>
            </div>
          </div>
          {/* Substituir bloco de Biblioteca de Ofertas + Métricas Inteligentes por um layout lado a lado responsivo */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full mt-8">
            {/* Biblioteca de Ofertas */}
            <div className={theme === 'dark' ? 'flex-[1.5] min-w-0 w-full rounded-lg bg-[#111827] p-4 shadow-md' : 'flex-[1.5] min-w-0 w-full rounded-lg bg-white p-4 shadow-md'}>
              <h2 className={theme === 'dark' ? 'text-2xl font-bold mb-2' : 'text-2xl font-bold mb-2 text-gray-900'}>Biblioteca de Ofertas</h2>
              <p className={theme === 'dark' ? 'text-[#cbd5e1] mb-4' : 'text-gray-600 mb-4'}>Monitore e organize ofertas de concorrentes automaticamente.</p>
              <div className="w-full">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6 pb-4 w-full">
                  {columns.map((column) => (
                    <div key={column.id} className="w-full sm:w-auto flex-1 min-w-0 max-w-full">
                      <Column
                        column={column}
                        offers={mockOffers.filter((offer) => offer.status === column.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Análises de Ofertas Automáticas */}
            <div className={theme === 'dark' ? 'flex-1 min-w-0 w-full rounded-lg bg-[#111827] p-4 shadow-md' : 'flex-1 min-w-0 w-full rounded-lg bg-white p-4 shadow-md'}>
              <h2 className={theme === 'dark' ? 'text-2xl font-bold mb-2' : 'text-2xl font-bold mb-2 text-gray-900'}>Análises de Ofertas Automáticas</h2>
              <p className={theme === 'dark' ? 'text-[#cbd5e1] mb-4' : 'text-gray-600 mb-4'}>Acompanhe o desempenho das suas ofertas sem precisar acessar todo dia. Veja cliques, conversões, CTR e ROI em tempo real.</p>
              <div className="w-full">
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
                }} height={window.innerWidth < 640 ? 120 : window.innerWidth < 1024 ? 180 : 220} />
              </div>
            </div>
          </div>
        </div>
        {/* Proteção AntiClone abaixo do grid */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className={theme === 'dark' ? 'text-2xl font-bold mb-2' : 'text-2xl font-bold mb-2 text-gray-900'}>Proteção AntiClone</h2>
          <p className={theme === 'dark' ? 'text-[#cbd5e1] mb-4' : 'text-gray-600 mb-4'}>Detecta e redireciona clones para você, substitui botões e imagens. Veja abaixo um exemplo de monitoramento:</p>
          <div className={theme === 'dark' ? 'rounded-lg bg-[#111827] p-6 flex flex-col md:flex-row gap-6 items-center' : 'rounded-lg bg-white p-6 flex flex-col md:flex-row gap-6 items-center'}>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2"><span className="font-semibold">🔒 Link protegido:</span> <span className="text-blue-400">https://meusite.com/oferta</span></div>
              <div className="mb-2"><span className="font-semibold">🕵️‍♂️ Clones detectados:</span>
                <ul className="list-disc ml-6 mt-1">
                  <li className="text-red-400">https://clonador1.com/oferta</li>
                  <li className="text-red-400">https://clonador2.com/oferta</li>
                </ul>
              </div>
              <div className="mb-2 flex items-center gap-2"><span className="font-semibold">⚡ Ação configurada:</span> <span>Redirecionar clones para a URL original</span></div>
              <div className="text-xs text-gray-400 mt-2">* Este é um exemplo visual. O monitoramento real ocorre automaticamente.</div>
            </div>
            <div className="flex-1 flex flex-col gap-2 items-center justify-center">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg px-4 py-2 text-sm font-semibold">Proteção ativa</div>
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg px-4 py-2 text-sm">Monitoramento 24/7</div>
              <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg px-4 py-2 text-sm">Ações automáticas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de funcionalidades poderosas */}
      <section className={theme === 'dark' ? 'py-16 bg-gradient-to-b from-[#131a29] to-[#111827]' : 'py-16 bg-gradient-to-b from-blue-50 to-white'}>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className={theme === 'dark' ? 'text-3xl font-bold text-center text-blue-400 mb-2' : 'text-3xl font-bold text-center text-blue-700 mb-2'}>
            Funcionalidades poderosas para sua segurança digital
          </h2>
          <p className={theme === 'dark' ? 'text-center text-lg text-gray-300 mb-10' : 'text-center text-lg text-gray-600 mb-10'}>
            Ferramentas exclusivas criadas para proteger, otimizar e escalar seu desempenho no mercado digital
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} theme={theme} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <a
              href="#planos"
              className={theme === 'dark'
                ? 'px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow hover:bg-blue-800 transition'
                : 'px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition'}
            >
              Experimente todas as funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* Planos e Preços */}
      <section id="planos" className={theme === 'dark' ? 'py-20 px-4 bg-[#111827]' : 'py-20 px-4 bg-white'}>
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className={theme === 'dark' ? 'text-3xl md:text-4xl font-bold mb-4' : 'text-3xl md:text-4xl font-bold mb-4 text-gray-900'}>🧩 Planos e Preços — Tudo o que você precisa para dominar os anúncios</h2>
          <p className={theme === 'dark' ? 'text-xl text-[#cbd5e1]' : 'text-xl text-gray-600'}>Todos os planos incluem:</p>
          <ul className={theme === 'dark' ? 'text-[#cbd5e1] flex flex-wrap gap-3 justify-center mt-4 text-base' : 'text-gray-600 flex flex-wrap gap-3 justify-center mt-4 text-base'}>
            <li className="flex items-center gap-2"><span className="text-green-400">✔</span> Hospedagem premium + SSL gratuito</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✔</span> Extração e download de criativos vencedores</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✔</span> Monitoramento de bibliotecas do Facebook Ads</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✔</span> Clonagem e anticlone (quantidade definida por plano)</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✔</span> Suporte via WhatsApp</li>
          </ul>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div key={plan.id} className={theme === 'dark'
              ? `bg-[#131a29] rounded-xl shadow-lg p-8 flex flex-col items-center border-2 ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-[#2563eb]'}`
              : `bg-white rounded-xl shadow-lg p-8 flex flex-col items-center ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-blue-600'}`
            }>
              <h3 className="text-xl font-bold mb-2">{plan.name === 'starter' ? '🟢 Starter' : plan.name === 'intermediario' ? '🟡 Intermediário' : '🔴 Avançado'}{idx === 1 && <span className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded text-xs font-bold">Recomendado</span>}</h3>
              <div className="text-3xl font-extrabold mb-2">R$ {plan.price},00 <span className="text-base font-normal">/ mês</span></div>
              <ul className={theme === 'dark' ? 'text-[#cbd5e1] mb-6 space-y-1 text-center' : 'text-gray-600 mb-6 space-y-1 text-center'}>
                <li>📊 Monitoramento de até <b>{plan.max_libraries}</b> bibliotecas</li>
                <li>🧬 Até <b>{plan.max_clones}</b> páginas clonadas + {plan.max_anticlone} com anticlone</li>
                {plan.max_cloaker_requests && <li>🛡️ Cloaker incluso com até <b>{plan.max_cloaker_requests.toLocaleString('pt-BR')}</b> requisições/mês</li>}
                {plan.name === 'intermediario' && <li>⚠️ Excedente: R$ 3,00 a cada 1.000 requisições extras</li>}
                {plan.name === 'avancado' && <li>⚠️ Excedente: R$ 2,00 a cada 1.000 requisições extras</li>}
                {Array.isArray(plan.features) && plan.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
              <a href="/register" className={theme === 'dark'
                ? `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-[#2563eb] text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
                : `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
              }>Assinar {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}</a>
            </div>
          ))}
        </div>
        <div className={theme === 'dark' ? 'text-[#cbd5e1] text-center mt-8' : 'text-gray-600 text-center mt-8'}>
          <p>Todos os planos contam com <b>garantia de 7 dias</b>. Cancele sem compromisso caso não ache que é para você.</p>
          <p className="mt-2">O <b>plano intermediário</b> oferece o melhor custo-benefício para quem já faz anúncios e quer escalar com segurança e inteligência.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={theme === 'dark' ? 'py-20 px-4 bg-[#131a29]' : 'py-20 px-4 bg-gray-50'}>
        <div className="max-w-3xl mx-auto">
          <h2 className={theme === 'dark' ? 'text-3xl font-bold mb-8 text-center' : 'text-3xl font-bold mb-8 text-center text-gray-900'}>Perguntas Frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Posso usar o Clonup gratuitamente?',
                a: 'Sim, plano Starter com 7 dias de garantia.'
              },
              {
                q: 'Como funciona o AntiClone?',
                a: 'Detecta clonagens e redireciona todo o tráfego do clone para sua página.'
              },
              {
                q: 'Quando o Cloaker estará disponível?',
                a: 'Em breve! Plano Scale receberá gratuitamente.'
              },
              {
                q: 'O sistema funciona em mobile?',
                a: 'Sim, interface responsiva.'
              }
            ].map((faq, i) => (
              <div key={i} className={theme === 'dark' ? 'bg-[#111827] rounded-lg p-4' : 'bg-white rounded-lg p-4'}>
                <button className="w-full flex justify-between items-center text-lg font-semibold">
                  <span>{faq.q}</span>
                  {/* Ícone de expandir/retrair pode ser adicionado aqui se quiser */}
                </button>
                {/* Resposta pode ser expandida aqui se quiser */}
                <div className={theme === 'dark' ? 'mt-2 text-[#cbd5e1]' : 'mt-2 text-gray-600'}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className={theme === 'dark' ? 'py-20 px-4 bg-[#111827] text-center' : 'py-20 px-4 bg-white text-center'}>
        <div className="max-w-2xl mx-auto">
          <h2 className={theme === 'dark' ? 'text-3xl font-bold mb-4' : 'text-3xl font-bold mb-4 text-gray-900'}>Pronto para escalar suas ofertas?</h2>
          <p className={theme === 'dark' ? 'text-lg text-[#cbd5e1] mb-8' : 'text-lg text-gray-600 mb-8'}>7 dias de garantia total ou seu dinheiro de volta.</p>
          <a href="#planos" className={theme === 'dark' ? 'inline-block px-8 py-3 bg-[#2563eb] text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors' : 'inline-block px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors'}>Comece já no Clonup</a>
        </div>
      </section>

      {/* Footer */}
      <footer className={theme === 'dark' ? 'pt-12 pb-6 bg-[#131a29] border-t border-[#374151] text-center' : 'pt-12 pb-6 bg-gray-100 border-t border-gray-200 text-center'}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4">
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            <img src={logo} alt="Clonup logo" className="w-8 h-8 mb-2" />
            <span className="text-lg font-bold">Clonup</span>
            <div className="flex gap-4 mt-2">
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center md:justify-items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Recursos</a>
                </li>
                <li>
                  <a href="#planos" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Preços</a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">FAQ</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sobre</a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacidade</a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Termos de Uso</a>
                </li>
                {/* <li>
                  <a href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Carreiras</a>
                </li> */}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contato</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:contato@offertrack.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contato
                  </a>
                </li>
                {/* <li>
                  <a href="https://twitter.com/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    LinkedIn
                  </a>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} OfferTrack. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function LandingPageHeader() {
  const { theme, toggleTheme } = useThemeStore();
  const logo = theme === 'dark' ? logoDark : logoLight;
  return (
    <header className={theme === 'dark' ? 'fixed w-full top-0 z-50 bg-[#131a29] border-b border-[#374151]' : 'fixed w-full top-0 z-50 bg-white border-b border-gray-200'}>
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Clonup logo" className="w-8 h-8" />
          <span className="text-xl font-bold">Clonup</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Recursos</a>
          <a href="#planos" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Planos</a>
          <a href="#faq" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>FAQ</a>
          <a href="/login" className={theme === 'dark' ? 'hover:text-[#2563eb]' : 'hover:text-blue-600'}>Entrar</a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
        <a href="#planos" className={theme === 'dark' ? 'ml-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors' : 'ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'}>Começar</a>
      </nav>
    </header>
  );
}

export function LandingPageFooter() {
  const { theme } = useThemeStore();
  const logo = theme === 'dark' ? logoDark : logoLight;
  return (
    <footer className={theme === 'dark' ? 'pt-12 pb-6 bg-[#131a29] border-t border-[#374151] text-center' : 'pt-12 pb-6 bg-gray-100 border-t border-gray-200 text-center'}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4">
        <div className="flex flex-row items-center md:items-start mb-8 md:mb-0 justify-center gap-2">
          <img src={logo} alt="Clonup logo" className="w-8 h-8 mb-2" />
          <span className="text-lg font-bold">Clonup</span>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center md:justify-items-start">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Recursos</a>
              </li>
              <li>
                <a href="#planos" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Preços</a>
              </li>
              <li>
                <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">FAQ</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sobre</a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacidade</a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Termos de Uso</a>
              </li>
              {/* <li>
                  <a href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="/careers" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Carreiras</a>
                </li> */}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contato@offertrack.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato
                </a>
              </li>
              {/* <li>
                  <a href="https://twitter.com/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    LinkedIn
                  </a>
                </li> */}
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-center text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} OfferTrack. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}