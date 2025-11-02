import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeStore } from '../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { StandardNavigation } from '../components/StandardNavigation';
import {
  fetchEscalatedOffersService,
  importEscalatedOfferService,
  editEscalatedOfferService,
  FIXED_TAGS,
  type EscalatedOffer
} from '../services/escalatedOffersService';
import {
  TrendingUp,
  Filter,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Edit,
  X,
  Lock
} from 'lucide-react';

interface FilterOptions {
  escalationLevel: string;
  minAds: string;
}

export default function EscalatedOffers() {
  const { user, profile } = useAuth();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<EscalatedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<EscalatedOffer | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    escalationLevel: 'all',
    minAds: '10'
  });

  // Verificar se o usuário está logado e tem assinatura ativa
  const hasAccess = !!user;
  const hasActiveSubscription = profile?.subscription_status === 'active';

  useEffect(() => {
    if (hasAccess && hasActiveSubscription) {
      fetchEscalatedOffers();
    } else if (hasAccess && !hasActiveSubscription) {
      // Se estiver logado mas não tiver assinatura ativa, redirecionar
      setTimeout(() => {
        alert('Você precisa ter uma assinatura ativa para acessar as Ofertas Escaladas. Redirecionando para a página de planos...');
        navigate('/escolher-plano');
      }, 100);
    }
  }, [hasAccess, hasActiveSubscription, navigate]);

  const fetchEscalatedOffers = async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchEscalatedOffersService();

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error('Erro ao buscar ofertas escaladas:', err);
      setError('Erro ao carregar ofertas escaladas');
    } finally {
      setLoading(false);
    }
  };

  const handleImportOffer = async (escalatedOffer: EscalatedOffer) => {
    if (!user) return;

    try {
      setImporting(escalatedOffer.id);

      const { error } = await importEscalatedOfferService(escalatedOffer.id, user.id);

      if (error) throw error;

      alert('Oferta importada com sucesso!');
    } catch (err) {
      console.error('Erro ao importar oferta:', err);
      alert('Erro ao importar oferta');
    } finally {
      setImporting(null);
    }
  };

  const handleEditOffer = (offer: EscalatedOffer) => {
    setEditingOffer(offer);
    setEditTitle(offer.title);
    setEditTags([...offer.tags]);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingOffer) return;

    try {
      setEditing(editingOffer.id);

      const { error } = await editEscalatedOfferService(
        editingOffer.id,
        editTitle,
        editTags
      );

      if (error) throw error;

      // Atualizar a lista local
      setOffers(prev => prev.map(offer =>
        offer.id === editingOffer.id
          ? { ...offer, title: editTitle, tags: editTags }
          : offer
      ));

      setEditModalOpen(false);
      setEditingOffer(null);
      alert('Oferta editada com sucesso!');
    } catch (err) {
      console.error('Erro ao editar oferta:', err);
      alert('Erro ao editar oferta');
    } finally {
      setEditing(null);
    }
  };

  const handleTagToggle = (tag: string) => {
    setEditTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredOffers = offers.filter(offer => {
    // Filtro por nível de escalação
    if (filters.escalationLevel !== 'all') {
      if (filters.escalationLevel === 'escalando' && offer.active_ads_count > 15) return false;
      if (filters.escalationLevel === 'escalada' && (offer.active_ads_count <= 15 || offer.active_ads_count > 50)) return false;
      if (filters.escalationLevel === 'escaladissima' && offer.active_ads_count <= 50) return false;
    }

    // Filtro por mínimo de anúncios
    if (parseInt(filters.minAds) > 0 && offer.active_ads_count < parseInt(filters.minAds)) return false;

    return true;
  });


  const getEscalationLevel = (activeAdsCount: number) => {
    if (activeAdsCount <= 15) {
      return {
        title: 'Escalando',
        emoji: '🔥',
        color: 'from-orange-400 to-orange-600',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        borderColor: 'border-orange-300 dark:border-orange-700'
      };
    } else if (activeAdsCount <= 50) {
      return {
        title: 'Escalada',
        emoji: '🚀',
        color: 'from-blue-400 to-blue-600',
        textColor: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-300 dark:border-blue-700'
      };
    } else {
      return {
        title: 'Escaladíssima',
        emoji: '💥',
        color: 'from-purple-400 to-purple-600',
        textColor: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-700'
      };
    }
  };

  if (!hasAccess) {
    return (
      <StandardNavigation>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </StandardNavigation>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <StandardNavigation>
        <div className="min-h-screen flex items-center justify-center">
          <div className="dashboard-card max-w-md text-center p-8">
            <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Assinatura Necessária
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Você precisa ter uma assinatura ativa para acessar as Ofertas Escaladas.
            </p>
            <button
              onClick={() => navigate('/escolher-plano')}
              className="cta-button w-full"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </StandardNavigation>
    );
  }

  return (
    <StandardNavigation>
      <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="page-header">
          <div className="page-header-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="page-header-content">
            <h1 className="page-header-title">Ofertas Escaladas</h1>
            <p className="page-header-subtitle">Ofertas com margem positiva desde o início - apenas para administradores</p>
          </div>
        </header>

        <div className="px-4 py-8 lg:px-8" style={{ marginTop: '100px' }}>

          {/* Filtros */}
          <div className="dashboard-card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)', margin: 0 }}>Filtros</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nível de Escalação */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Nível de Escalação
                </label>
                <select
                  value={filters.escalationLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, escalationLevel: e.target.value }))}
                  className="form-input w-full"
                >
                  <option value="all">Todos os Níveis</option>
                  <option value="escalando">🔥 Escalando (até 15 anúncios)</option>
                  <option value="escalada">🚀 Escalada (16 a 50 anúncios)</option>
                  <option value="escaladissima">💥 Escaladíssima (mais de 50 anúncios)</option>
                </select>
              </div>

              {/* Mínimo de Anúncios */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                  Mín. Anúncios
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.minAds}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAds: e.target.value }))}
                  className="form-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <div className="stat-icon">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total de Ofertas</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{offers.length}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Margem Positiva</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {offers.filter(o => o.margin_positive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <div className="stat-icon">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Anúncios</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {offers.reduce((sum, o) => sum + o.active_ads_count, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="flex items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Última Análise</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {offers.length > 0 ? new Date(Math.max(...offers.map(o => new Date(o.last_analysis_date).getTime()))).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas por Nível de Escalação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="pricing-card" style={{ border: '2px solid #f59e0b', padding: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>Escalando</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {offers.filter(o => o.active_ads_count <= 15).length}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>até 15 anúncios</p>
                </div>
              </div>
            </div>

            <div className="pricing-card" style={{ border: '2px solid var(--primary)', padding: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚀</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Escalada</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {offers.filter(o => o.active_ads_count > 15 && o.active_ads_count <= 50).length}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>16 a 50 anúncios</p>
                </div>
              </div>
            </div>

            <div className="pricing-card" style={{ border: '2px solid #a855f7', padding: '1.5rem' }}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">💥</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#a855f7' }}>Escaladíssima</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {offers.filter(o => o.active_ads_count > 50).length}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>mais de 50 anúncios</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Ofertas */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando ofertas...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhuma oferta encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => {
                const escalationLevel = getEscalationLevel(offer.active_ads_count);

                return (
                  <div
                    key={offer.id}
                    className="offer-card"
                    style={{
                      borderColor: escalationLevel.borderColor.includes('orange') ? '#f59e0b' :
                        escalationLevel.borderColor.includes('blue') ? 'var(--primary)' :
                          escalationLevel.borderColor.includes('purple') ? '#a855f7' : 'var(--border)',
                      borderWidth: '2px'
                    }}
                  >
                    {/* Header do Card */}
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-2 leading-tight flex items-center gap-2" style={{ color: 'var(--text)' }}>
                            <span className="text-2xl">{escalationLevel.emoji}</span>
                            <span>{escalationLevel.title}</span>
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`badge ${offer.status === 'active' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                              {offer.status === 'active' ? 'Ativo' : offer.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                            </span>
                            <span className={`badge ${offer.margin_positive ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                              {offer.margin_positive ? 'Margem +' : 'Margem -'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                            e.currentTarget.style.color = 'var(--accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="Editar oferta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Métricas Principais */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="dashboard-card" style={{ padding: '1rem', textAlign: 'center' }}>
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-4 h-4 mr-1" style={{ color: 'var(--primary)' }} />
                            <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{offer.active_ads_count.toLocaleString()}</p>
                          </div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Active Ads</p>
                        </div>
                        <div className="dashboard-card" style={{ padding: '1rem', textAlign: 'center' }}>
                          <div className="flex items-center justify-center mb-1">
                            <CheckCircle className="w-4 h-4 mr-1" style={{ color: 'var(--success)' }} />
                            <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                              {offer.total_analyses > 0 ? Math.round((offer.positive_analyses / offer.total_analyses) * 100) : 0}%
                            </p>
                          </div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Taxa Positiva</p>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo do Card - Flex grow para ocupar espaço restante */}
                    <div className="relative z-10 flex flex-col flex-grow">
                      {/* Links */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <a
                          href={offer.offer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="secondary-button"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Oferta
                        </a>
                        {offer.landing_page_url && (
                          <a
                            href={offer.landing_page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="secondary-button"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Landing
                          </a>
                        )}
                      </div>

                      {/* Tags */}
                      {offer.tags && offer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {offer.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-info"
                              style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                            >
                              {tag}
                            </span>
                          ))}
                          {offer.tags.length > 3 && (
                            <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                              +{offer.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Spacer para empurrar o botão para o bottom */}
                      <div className="flex-grow"></div>

                      {/* Botão de Importar - Sempre no bottom */}
                      <button
                        onClick={() => handleImportOffer(offer)}
                        disabled={importing === offer.id}
                        className="cta-button w-full"
                        style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
                      >
                        {importing === offer.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {importing === offer.id ? 'Importando...' : 'Importar Oferta'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editModalOpen && editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Editar Oferta
                </h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Campo de Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título da Oferta
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Digite o título da oferta"
                  />
                </div>

                {/* Seleção de Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tags ({editTags.length} selecionadas)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {FIXED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${editTags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Selecionadas */}
                {editTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags Selecionadas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {editTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-200"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagToggle(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={editing === editingOffer.id || !editTitle.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {editing === editingOffer.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardNavigation>
  );
}
