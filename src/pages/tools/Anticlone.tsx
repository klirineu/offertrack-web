import { useState, useEffect } from 'react';
import { Plus, Shield, Trash2, X, Loader2, Eye } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useAnticloneStore } from '../../store/anticloneStore';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import React from 'react';

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

const ClonedDomainsList = ({ siteId }: { siteId: string }) => {
  const [clones, setClones] = useState<ClonedDomain[]>([]);
  const [loading, setLoading] = useState(true);
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
        action_data: editingAction.data,
      });
      setSuccessMessage('Ação atualizada com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-center text-sm text-gray-500">Carregando clones...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Configurar Ação para Clones</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Ação
            </label>
            <select
              value={editingAction.type}
              onChange={(e) => setEditingAction({ ...editingAction, type: e.target.value as ActionType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="redirect">Redirecionar</option>
              <option value="replace_links">Substituir Links</option>
              <option value="replace_images">Substituir Imagens</option>
            </select>
          </div>
          {editingAction.type !== 'redirect' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dados da Ação
              </label>
              <input
                type="text"
                value={editingAction.data}
                onChange={(e) => setEditingAction({ ...editingAction, data: e.target.value })}
                placeholder="URL ou texto de substituição"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <button
            onClick={handleUpdateAction}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar Ação
          </button>
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Clones Detectados ({clones.length})</h3>
        {clones.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum clone detectado ainda.</p>
        ) : (
          <div className="space-y-4">
            {clones.map((clone, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-2">{clone.domain}</div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Primeira detecção: {new Date(clone.firstSeen).toLocaleString()}</div>
                      <div>Último acesso: {new Date(clone.lastAccess).toLocaleString()}</div>
                      <div>Acessos: {clone.accessCount}</div>
                      <div>Similaridade: {clone.similarityScore}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${clone.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {clone.status}
                    </span>
                    <a
                      href={clone.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Ver
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function Anticlone() {
  const { user } = useAuth();
  const { sites, isLoading, error, fetchSites, addSite, deleteSite } = useAnticloneStore();

  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [newSiteUrl, setNewSiteUrl] = useState('');

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
      action_data: '',
    });
    setNewSiteUrl('');
    setShowNewOfferForm(false);
  };

  const handleDeleteSite = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      await deleteSite(id);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Please login to use this feature</h1>
      </div>
    );
  }

  return (
    <StandardNavigation>
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <Shield className="w-6 h-6" />
            </div>
            <div className="page-header-content flex-1">
              <h1 className="page-header-title">Anticlone</h1>
              <p className="page-header-subtitle">Proteja seus sites contra clonagem</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchSites}
                className="secondary-button"
                style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
              >
                Atualizar
              </button>
              <button
                onClick={() => setShowNewOfferForm(true)}
                className="cta-button"
                style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
              >
                <Plus className="w-4 h-4" />
                Nova Oferta
              </button>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8" style={{ paddingTop: '100px' }}>
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {showNewOfferForm && (
              <div className="modal-overlay">
                <div className="modal-content max-w-2xl">
                  <div className="app-modal-header">
                    <h2 className="modal-title">Nova Oferta</h2>
                    <button
                      onClick={() => setShowNewOfferForm(false)}
                      className="modal-close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Adicione uma URL para monitorar clonagens
                    </p>
                    <div className="form-field-wrapper">
                      <label className="form-field-label">URL da Oferta*</label>
                      <input
                        type="url"
                        value={newSiteUrl}
                        onChange={(e) => setNewSiteUrl(e.target.value)}
                        placeholder="https://meusite.com/oferta"
                        required
                        className="form-input"
                        style={{
                          marginTop: 5
                        }}
                      />
                    </div>
                  </div>
                  <div className="app-modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowNewOfferForm(false)}
                      className="secondary-button"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="cta-button"
                      onClick={handleAddSite}
                    >
                      {isLoading ? (
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
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sites Protegidos</h3>
                <span className="badge badge-info">{sites.length} {sites.length === 1 ? 'site' : 'sites'}</span>
              </div>

              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="loader mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Carregando sites...</p>
                </div>
              ) : sites.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
                    <Shield className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Nenhum site protegido ainda</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Adicione um site para começar a proteção</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {sites.map((site: Site) => (
                    <div key={site.id} className="p-6 hover:bg-opacity-50 transition" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="badge badge-success">🛡️ Protegido</span>
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
                            <span>🔍 0 clones detectados</span>
                            {site.action_type && (
                              <span className="badge badge-info">{site.action_type}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSite(site.id)}
                            className="cta-button"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            <Eye className="w-4 h-4" />
                            Ver Clones
                          </button>
                          <button
                            onClick={() => handleDeleteSite(site.id)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--error)' }}
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSite && (
              <div className="mt-8">
                <div className="dashboard-card">
                  <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Detalhes do Site</h3>
                      <button
                        onClick={() => setSelectedSite(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <ClonedDomainsList siteId={selectedSite} />
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </StandardNavigation>
  );
}