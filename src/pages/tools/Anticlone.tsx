import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, ArrowLeft, Plus, Copy, ExternalLink, Shield, Wrench, BarChart2 } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useAnticloneStore } from '../../store/anticloneStore';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import React from 'react';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type ActionType = 'redirect' | 'replace_links' | 'replace_images';

interface ClonedDomain {
  url: string;
  domain: string;
  firstSeen: string;
  lastAccess: string;
  accessCount: number;
  status: string;
  similarityScore: number;
  actions: {
    type: ActionType;
    data: string;
  }[];
}

interface Site {
  id: string;
  original_url: string;
  created_at: string;
  action_type: ActionType;
  action_data: string;
}

interface TrackingEvent {
  id: string;
  anticlone_site_id: string;
  event_type: string;
  ip_address: string;
  event_name: string;
  event_link?: string;
  count: number;
  event_data: Record<string, unknown>;
  utms: Record<string, unknown>;
  first_location: Record<string, unknown>;
  last_location: Record<string, unknown>;
  first_at: string;
  last_at: string;
  user_agent: string;
  session_id: string;
  created_at: string;
}

const allowedEmails = ['naclisboa@gmail.com', 'klirineu.js@gmail.com', 'brunocezarmetzger@gmail.com'];

const SiteTableRow = ({ site, onDelete, onSelect, getScriptUrl, theme, onTrack }: {
  site: Site;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  getScriptUrl: (id: string) => string;
  theme: string;
  onTrack: (id: string) => void;
}) => {
  const [cloneCount, setCloneCount] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCloneCount = async () => {
      try {
        const { count, error } = await supabase
          .from('detected_clones')
          .select('*', { count: 'exact', head: true })
          .eq('anticlone_site_id', site.id);

        if (error) {
          console.error('Error fetching clone count:', error);
          setCloneCount(0);
        } else {
          setCloneCount(count || 0);
        }
      } catch (err) {
        console.error('Error in fetchCloneCount:', err);
        setCloneCount(0);
      }
    };
    fetchCloneCount();
  }, [site.id]);

  return (
    <>
      <tr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <td className="px-6 py-4">{site.original_url}</td>
        <td className="px-6 py-4">{new Date(site.created_at).toLocaleDateString()}</td>
        <td className="px-6 py-4">{cloneCount}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getScriptUrl(site.id));
                alert('Script copiado para a área de transferência!');
              }}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Copiar Script"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSelect(site.id)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Ver Detalhes"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            {user && allowedEmails.includes(user.email ?? '') && (
              <button
                onClick={() => onTrack(site.id)}
                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="Ver Trackeamento"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => onDelete(site.id)}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Excluir"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    </>
  );
};

