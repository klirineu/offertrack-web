import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, Edit, Trash2, Plus, Download } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useThemeStore } from '../../store/themeStore';
import { useClonesStore } from '../../store/clonesStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

// Permitir tipagem global para o editor
declare global {
  interface Window {
    gjsEditor?: unknown;
  }
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

export default function Editor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [open, setOpen] = useState(false);

  const urlParam = searchParams.get('url');

  const { clones, isLoading: clonesLoading, addClone, removeClone, fetchClones } = useClonesStore();
  const [editorResult, setEditorResult] = useState<{ url: string, id: string } | null>(null);
  const copyRef = useRef<HTMLInputElement>(null);
  const [actionLoading, setActionLoading] = useState<'editor' | 'zip' | null>(null);
  const [cloneUrlToProcess, setCloneUrlToProcess] = useState<string | null>(null);
  const { user, profile } = useAuthStore();

  useEffect(() => {
    fetchClones();
  }, []);

  useEffect(() => {
    if (urlParam) {
      setCloneUrlToProcess(urlParam);
    }

  }, [urlParam]);

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

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'landing-page';
    }
  };

  // Adicionar função para clonar para o editor
  async function handleCloneToEditor(url: string) {
    setActionLoading('editor');
    try {
      const res = await api.post('/api/clone/folder', { url });
      const data = res.data;
      const urlSite = data.url;
      const regex = /\/sites\/([a-f0-9-]+)/;
      const match = urlSite.match(regex);
      await addClone(url, urlSite);
      setEditorResult({ url: urlSite, id: match[1] });
      await fetchClones();

    } catch (err) {
      alert('Erro inesperado ao clonar: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Erro inesperado no handleCloneToEditor:', err);
    } finally {
      setActionLoading(null);
      setCloneUrlToProcess(null);
    }
  }

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
        <header className="w-full shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 z-10">
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clone</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-0">
          <div className="w-full max-w-3xl mx-auto mt-8">
            <button
              onClick={() => setCloneUrlToProcess('')}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Clonar Site
            </button>
            {/* Modal de escolha ao clonar site */}
            {cloneUrlToProcess !== null && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col gap-6 items-center w-full max-w-md">
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">O que deseja fazer?</h2>
                  <input
                    type="url"
                    placeholder="https://exemplo.com"
                    value={cloneUrlToProcess}
                    onChange={e => setCloneUrlToProcess(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  <div className="flex flex-col gap-4 w-full">
                    <button
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg disabled:opacity-60"
                      disabled={actionLoading !== null || !cloneUrlToProcess}
                      onClick={() => handleCloneToEditor(cloneUrlToProcess!)}
                    >
                      {actionLoading === 'editor' ? (
                        <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Processando...</span>
                      ) : (
                        <><Edit className="w-5 h-5" /> Editar no Editor Visual</>
                      )}
                    </button>
                    <button
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-lg disabled:opacity-60"
                      disabled={actionLoading !== null || !cloneUrlToProcess}
                      onClick={async () => {
                        setActionLoading('zip');
                        const res = await api.post('/api/clone/zip', { url: cloneUrlToProcess }, { responseType: 'blob' });
                        setActionLoading(null);
                        if (res.status < 200 || res.status >= 300) return alert('Erro ao baixar ZIP');
                        const blob = res.data;
                        const a = document.createElement('a');
                        a.href = window.URL.createObjectURL(blob);
                        const domain = getDomainFromUrl(cloneUrlToProcess);
                        a.download = `${domain}.zip`;
                        a.click();
                        setCloneUrlToProcess(null);
                      }}
                    >
                      {actionLoading === 'zip' ? (
                        <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Processando...</span>
                      ) : (
                        <><Download className="w-5 h-5" /> Baixar ZIP</>
                      )}
                    </button>
                  </div>
                  <button
                    className="mt-4 text-sm text-gray-500 hover:underline"
                    onClick={() => setCloneUrlToProcess(null)}
                    disabled={actionLoading !== null}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {/* Modal de sucesso após clonar */}
            {editorResult && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col gap-6 items-center w-full max-w-md">
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Site clonado com sucesso!</h2>
                  <input
                    ref={copyRef}
                    value={editorResult.url}
                    readOnly
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                    onFocus={e => e.target.select()}
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        if (copyRef.current) {
                          copyRef.current.select();
                          document.execCommand('copy');
                        }
                      }}
                    >
                      Copiar Link
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => {
                        const urlSite = editorResult.url;
                        const regex = /\/sites\/([a-f0-9-]+)/;
                        const match = urlSite.match(regex);
                        navigate(`/tools/editor-studio?id=${match![1]}`)
                      }}
                    >
                      Ir para o Editor
                    </button>
                  </div>
                  <button
                    className="mt-4 text-sm text-gray-500 hover:underline"
                    onClick={() => { setEditorResult(null); navigate('/tools/clonesites'); }}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-semibold px-6 pt-6 pb-2 text-gray-900 dark:text-white">Sites Clonados</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {clonesLoading ? (
                  <li className="px-6 py-4 text-gray-500 dark:text-gray-400">Carregando...</li>
                ) : clones.length === 0 ? (
                  <li className="px-6 py-4 text-gray-500 dark:text-gray-400">Nenhum site clonado ainda.</li>
                ) : clones.map(clone => (
                  <li key={clone.id} className="flex items-center justify-between px-6 py-4 group hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <div>
                      <a
                        href={clone.url}
                        className="text-blue-600 dark:text-blue-400 underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {clone.url}
                      </a>
                      {clone.original_url && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-semibold">Original:</span> {clone.original_url}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const urlSite = clone.url;
                          const regex = /\/sites\/([a-f0-9-]+)/;
                          const match = urlSite.match(regex);
                          navigate(`/tools/editor-studio?id=${match![1]}`)
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          const urlSite = clone.url;
                          const regex = /\/sites\/([a-f0-9-]+)/;
                          const match = urlSite.match(regex);
                          try {
                            await removeClone(clone.id, match![1]);
                          } catch (err) {
                            alert('Erro ao excluir clone: ' + (err instanceof Error ? err.message : String(err)));
                            console.error('Erro ao excluir clone:', err);
                          }
                        }}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 