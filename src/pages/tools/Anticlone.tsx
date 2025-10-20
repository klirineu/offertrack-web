import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { ArrowLeft, Plus, Copy, ExternalLink, Shield, Trash2 } from 'lucide-react';
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

interface SiteTableRowProps {
  site: Site;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  getScriptUrl: (id: string) => string;
  theme: string;
}

const SiteTableRow = ({ site, onDelete, onSelect, getScriptUrl, theme }: SiteTableRowProps) => {
  const [cloneCount, setCloneCount] = useState<number>(0);

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
          <button
            onClick={() => onDelete(site.id)}
            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Excluir"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Componente de card para mobile
const SiteCard = ({ site, onDelete, onSelect, getScriptUrl, theme }: SiteTableRowProps) => {
  const [cloneCount, setCloneCount] = useState<number>(0);

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
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Clones Detectados</div>
            <div className="text-sm">{cloneCount}</div>
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
              <ExternalLink className="w-4 h-4" />
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
      <div className={`p-4 sm:p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <h3 className="text-lg font-medium mb-4">Configurar Ação</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Ação</label>
            <select
              value={editingAction.type}
              onChange={(e) => setEditingAction(prev => ({ ...prev, type: e.target.value as ActionType }))}
              className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${theme === 'dark'
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
                className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${theme === 'dark'
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
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Salvar Ação
          </button>
        </div>
      </div>

      {clones.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhum clone detectado ainda.</div>
      ) : (
        <div className="space-y-4">
          {clones.map((clone) => (
            <div
              key={clone.url}
              className={`p-4 sm:p-6 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
            >
              <div className="space-y-3">
                <div>
                  <div className="font-medium break-all text-sm sm:text-base">{clone.url}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Domínio: {clone.domain}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-500">
                  <div>Detectado em: {new Date(clone.firstSeen).toLocaleDateString()}</div>
                  <div>Último acesso: {new Date(clone.lastAccess).toLocaleDateString()}</div>
                  <div>Acessos: {clone.accessCount}</div>
                  <div>Status: {clone.status}</div>
                  <div>Similaridade: {clone.similarityScore}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Anticlone
                  </h1>
                </div>
                <button
                  onClick={fetchSites}
                  className="w-full sm:w-auto px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
                >
                  Atualizar
                </button>
              </div>
              <button
                onClick={() => setShowNewOfferForm(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Oferta
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {showNewOfferForm && (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                    className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowNewOfferForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Desktop Table */}
          <div className={`hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                      />
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {sites.map((site: Site) => (
              <SiteCard
                key={site.id}
                site={site}
                onDelete={handleDeleteSite}
                onSelect={setSelectedSite}
                getScriptUrl={getScriptUrl}
                theme={theme}
              />
            ))}
          </div>

          {selectedSite && (
            <div className={`mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold">Domínios Clonados</h2>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>
              </div>
              <ClonedDomainsList siteId={selectedSite} />
            </div>
          )}
        </main>
      </div>
    </StandardNavigation>
  );
}