const ClonedDomainsList = ({ siteId }: { siteId: string }) => {
  const [clones, setClones] = useState<ClonedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();
  const { sites, updateSite } = useAnticloneStore();
  const site = sites.find(s => s.id === siteId);
  const [editingAction, setEditingAction] = useState<{
    type: ActionType;
    data: string;
  }>({
    type: 'redirect',
    data: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchClones = async () => {
      if (site) {
        const { data: clones, error } = await supabase
          .from('detected_clones')
          .select('*')
          .eq('anticlone_site_id', siteId);

        if (error) {
          console.error('Error fetching clones:', error);
          setClones([]);
        } else {
          setClones(clones.map(clone => ({
            url: clone.clone_url,
            domain: new URL(clone.clone_url).hostname,
            firstSeen: clone.created_at,
            lastAccess: clone.last_access,
            accessCount: clone.access_count,
            status: clone.status,
            similarityScore: clone.similarity_score,
            actions: site.action_type ? [{
              type: site.action_type,
              data: site.action_data
            }] : []
          })));
        }
      }
      setLoading(false);
    };
    fetchClones();
  }, [siteId, site]);

  useEffect(() => {
    if (site) {
      setEditingAction({
        type: site.action_type,
        data: site.action_data,
      });
    }
  }, [site]);

  const handleUpdateAction = async () => {
    if (site && editingAction.type && (editingAction.type === 'redirect' || editingAction.data)) {
      await updateSite(site.id, {
        action_type: editingAction.type,
        action_data: editingAction.data
      });
      setSuccessMessage('Ação salva com sucesso!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <h3 className="text-lg font-medium mb-4">Configurar Ação</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Ação</label>
            <select
              value={editingAction.type}
              onChange={(e) => setEditingAction(prev => ({ ...prev, type: e.target.value as ActionType }))}
              className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="redirect">Redirecionar para URL Original</option>
              <option value="replace_links">Alterar URLs dos Links</option>
              <option value="replace_images">Substituir Imagens</option>
            </select>
          </div>

          {editingAction.type !== 'redirect' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {editingAction.type === 'replace_links' ? 'URL para substituir nos links' : 'URL da imagem para substituir'}
              </label>
              <input
                type="url"
                value={editingAction.data}
                onChange={(e) => setEditingAction(prev => ({ ...prev, data: e.target.value }))}
                placeholder={
                  editingAction.type === 'replace_links'
                    ? 'https://seusite.com'
                    : 'https://seusite.com/imagem.jpg'
                }
                className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              />
            </div>
          )}

          {successMessage && (
            <div className="mb-2 p-2 bg-green-100 text-green-700 rounded">{successMessage}</div>
          )}

          <button
            onClick={handleUpdateAction}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Salvar Ação
          </button>
        </div>
      </div>

      {clones.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum clone detectado ainda.</div>
      ) : (
        clones.map((clone) => (
          <div
            key={clone.url}
            className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium break-all">{clone.url}</div>
                  <div className="text-sm text-gray-500">Domínio: {clone.domain}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>Detectado em: {new Date(clone.firstSeen).toLocaleDateString()}</div>
                <div>Último acesso: {new Date(clone.lastAccess).toLocaleDateString()}</div>
                <div>Acessos: {clone.accessCount}</div>
                <div>Status: {clone.status}</div>
                <div>Similaridade: {clone.similarityScore}%</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

import LogoBranco from '../../assets/logo-branco.png';
import IconBranco from '../../assets/ico-branco.png';

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

export function Anticlone() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuth();
  const { sites, isLoading, error, fetchSites, addSite, deleteSite } = useAnticloneStore();

  const [open, setOpen] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [trackingSiteId, setTrackingSiteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
    // eslint-disable-next-line
  }, []);

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl) return;

    const url = new URL(newSiteUrl);
    await addSite({
      original_url: newSiteUrl,
      original_host: url.hostname,
      action_type: 'redirect',
      action_data: ''
    });

    setNewSiteUrl('');
    setShowNewOfferForm(false);
  };

  const handleDeleteSite = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      await deleteSite(id);
    }
  };

  const getScriptUrl = (id: string) => {
    const shortId = parseInt(id.replace(/-/g, '').slice(0, 8), 16).toString(36);
    return `<!-- Script para aumentar a velocidade do site. Apagar pode afetar o desempenho. -->
<script src="https://fastspeed.site/${shortId}"></script>`;
  };

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Please login to use this feature</h1>
      </div>
    );
  }

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
    //     <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Anticlone
                </h1>
                <button
                  onClick={fetchSites}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm ml-2"
                >
                  Atualizar
                </button>
              </div>
              <button
                onClick={() => setShowNewOfferForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Oferta
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {showNewOfferForm && (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <h2 className="text-lg font-semibold mb-4">Nova Oferta</h2>
              <form onSubmit={handleAddSite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL da Oferta*</label>
                  <input
                    type="url"
                    value={newSiteUrl}
                    onChange={(e) => setNewSiteUrl(e.target.value)}
                    placeholder="https://meusite.com/oferta"
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowNewOfferForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="px-6 py-3">URL Original</th>
                    <th className="px-6 py-3">Data Cadastro</th>
                    <th className="px-6 py-3">Clones Detectados</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site: Site) => (
                    <React.Fragment key={site.id}>
                      <SiteTableRow
                        key={site.id}
                        site={site}
                        onDelete={handleDeleteSite}
                        onSelect={setSelectedSite}
                        getScriptUrl={getScriptUrl}
                        theme={theme}
                        onTrack={setTrackingSiteId}
                      />
                      {trackingSiteId === site.id && (
                        <tr>
                          <td colSpan={5}>
                            <TrackingEventsPanel siteId={site.id} onClose={() => setTrackingSiteId(null)} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedSite && (
            <div className={`mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Domínios Clonados</h2>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <ClonedDomainsList siteId={selectedSite} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TrackingEventsPanel({ siteId, onClose }: { siteId: string, onClose: () => void }) {
  const { theme } = useThemeStore();
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'custom'>('today');
  const [customRange, setCustomRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      let fromDate = new Date();
      if (period === 'today') {
        fromDate.setHours(0, 0, 0, 0);
      } else if (period === '7d') {
        fromDate.setDate(fromDate.getDate() - 7);
      } else if (period === '30d') {
        fromDate.setDate(fromDate.getDate() - 30);
      } else if (period === 'custom' && customRange.start) {
        fromDate = new Date(customRange.start);
      }
      const toDate = period === 'custom' && customRange.end ? new Date(customRange.end) : new Date();
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('anticlone_site_id', siteId)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .order('created_at', { ascending: false });
      if (error) setError('Erro ao buscar eventos');
      console.log(data);
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, [siteId, period, customRange]);

  // Agrupar eventos por dia para gráfico
  const eventsByDay = events.reduce((acc, ev) => {
    const day = ev.created_at.slice(0, 10);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = {
    labels: Object.keys(eventsByDay),
    datasets: [
      {
        label: 'Eventos',
        data: Object.values(eventsByDay),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Eventos por Dia' } },
    scales: { y: { beginAtZero: true } },
  };

  // Resumo por event_type
  const summaryByType = Object.values(events.reduce((acc, ev) => {
    if (!acc[ev.event_type]) {
      acc[ev.event_type] = {
        event_type: ev.event_type,
        totalCount: 0,
        uniqueIps: new Set(),
        uniqueUserAgents: new Set(),
      };
    }
    acc[ev.event_type].totalCount += ev.count || 1;
    if (ev.ip_address) acc[ev.event_type].uniqueIps.add(ev.ip_address);
    if (ev.user_agent) acc[ev.event_type].uniqueUserAgents.add(ev.user_agent);
    return acc;
  }, {} as Record<string, { event_type: string, totalCount: number, uniqueIps: Set<string>, uniqueUserAgents: Set<string> }>)).map(row => ({
    event_type: row.event_type,
    totalCount: row.totalCount,
    uniqueIps: row.uniqueIps.size,
    uniqueUserAgents: row.uniqueUserAgents.size,
  }));

  // Gráfico de pizza por tipo de evento
  const eventTypeCounts = events.reduce((acc, ev) => {
    acc[ev.event_type] = (acc[ev.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = {
    labels: Object.keys(eventTypeCounts),
    datasets: [
      {
        data: Object.values(eventTypeCounts),
        backgroundColor: [
          '#3b82f6', '#f59e42', '#10b981', '#ef4444', '#6366f1', '#fbbf24', '#a21caf', '#14b8a6', '#eab308', '#f472b6',
        ],
      },
    ],
  };

  // Gráfico de barras por IP
  const ipCounts = events.reduce((acc, ev) => {
    const ip = String(ev.ip_address || (ev.first_location && ev.first_location.ip) || '-');
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const barIpData = {
    labels: Object.keys(ipCounts),
    datasets: [
      {
        label: 'Eventos por IP',
        data: Object.values(ipCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };
  const barIpOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Eventos por IP' } },
    scales: { y: { beginAtZero: true } },
  };

  // Conversão: init_checkout / access
  const accessCount = eventTypeCounts['access'] || 0;
  const initCheckoutCount = eventTypeCounts['init_checkout'] || 0;
  const conversionRate = accessCount > 0 ? ((initCheckoutCount / accessCount) * 100).toFixed(1) : '0';

  return (
    <div className={`mt-4 mb-8 p-6 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Trackeamento de Eventos</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">Fechar</button>
      </div>
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <label className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>Período:</label>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as 'today' | '7d' | '30d' | 'custom')}
          className={`px-2 py-1 rounded border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value="today">Hoje</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="custom">Personalizado</option>
        </select>
        {period === 'custom' && (
          <>
            <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))} className="px-2 py-1 rounded border" />
            <span>a</span>
            <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))} className="px-2 py-1 rounded border" />
          </>
        )}
      </div>
      {/* Resumo por event_type */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Resumo por Tipo de Evento</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border rounded">
            <thead>
              <tr className={theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}>
                <th className="px-2 py-1 text-center">Tipo</th>
                <th className="px-2 py-1 text-center">Total Ocorrências</th>
                <th className="px-2 py-1 text-center">IPs Únicos</th>
                <th className="px-2 py-1 text-center">User Agents Únicos</th>
              </tr>
            </thead>
            <tbody>
              {summaryByType.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-2">Nenhum evento</td></tr>
              ) : summaryByType.map(row => (
                <tr key={row.event_type} className="border-t">
                  <td className="px-2 py-1 text-center">{row.event_type}</td>
                  <td className="px-2 py-1 text-center">{row.totalCount}</td>
                  <td className="px-2 py-1 text-center">{row.uniqueIps}</td>
                  <td className="px-2 py-1 text-center">{row.uniqueUserAgents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {loading ? <div>Carregando eventos...</div> : error ? <div className="text-red-500">{error}</div> : (
        <>
          {/* Card de conversão access -> init_checkout */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className={`rounded-lg shadow-sm p-4 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} style={{ minWidth: 180 }}>
              <div className="text-xs font-medium mb-1">Conversão para Checkout</div>
              <div className="text-2xl font-bold">{initCheckoutCount} / {accessCount}</div>
              <div className="text-sm">{conversionRate}% dos acessos</div>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm flex flex-col items-center" style={{ width: 320, height: 220 }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              <div className="mt-2 text-sm text-center">Distribuição por Tipo de Evento</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm flex flex-col items-center" style={{ width: 380, height: 220 }}>
              <Bar options={{ ...barIpOptions, maintainAspectRatio: false }} data={barIpData} />
              <div className="mt-2 text-sm text-center">Top IPs por Eventos</div>
            </div>
          </div>
          <div className="mb-6">
            <Bar options={chartOptions} data={chartData} height={120} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-center">Data</th>
                  <th className="px-2 py-1 text-center">Evento</th>
                  <th className="px-2 py-1 text-center">Tipo</th>
                  <th className="px-2 py-1 text-center">IP</th>
                  <th className="px-2 py-1 text-center">UTM</th>
                  <th className="px-2 py-1 text-center">Localização</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id} className="border-t">
                    <td className="px-2 py-1 text-center">{new Date(ev.created_at).toLocaleString()}</td>
                    <td className="px-2 py-1 text-center">{ev.event_name}</td>
                    <td className="px-2 py-1 text-center">{ev.event_type}</td>
                    <td className="px-2 py-1 text-center">{String(ev.ip_address || (ev.first_location && ev.first_location.ip) || '-')}</td>
                    <td className="px-2 py-1 text-center">{String(ev.utms?.utm_source || '-')}</td>
                    <td className="px-2 py-1 text-center">{String(ev.first_location?.ip_city || '-')}, {String(ev.first_location?.ip_country || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}