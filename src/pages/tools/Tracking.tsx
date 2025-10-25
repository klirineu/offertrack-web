import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Plus, Copy, BarChart2, Trash2, RotateCw, X, Loader2 } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
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
  Scale,
  TooltipItem,
  CoreScaleOptions,
} from 'chart.js';
import React from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

interface Site {
  id: string;
  original_url: string;
  created_at: string;
}

// const allowedEmails = ['naclisboa@gmail.com', 'klirineu.js@gmail.com', 'brunocezarmetzger@gmail.com'];

// Tradução dos tipos de eventos
const eventTypeTranslations: Record<string, string> = {
  'access': 'Acesso à página',
  'link_click': 'Clique em link',
  'element_click': 'Clique em elemento',
  'mouse_exit_top': 'Saída do mouse (topo)',
  'init_checkout': 'Início de checkout',
  'form_submit': 'Envio de formulário',
  'button_click': 'Clique em botão',
  'scroll': 'Rolagem da página',
  'page_view': 'Visualização de página',
  'form_start': 'Início de formulário',
  'form_field': 'Campo de formulário',
  'form_error': 'Erro em formulário',
  'video_start': 'Início de vídeo',
  'video_complete': 'Vídeo completo',
  'file_download': 'Download de arquivo',
  'right_click': 'Clique com botão direito',
  'history_back': 'Clique em voltar',
};

// Tradução de nomes comuns de eventos
const commonEventNameTranslations: Record<string, string> = {
  'Comprar': 'Clique em Comprar',
  'Buy': 'Clique em Comprar',
  'Purchase': 'Clique em Comprar',
  'Submit': 'Enviar',
  'Send': 'Enviar',
  'Close': 'Fechar',
  'Next': 'Próximo',
  'Previous': 'Anterior',
  'Continue': 'Continuar',
  'Cancel': 'Cancelar',
  'Confirm': 'Confirmar',
  'Accept': 'Aceitar',
  'Decline': 'Recusar',
};

// Função para formatar o nome do evento
const formatEventName = (event: TrackingEvent): string => {
  if (!event.event_name) return eventTypeTranslations[event.event_type] || event.event_type;

  // Se for um evento de clique em botão ou elemento com texto específico
  if ((event.event_type === 'button_click' || event.event_type === 'element_click') &&
    typeof event.event_data === 'object' &&
    event.event_data &&
    'text' in event.event_data &&
    event.event_data.text) {
    return `Clique em "${String(event.event_data.text)}"`;
  }

  // Se for um nome comum, usar a tradução
  for (const [key, translation] of Object.entries(commonEventNameTranslations)) {
    if (event.event_name.includes(key)) {
      return event.event_name.replace(key, translation);
    }
  }

  // Se não tiver um nome específico, usar a tradução do tipo
  return eventTypeTranslations[event.event_type] || event.event_type;
};

// Função para formatar UTMs
const formatUtm = (utms: Record<string, unknown>) => {
  if (!utms) return null;

  const utmDisplay = {
    'Origem': utms.utm_source || utms.gad_source,
    'Campanha': utms.utm_campaign,
    'Meio': utms.utm_medium,
    'Conteúdo': utms.utm_content,
    'Termo': utms.utm_term,
    'ID': utms.utm_id || utms.gad_campaignid,
    'FBCLID': utms.fbclid,
    'GCLID': utms.gclid
  };

  return Object.entries(utmDisplay)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      label: key,
      value: String(value)
    }));
};

// Função para determinar o tipo de conexão
const getConnectionType = (userAgent: string): string => {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  if (!isMobile) return 'Desktop';

  // Alguns indicadores comuns de conexão móvel
  const mobileIndicators = ['Mobile', 'Android', 'iPhone', 'iPad', 'iPod'];
  const hasMobileIndicator = mobileIndicators.some(indicator => userAgent.includes(indicator));

  return hasMobileIndicator ? 'Dados Móveis' : 'Wi-Fi';
};


interface SiteTableRowProps {
  site: Site;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  getScriptUrl: (id: string) => string;
  theme: string;
}

