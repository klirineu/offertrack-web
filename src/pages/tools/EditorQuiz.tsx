import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, Plus, Download, Loader2, Trash2 } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';
import { fetchQuizzesService, getQuizLimitForUser, addQuizService, removeQuizService, ClonedQuiz } from '../../services/quizzesService';
import api from '../../services/api';
import { supabase } from '../../lib/supabase';

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

export default function EditorQuiz() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<ClonedQuiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [actionLoading, setActionLoading] = useState<'zip' | 'save' | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ limit: number | null, price: number | null }>({ limit: null, price: null });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

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
    //     <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
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

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!user) return;
      setQuizzesLoading(true);
      const { data, error } = await fetchQuizzesService(user.id);
      if (error) console.error('Erro ao carregar quizzes:', error);
      if (data) setQuizzes(data);
      setQuizzesLoading(false);
    };
    loadQuizzes();
  }, [user]);

  useEffect(() => {
    const fetchLimit = async () => {
      if (!user) return;
      const { limit, price } = await getQuizLimitForUser(user.id);
      setLimitInfo({ limit, price });
    };
    fetchLimit();
  }, [user]);

  function validateSubdomain(value: string) {
    if (!/^[a-zA-Z0-9-]{1,10}$/.test(value)) {
      return "Use até 10 letras, números ou hífen (-)";
    }
    return null;
  }

  async function checkSubdomainUnique(sub: string) {
    const { data: site } = await supabase.from("cloned_sites_subdomains").select("subdomain").eq("subdomain", sub).single();
    const { data: quiz } = await supabase.from("cloned_quiz_subdomains").select("subdomain").eq("subdomain", sub).single();
    return !site && !quiz;
  }

  const handleCloneQuiz = async (type: 'zip' | 'save', subdomainAtualizado: string) => {
    if (!user) return;
    setErrorMsg(null);
    setActionLoading(type);
    try {
      // Verificar limite antes de enviar
      if (limitInfo.limit !== null && limitInfo.limit !== -1 && quizzes.length >= limitInfo.limit) {
        setErrorMsg(`Limite de quizzes atingido para seu plano (${limitInfo.limit}).`);
        setActionLoading(null);
        return;
      }
      if (type === 'zip') {
        // Chamada para baixar ZIP
        const res = await api.post('/api/clone/quiz/zip', { url: originalUrl, checkoutUrl }, { responseType: 'blob' });
        setActionLoading(null);
        if (res.status < 200 || res.status >= 300) {
          setErrorMsg('Erro ao baixar ZIP');
          return;
        }
        const blob = res.data;
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = 'quiz-clonado.zip';
        a.click();
        setModalOpen(false);
        setOriginalUrl('');
        setCheckoutUrl('');
        return;
      } else {
        // Chamada para clonar e hospedar quiz

        const res = await api.post('/api/clone/quiz/save', { url: originalUrl, checkoutUrl, subdomain: subdomainAtualizado });
        if (res.status < 200 || res.status >= 300) {
          setErrorMsg('Erro ao clonar quiz para hospedagem');
          setActionLoading(null);
          return;
        }
        const { url, subdomain } = res.data;
        // Salvar no banco
        const { error } = await addQuizService(user.id, originalUrl, checkoutUrl, subdomain, url);
        if (error) {
          setErrorMsg('Erro ao salvar quiz clonado no banco.');
          setActionLoading(null);
          return;
        }
        // Atualizar lista de quizzes
        const { data: quizzesData, error: quizzesError } = await fetchQuizzesService(user.id);
        if (quizzesError) console.error('Erro ao carregar quizzes:', quizzesError);
        if (quizzesData) setQuizzes(quizzesData);
        setModalOpen(false);
        setOriginalUrl('');
        setCheckoutUrl('');
      }
    } catch (err) {
      setErrorMsg('Erro inesperado ao clonar quiz.');
      console.error('Erro ao clonar quiz:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuiz = async (quiz: ClonedQuiz) => {
    if (!user) return;
    if (!quiz.subdomain) {
      alert('Não foi possível identificar o subdomínio do quiz clonado.');
      return;
    }
    setDeleteLoadingId(quiz.id);
    try {
      await removeQuizService(user.id, quiz.id, quiz.subdomain);
      // Atualizar lista de quizzes
      const { data: quizzesData, error: quizzesError } = await fetchQuizzesService(user.id);
      if (quizzesError) console.error('Erro ao carregar quizzes:', quizzesError);
      if (quizzesData) setQuizzes(quizzesData);
    } catch (err) {
      alert('Erro ao excluir quiz: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Erro ao excluir quiz:', err);
    } finally {
      setDeleteLoadingId(null);
    }
  };

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
                label: user?.email || 'Usuário',
                href: "/profile",
                icon: (
                  <img
                    src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.email || 'U')}
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quizzes Clonados</h1>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-0">
          <div className="w-full max-w-3xl mx-auto mt-8">
            {/* Aviso de BETA e clone de quiz inlead */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-900 font-semibold text-sm shadow">
                <span className="inline-flex items-center"><Wrench className="w-4 h-4 mr-2 text-yellow-700" /> Ferramenta em BETA</span>
                <span className="ml-2 text-xs font-normal text-yellow-800">Pode conter bugs ou instabilidades.</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 font-semibold text-sm shadow">
                <span className="inline-flex items-center"><Circle className="w-3 h-3 mr-2 text-blue-700" /> Clone de Quiz Inlead</span>
                <span className="ml-2 text-xs font-normal text-blue-800">Esta ferramenta é inspirada e compatível com quizzes do Inlead.</span>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" /> Clonar Quiz
            </button>
            {/* Modal de clonagem de quiz */}
            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col gap-6 items-center w-full max-w-md">
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Clonar Quiz</h2>
                  <input
                    type="url"
                    placeholder="URL do site do quiz"
                    value={originalUrl}
                    onChange={e => setOriginalUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  <input
                    type="url"
                    placeholder="URL do checkout do quiz"
                    value={checkoutUrl}
                    onChange={e => setCheckoutUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Nome do quiz (subdomínio)"
                    value={subdomain}
                    maxLength={10}
                    onChange={e => {
                      setSubdomain(e.target.value);
                      setSubdomainError(validateSubdomain(e.target.value));
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
                  />
                  {subdomainError && <div className="text-red-500 text-sm">{subdomainError}</div>}
                  {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                  <div className="flex flex-col gap-4 w-full">
                    <button
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-lg disabled:opacity-60"
                      disabled={actionLoading === 'zip' || actionLoading === 'save' || !originalUrl || !checkoutUrl || !!subdomainError}
                      onClick={async () => {
                        const err = validateSubdomain(subdomain);
                        if (err) { setSubdomainError(err); return; }
                        setSubdomainError(null);
                        const unique = await checkSubdomainUnique(subdomain);
                        if (!unique) { setSubdomainError("Este nome já está em uso."); return; }
                        await handleCloneQuiz('save', subdomain);
                      }}
                    >
                      {actionLoading === 'save' ? (
                        <span className="flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5 text-white" /> Processando...</span>
                      ) : (
                        <><Download className="w-5 h-5" /> Usar Hospedagem</>
                      )}
                    </button>
                  </div>
                  <button
                    className="mt-4 text-sm text-gray-500 hover:underline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-md font-semibold px-6 pt-6 pb-2 text-gray-900 dark:text-white">Quizzes Clonados</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {quizzesLoading ? (
                  <li className="px-6 py-4 text-gray-500 dark:text-gray-400">Carregando...</li>
                ) : quizzes.length === 0 ? (
                  <li className="px-6 py-4 text-gray-500 dark:text-gray-400">Nenhum quiz clonado ainda.</li>
                ) : quizzes.map(quiz => (
                  <li key={quiz.id} className="flex items-center justify-between px-6 py-4 group hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <div>
                      {quiz.url ? (
                        <a
                          href={quiz.url}
                          className="text-blue-600 dark:text-blue-400 underline break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {quiz.url}
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">(Sem URL hospedada)</span>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-semibold">Original:</span> {quiz.original_url}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-semibold">Checkout:</span> {quiz.checkout_url}
                      </div>
                    </div>
                    <button
                      className="ml-4 flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-60"
                      disabled={deleteLoadingId === quiz.id}
                      onClick={() => handleDeleteQuiz(quiz)}
                      title="Excluir quiz"
                    >
                      {deleteLoadingId === quiz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
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