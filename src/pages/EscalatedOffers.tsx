import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeStore } from '../store/themeStore';
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
  Search,
  Filter,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Edit,
  X
} from 'lucide-react';

interface FilterOptions {
  status: string;
  margin: string;
  minAds: string;
  search: string;
}

export default function EscalatedOffers() {
  const { user, profile } = useAuth();
  const { theme } = useThemeStore();
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
    status: 'all',
    margin: 'all',
    minAds: '10',
    search: ''
  });

  // Verificar se o usuário tem acesso
  const hasAccess = profile?.email === 'klirineu.js@gmail.com' || profile?.email === 'naclisboa@gmail.com';

  useEffect(() => {
    if (hasAccess) {
      fetchEscalatedOffers();
    }
  }, [hasAccess]);

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
    if (filters.status !== 'all' && offer.status !== filters.status) return false;
    if (filters.margin === 'positive' && !offer.margin_positive) return false;
    if (filters.margin === 'negative' && offer.margin_positive) return false;
    if (parseInt(filters.minAds) > 0 && offer.active_ads_count < parseInt(filters.minAds)) return false;
    if (filters.search && !offer.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200';
      case 'inactive': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
      case 'archived': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200';
    }
  };

  const getMarginIcon = (positive: boolean) => {
    return positive ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
    );
  }

  return (
    <StandardNavigation>
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Ofertas Escaladas
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ofertas com margem positiva desde o início - apenas para administradores
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={`mb-6 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Título da oferta..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>

            {/* Margem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Margem
              </label>
              <select
                value={filters.margin}
                onChange={(e) => setFilters(prev => ({ ...prev, margin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="positive">Positiva</option>
                <option value="negative">Negativa</option>
              </select>
            </div>

            {/* Mínimo de Anúncios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mín. Anúncios
              </label>
              <input
                type="number"
                min="0"
                value={filters.minAds}
                onChange={(e) => setFilters(prev => ({ ...prev, minAds: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Ofertas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{offers.length}</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Margem Positiva</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {offers.filter(o => o.margin_positive).length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Anúncios</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {offers.reduce((sum, o) => sum + o.active_ads_count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Análise</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {offers.length > 0 ? new Date(Math.max(...offers.map(o => new Date(o.last_analysis_date).getTime()))).toLocaleDateString() : 'N/A'}
                </p>
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
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className={`group relative overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full`}
              >
                {/* Header do Card */}
                <div className="p-4 flex-shrink-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                        {offer.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                          {offer.status === 'active' ? 'Ativo' : offer.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                        </span>
                        <div className="flex items-center gap-1">
                          {getMarginIcon(offer.margin_positive)}
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {offer.margin_positive ? 'Margem +' : 'Margem -'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditOffer(offer)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                      title="Editar oferta"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                        <p className="text-2xl font-bold text-blue-600">{offer.active_ads_count.toLocaleString()}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Ads</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <p className="text-2xl font-bold text-green-600">
                          {offer.total_analyses > 0 ? Math.round((offer.positive_analyses / offer.total_analyses) * 100) : 0}%
                        </p>
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Taxa Positiva</p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card - Flex grow para ocupar espaço restante */}
                <div className="px-4 pb-4 flex flex-col flex-grow">
                  {/* Links */}
                  <div className="space-y-2 mb-4">
                    <a
                      href={offer.offer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Página da Oferta
                    </a>
                    {offer.landing_page_url && (
                      <a
                        href={offer.landing_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Landing Page
                      </a>
                    )}
                  </div>

                  {/* Tags */}
                  {offer.tags && offer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {offer.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium dark:bg-blue-900/20 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {offer.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium dark:bg-gray-700 dark:text-gray-400">
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-sm hover:shadow-md mt-auto"
                  >
                    {importing === offer.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {importing === offer.id ? 'Importando...' : 'Importar Oferta'}
                  </button>
                </div>

                {/* Indicador de Performance */}
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${offer.margin_positive ? 'bg-green-500' : 'bg-red-500'
                  } shadow-sm`}></div>
              </div>
            ))}
          </div>
        )}
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
