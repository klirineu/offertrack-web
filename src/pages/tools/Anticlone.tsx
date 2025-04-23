import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, ArrowLeft, Plus, Copy, ExternalLink, Shield, Wrench } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useAnticloneStore } from '../../store/anticloneStore';
import { useAuth } from '../../contexts/AuthContext';

type ActionType = 'redirect' | 'replace_links' | 'replace_images';

interface ClonedDomain {
  domain: string;
  firstSeen: string;
  actions: {
    type: ActionType;
    data: string;
  }[];
}

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
  const { user } = useAuth();
  const { sites, isLoading, error, fetchSites, addSite, updateSite, deleteSite } = useAnticloneStore();

  const [open, setOpen] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [newAction, setNewAction] = useState<{ type: ActionType; data: string }>({
    type: 'redirect',
    data: ''
  });

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

  const handleUpdateSite = async (id: string, domain: string, action: { type: ActionType; data: string }) => {
    await updateSite(id, {
      action_type: action.type,
      action_data: JSON.stringify({
        domain,
        ...action
      })
    });
  };

  const handleDeleteSite = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      await deleteSite(id);
    }
  };

  const getScriptUrl = (id: string) => {
    return `<script src="${window.location.origin}/anticlone.js?id=${id}"></script>`;
  };

  const getClonedDomains = (site: any): ClonedDomain[] => {
    try {
      const actions = site.action_data ? JSON.parse(site.action_data) : [];
      return Array.isArray(actions) ? actions : [];
    } catch {
      return [];
    }
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
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> }
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
                label: user?.email || 'User',
                href: "/profile",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-300 flex items-center justify-center">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
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
                  {sites.map((site) => (
                    <tr key={site.id} className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className="px-6 py-4">{site.original_url}</td>
                      <td className="px-6 py-4">{new Date(site.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{getClonedDomains(site).length}</td>
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
                            onClick={() => setSelectedSite(site.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            title="Ver Detalhes"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSite(site.id)}
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
              <div className="space-y-4">
                {getClonedDomains(sites.find(s => s.id === selectedSite)).map((clone) => (
                  <div
                    key={clone.domain}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{clone.domain}</span>
                      <span className="text-sm text-gray-500">
                        Detectado em: {new Date(clone.firstSeen).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedDomain === clone.domain ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Tipo de Ação</label>
                          <select
                            value={newAction.type}
                            onChange={(e) => setNewAction({ ...newAction, type: e.target.value as ActionType })}
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                          >
                            <option value="redirect">Redirecionar Site</option>
                            <option value="replace_links">Trocar Links</option>
                            <option value="replace_images">Trocar Imagens</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {newAction.type === 'redirect' ? 'URL de Redirecionamento' :
                              newAction.type === 'replace_links' ? 'Nova URL para Links' :
                                'Nova URL para Imagens'}
                          </label>
                          <input
                            type="url"
                            value={newAction.data}
                            onChange={(e) => setNewAction({ ...newAction, data: e.target.value })}
                            placeholder={
                              newAction.type === 'redirect' ? 'https://redirect.com' :
                                newAction.type === 'replace_links' ? 'https://newlinks.com' :
                                  'https://newimages.com'
                            }
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedDomain(null)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              handleUpdateSite(selectedSite, clone.domain, newAction);
                              setSelectedDomain(null);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm">
                          {clone.actions?.length > 0 ? (
                            <div className="space-y-1">
                              {clone.actions.map((action, idx) => (
                                <span key={idx} className="text-green-600 dark:text-green-400 block">
                                  {action.type === 'redirect' ? 'Redirecionando para: ' :
                                    action.type === 'replace_links' ? 'Trocando links para: ' :
                                      'Trocando imagens para: '}
                                  {action.data}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Nenhuma ação configurada
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDomain(clone.domain);
                            setNewAction({
                              type: clone.actions?.[0]?.type || 'redirect',
                              data: clone.actions?.[0]?.data || ''
                            });
                          }}
                          className="px-3 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Configurar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}