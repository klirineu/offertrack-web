import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, ArrowLeft, Plus, Copy, ExternalLink, Shield, Wrench } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useAnticloneStore } from '../../store/anticloneStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

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

const SiteTableRow = ({ site, onDelete, onSelect, getScriptUrl, theme }: {
  site: Site;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  getScriptUrl: (id: string) => string;
  theme: string;
}) => {
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
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
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

export function Anticlone() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuthStore();
  const { sites, isLoading, error, fetchSites, addSite, deleteSite } = useAnticloneStore();

  const [open, setOpen] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [newSiteUrl, setNewSiteUrl] = useState('');

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

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
    return `<script src="https://production-web.up.railway.app/${shortId}"></script>`;
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
        <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
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
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Anticlone
                </h1>
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
                    <SiteTableRow
                      key={site.id}
                      site={site}
                      onDelete={handleDeleteSite}
                      onSelect={setSelectedSite}
                      getScriptUrl={getScriptUrl}
                      theme={theme}
                    />
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