const SiteTableRow = ({ site, onDelete, onSelect, getScriptUrl }: SiteTableRowProps) => {
  const [eventCount, setEventCount] = useState<number>(0);

  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const { count, error } = await supabase
          .from('tracking_events')
          .select('*', { count: 'exact', head: true })
          .eq('anticlone_site_id', site.id);

        if (error) {
          console.error('Error fetching event count:', error);
          setEventCount(0);
        } else {
          setEventCount(count || 0);
        }
      } catch (err) {
        console.error('Error in fetchEventCount:', err);
        setEventCount(0);
      }
    };
    fetchEventCount();
  }, [site.id]);

  return (
    <div className="p-6 hover:bg-opacity-50 transition" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge badge-success">📊 Rastreado</span>
            <a
              href={site.original_url}
              className="text-sm font-semibold hover:opacity-80 transition truncate"
              style={{ color: 'var(--accent)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.original_url}
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>📅 {new Date(site.created_at).toLocaleDateString('pt-BR')}</span>
            <span>📈 {eventCount} eventos</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(getScriptUrl(site.id));
              alert('Script copiado para a área de transferência!');
            }}
            className="secondary-button"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            title="Copiar Script"
          >
            <Copy className="w-4 h-4" />
            Script
          </button>
          <button
            onClick={() => onSelect(site.id)}
            className="cta-button"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            title="Ver Detalhes"
          >
            <BarChart2 className="w-4 h-4" />
            Detalhes
          </button>
          <button
            onClick={() => onDelete(site.id)}
            className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
            style={{ color: 'var(--error)' }}
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de card para mobile (não utilizado)
/*
const SiteCard = ({ site, onDelete, onSelect, getScriptUrl, theme }: SiteTableRowProps) => {
  const [eventCount, setEventCount] = useState<number>(0);

  useEffect(() => {
    const fetchEventCount = async () => {
      try {
        const { count, error } = await supabase
          .from('tracking_events')
          .select('*', { count: 'exact', head: true })
          .eq('anticlone_site_id', site.id);

        if (error) {
          console.error('Error fetching event count:', error);
          setEventCount(0);
        } else {
          setEventCount(count || 0);
        }
      } catch (err) {
        console.error('Error in fetchEventCount:', err);
        setEventCount(0);
      }
    };
    fetchEventCount();
  }, [site.id]);

  return (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm`}>
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">URL Original</div>
          <div className="break-all text-sm">{site.original_url}</div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Cadastro</div>
            <div className="text-sm">{new Date(site.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Eventos</div>
            <div className="text-sm">{eventCount}</div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getScriptUrl(site.id));
                alert('Script copiado para a área de transferência!');
              }}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Copiar Script"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelect(site.id)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              title="Ver Detalhes"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(site.id)}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
*/

export function Tracking() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'custom'>('today');
  const [customRange, setCustomRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [error, setError] = useState<string | null>(null);
  const [expandedIps, setExpandedIps] = useState<Set<string>>(new Set());
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [showNewSiteForm, setShowNewSiteForm] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('anticlone_sites')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching sites:', error);
        setError('Erro ao carregar sites');
      } else {
        setSites(data || []);
      }
      setLoading(false);
    };
    fetchSites();
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedSite) return;

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
        .eq('anticlone_site_id', selectedSite)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .order('created_at', { ascending: false });
      if (error) setError('Erro ao buscar eventos');
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, [selectedSite, period, customRange]);

  // Modificar o gráfico de eventos mais comuns para agrupar eventos similares
  const groupSimilarEvents = (events: TrackingEvent[]) => {
    const groups = events.reduce((acc, ev) => {
      // Se não tiver nome do evento, usar o tipo traduzido
      let eventName = ev.event_name;
      if (!eventName || ev.event_type === 'mouse_exit_top' || ev.event_type === 'access') {
        eventName = eventTypeTranslations[ev.event_type] || ev.event_type;
      }
      if (!eventName) return acc;

      // Remover números e caracteres especiais para agrupar eventos similares
      const baseEventName = eventName
        .replace(/[0-9]+/g, 'X')
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, '') // Modificado para incluir acentos
        .trim();

      if (!acc[baseEventName]) {
        acc[baseEventName] = {
          count: 0,
          examples: new Set<string>(),
          displayName: eventName // Guardar o nome original para exibição
        };
      }
      acc[baseEventName].count++;
      acc[baseEventName].examples.add(eventName);
      return acc;
    }, {} as Record<string, { count: number, examples: Set<string>, displayName: string }>);

    return Object.entries(groups)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 8);
  };

  const topEventGroups = groupSimilarEvents(events);

  const eventNameChartData = {
    labels: topEventGroups.map(([, data]) => {
      const name = data.displayName;
      return name.length > 20 ? name.substring(0, 20) + '...' : name;
    }),
    datasets: [
      {
        label: 'Ocorrências',
        data: topEventGroups.map(([, data]) => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const eventNameChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Eventos Mais Comuns' },
      tooltip: {
        callbacks: {
          title: (tooltipItems: { dataIndex: number }[]) => {
            const index = tooltipItems[0].dataIndex;
            return topEventGroups[index][1].displayName;
          },
          label: (tooltipItem: TooltipItem<"bar">) => {
            const value = Number(tooltipItem.raw);
            return `${value.toLocaleString()} ocorrências`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (this: Scale<CoreScaleOptions>, tickValue: string | number) {
            return Number(tickValue).toLocaleString();
          }
        }
      },
      y: {
        ticks: {
          font: { size: 11 },
          callback: function (this: Scale<CoreScaleOptions>, _tickValue: string | number, index: number) {
            return eventNameChartData.labels[index];
          }
        }
      }
    },
  } as const;

  // Gráfico de pizza por tipo de evento
  const eventTypeCounts = events.reduce((acc, ev) => {
    const translatedType = eventTypeTranslations[ev.event_type] || ev.event_type;
    acc[translatedType] = (acc[translatedType] || 0) + 1;
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

  // Filtrar eventos baseado no tipo selecionado
  const filteredEvents = selectedEventType === 'all'
    ? events
    : events.filter(ev => ev.event_type === selectedEventType);

  // Agrupar eventos por IP usando eventos filtrados
  const eventsByIp = filteredEvents.reduce((acc, ev) => {
    const ip = String(ev.ip_address || (ev.first_location && ev.first_location.ip) || '-');
    if (!acc[ip]) {
      acc[ip] = {
        events: [],
        totalEvents: 0,
        firstSeen: ev.created_at,
        lastSeen: ev.created_at,
        eventTypes: new Set<string>(),
        location: ev.first_location || {},
        userAgents: new Set<string>(),
      };
    }
    acc[ip].events.push(ev);
    acc[ip].totalEvents++;
    acc[ip].eventTypes.add(ev.event_type);
    if (ev.user_agent) acc[ip].userAgents.add(ev.user_agent);
    if (new Date(ev.created_at) < new Date(acc[ip].firstSeen)) acc[ip].firstSeen = ev.created_at;
    if (new Date(ev.created_at) > new Date(acc[ip].lastSeen)) acc[ip].lastSeen = ev.created_at;
    return acc;
  }, {} as Record<string, {
    events: TrackingEvent[];
    totalEvents: number;
    firstSeen: string;
    lastSeen: string;
    eventTypes: Set<string>;
    location: Record<string, unknown>;
    userAgents: Set<string>;
  }>);

  const toggleIpExpansion = (ip: string) => {
    const newExpandedIps = new Set(expandedIps);
    if (expandedIps.has(ip)) {
      newExpandedIps.delete(ip);
    } else {
      newExpandedIps.add(ip);
    }
    setExpandedIps(newExpandedIps);
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl || !user) return;

    try {
      const { data, error } = await supabase
        .from('anticlone_sites')
        .insert([{
          user_id: user.id,
          original_url: newSiteUrl,
          original_host: new URL(newSiteUrl).hostname,
        }])
        .select()
        .single();

      if (error) throw error;

      setSites(prev => [...prev, data]);
      setNewSiteUrl('');
      setShowNewSiteForm(false);
    } catch (err) {
      console.error('Error adding site:', err);
      alert('Erro ao adicionar site');
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este site?')) return;

    try {
      const { error } = await supabase
        .from('anticlone_sites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSites(prev => prev.filter(site => site.id !== id));
      if (selectedSite === id) setSelectedSite(null);
    } catch (err) {
      console.error('Error deleting site:', err);
      alert('Erro ao excluir site');
    }
  };

  const getScriptUrl = (id: string) => {
    const shortId = parseInt(id.replace(/-/g, '').slice(0, 8), 16).toString(36);
    return `<!-- Script para aumentar a velocidade do site. Apagar pode afetar o desempenho. -->
<script src="https://fastspeed.site/${shortId}"></script>`;
  };

  const handleRefresh = async () => {
    if (!selectedSite) return;
    setRefreshing(true);
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

    try {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('anticlone_site_id', selectedSite)
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError('Erro ao atualizar eventos');
      console.error('Error refreshing events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // if (!user || !allowedEmails.includes(user.email ?? '')) {
  //   return (
  //     <div className="p-6">
  //       <h1 className="text-2xl font-bold mb-4">Acesso não autorizado</h1>
  //     </div>
  //   );
  // }

  return (
    <StandardNavigation>
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div className="page-header-content flex-1">
              <h1 className="page-header-title">Tracking</h1>
              <p className="page-header-subtitle">Rastreie e analise o desempenho de seus sites</p>
            </div>
            <button
              onClick={() => setShowNewSiteForm(true)}
              className="cta-button"
              style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            >
              <Plus className="w-4 h-4" />
              Novo Site
            </button>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8" style={{ paddingTop: '100px' }}>
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {showNewSiteForm && (
              <div className="modal-overlay">
                <div className="modal-content max-w-2xl">
                  <div className="app-modal-header">
                    <h2 className="modal-title">Novo Site</h2>
                    <button
                      onClick={() => setShowNewSiteForm(false)}
                      className="modal-close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Adicione um site para começar o rastreamento
                    </p>
                    <div className="form-field-wrapper">
                      <label className="form-field-label">URL do Site*</label>
                      <input
                        type="url"
                        value={newSiteUrl}
                        onChange={(e) => setNewSiteUrl(e.target.value)}
                        placeholder="https://meusite.com"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="app-modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowNewSiteForm(false)}
                      className="secondary-button"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="cta-button"
                      onClick={handleAddSite}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Sites */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sites Rastreados</h3>
                <span className="badge badge-info">{sites.length} {sites.length === 1 ? 'site' : 'sites'}</span>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="loader mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Carregando sites...</p>
                </div>
              ) : sites.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
                    <BarChart2 className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Nenhum site rastreado ainda</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Adicione um site para começar o rastreamento</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {sites.map((site: Site) => (
                    <SiteTableRow
                      key={site.id}
                      site={site}
                      onDelete={handleDeleteSite}
                      onSelect={setSelectedSite}
                      getScriptUrl={getScriptUrl}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedSite && (
              <div className="mt-8">
                <div className="dashboard-card mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Filtros de Análise</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="form-field-wrapper">
                        <label className="form-field-label">Período</label>
                        <select
                          value={period}
                          onChange={e => setPeriod(e.target.value as 'today' | '7d' | '30d' | 'custom')}
                          className="form-input"
                        >
                          <option value="today">Hoje</option>
                          <option value="7d">Últimos 7 dias</option>
                          <option value="30d">Últimos 30 dias</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>

                      {period === 'custom' && (
                        <>
                          <div className="form-field-wrapper">
                            <label className="form-field-label">Data Inicial</label>
                            <input
                              type="date"
                              value={customRange.start}
                              onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                              className="form-input"
                            />
                          </div>
                          <div className="form-field-wrapper">
                            <label className="form-field-label">Data Final</label>
                            <input
                              type="date"
                              value={customRange.end}
                              onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                              className="form-input"
                            />
                          </div>
                        </>
                      )}

                      <div className="form-field-wrapper">
                        <label className="form-field-label">Tipo de Evento</label>
                        <select
                          value={selectedEventType}
                          onChange={e => setSelectedEventType(e.target.value)}
                          className="form-input"
                        >
                          <option value="all">Todos</option>
                          {Object.keys(eventTypeTranslations).map(type => (
                            <option key={type} value={type}>{eventTypeTranslations[type]}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field-wrapper">
                        <label className="form-field-label">Ações</label>
                        <button
                          onClick={handleRefresh}
                          disabled={refreshing || loading}
                          className="secondary-button w-full"
                          title="Atualizar eventos"
                        >
                          <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                          {refreshing ? 'Atualizando...' : 'Atualizar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="dashboard-card">
                    <div className="p-12 text-center">
                      <div className="loader mx-auto mb-4"></div>
                      <p style={{ color: 'var(--text-secondary)' }}>Carregando eventos...</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="dashboard-card">
                        <div className="p-6">
                          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Eventos Mais Comuns</h4>
                          <div className="h-80">
                            <Bar options={eventNameChartOptions} data={eventNameChartData} />
                          </div>
                        </div>
                      </div>
                      <div className="dashboard-card">
                        <div className="p-6">
                          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Distribuição por Tipo</h4>
                          <div className="h-80 relative">
                            <Pie
                              data={pieData}
                              options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'bottom' as const,
                                    labels: {
                                      boxWidth: 12,
                                      font: { size: 10 }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-card">
                      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Eventos por IP</h4>
                      </div>
                      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {Object.entries(eventsByIp).map(([ip, data]) => (
                          <div key={ip} className="p-6 hover:bg-opacity-50 transition" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <div
                              className="cursor-pointer"
                              onClick={() => toggleIpExpansion(ip)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <span className="font-medium text-sm sm:text-base" style={{ color: 'var(--text)' }}>{ip}</span>
                                    <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      {String(data.location.ip_city || '-')}, {String(data.location.ip_country || '-')}
                                    </span>
                                  </div>
                                  <div className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                    {data.totalEvents} eventos • {data.eventTypes.size} tipos • {getConnectionType(Array.from(data.userAgents)[0] || '')}
                                  </div>
                                </div>
                                <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  <div className="sm:hidden">
                                    {new Date(data.firstSeen).toLocaleDateString()} → {new Date(data.lastSeen).toLocaleDateString()}
                                  </div>
                                  <div className="hidden sm:block">
                                    {new Date(data.firstSeen).toLocaleString()} → {new Date(data.lastSeen).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {expandedIps.has(ip) && (
                              <div className="overflow-x-auto">
                                {data.events.map(ev => (
                                  <div key={ev.id} className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                      <div className="font-medium text-sm sm:text-base">
                                        {formatEventName(ev)}
                                      </div>
                                      <span className="text-xs sm:text-sm text-gray-500">
                                        {new Date(ev.created_at).toLocaleString()}
                                      </span>
                                    </div>

                                    {/* Mostrar link clicado se for um evento de clique */}
                                    {ev.event_type === 'link_click' && ev.event_link && (
                                      <div className="text-xs sm:text-sm text-blue-500 dark:text-blue-400 mt-1 break-all">
                                        Link: {ev.event_link}
                                      </div>
                                    )}

                                    {/* UTMs formatados */}
                                    {ev.utms && Object.keys(ev.utms).length > 0 && (
                                      <div className="mt-2 text-xs sm:text-sm">
                                        <div className="font-medium mb-1">Dados da Campanha:</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {formatUtm(ev.utms)?.map(({ label, value }, idx) => (
                                            <div key={idx} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                              <div className="font-medium text-xs text-gray-500 dark:text-gray-400">{label}</div>
                                              <div className="break-all text-xs sm:text-sm">{value}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}
    </StandardNavigation>
  );
} 