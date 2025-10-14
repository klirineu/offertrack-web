import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, Plus, Download, Loader2, Trash2 } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';
import { fetchQuizzesService, addQuizService, removeQuizService, ClonedQuiz } from '../../services/quizzesService';
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
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<ClonedQuiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [actionLoading, setActionLoading] = useState<'zip' | 'save' | null>(null);
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
        { label: "Trackeamento", href: "/tools/trackeamento", icon: <Circle className="h-4 w-4" /> },
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

  function validateSubdomain(value: string) {
    if (!/^[a-zA-Z0-9-]{1,20}$/.test(value)) {
      return "Use até 20 letras, números ou hífen (-)";
    }
    return null;
  }

  async function checkSubdomainUnique(sub: string) {
    const { data: site } = await supabase.from("cloned_sites").select("subdomain").eq("subdomain", sub).maybeSingle();
    const { data: quiz } = await supabase.from("cloned_quiz").select("subdomain").eq("subdomain", sub).maybeSingle();
    return !site && !quiz;
  }

  const handleAddQuiz = async () => {
    if (!user) return;

    setActionLoading('save');
    setErrorMsg(null);

    try {
      const err = validateSubdomain(subdomain);
      if (err) {
        setSubdomainError(err);
        setActionLoading(null);
        return;
      }

      const unique = await checkSubdomainUnique(subdomain);
      if (!unique) {
        setSubdomainError("Este nome já está em uso.");
        setActionLoading(null);
        return;
      }

      // Chamar API para clonar o quiz
      const res = await api.post('/api/clone/quiz/save', {
        url: originalUrl,
        subdomain: subdomain,
        checkoutUrl: checkoutUrl
      });
      const data = res.data;
      const url = data.url || `https://${subdomain}.clonup.site`;

      // Salvar no banco de dados
      const { error } = await addQuizService(user.id, originalUrl, checkoutUrl, subdomain, url);

      if (error) {
        setErrorMsg(error.message);
        setActionLoading(null);
        return;
      }

      const { data: quizzesData, error: quizzesError } = await fetchQuizzesService(user.id);
      if (quizzesError) console.error('Erro ao carregar quizzes:', quizzesError);
      if (quizzesData) setQuizzes(quizzesData);

      setModalOpen(false);
      setOriginalUrl('');
      setCheckoutUrl('');
      setSubdomain('');
      setSubdomainError(null);

    } catch (error) {
      console.error('Erro ao adicionar quiz:', error);
      setErrorMsg('Erro inesperado ao clonar quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuiz = async (quiz: ClonedQuiz) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este quiz?')) return;

    setDeleteLoadingId(quiz.id);

    try {
      await removeQuizService(user.id, quiz.id, quiz.subdomain || quiz.id);
      const { data: quizzesData, error: quizzesError } = await fetchQuizzesService(user.id);
      if (quizzesError) console.error('Erro ao carregar quizzes:', quizzesError);
      if (quizzesData) setQuizzes(quizzesData);
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      alert('Erro ao excluir quiz');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleDownloadZip = async (quiz: ClonedQuiz) => {
    if (!quiz.url) return;

    setActionLoading('zip');
    try {
      const response = await api.post('/api/clone/zip', { url: quiz.url }, { responseType: 'blob' });
      const blob = response.data;
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${quiz.subdomain}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao baixar ZIP:', error);
      alert('Erro ao baixar o arquivo ZIP');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={`w-64 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0 z-40`}>
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

      <div className={`${open ? 'lg:pl-72' : 'lg:pl-24'} transition-all duration-300 px-4 py-8 lg:px-0 pt-16 lg:pt-0`}>
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Circle className="w-6 h-6 text-green-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quizzes Clonados
                </h1>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Clonar Quiz
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          {/* Aviso de BETA e clone de quiz inlead */}
          <div className="mb-6 flex flex-col gap-3 sm:gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-900 font-semibold text-sm shadow">
              <span className="inline-flex items-center"><Wrench className="w-4 h-4 mr-2 text-yellow-700" /> Ferramenta em BETA</span>
              <span className="text-xs font-normal text-yellow-800">Pode conter bugs ou instabilidades.</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 font-semibold text-sm shadow">
              <span className="inline-flex items-center"><Circle className="w-3 h-3 mr-2 text-blue-700" /> Clone de Quiz Inlead</span>
              <span className="text-xs font-normal text-blue-800">Esta ferramenta é inspirada e compatível com quizzes do Inlead.</span>
            </div>
          </div>

          {/* Modal de clonagem de quiz */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 items-center w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">Clonar Quiz</h2>
                <input
                  type="url"
                  placeholder="URL do site do quiz"
                  value={originalUrl}
                  onChange={e => setOriginalUrl(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                <input
                  type="url"
                  placeholder="URL do checkout do quiz"
                  value={checkoutUrl}
                  onChange={e => setCheckoutUrl(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Nome do quiz (subdomínio)"
                  value={subdomain}
                  maxLength={20}
                  onChange={e => {
                    setSubdomain(e.target.value);
                    setSubdomainError(validateSubdomain(e.target.value));
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                {subdomainError && <div className="text-red-500 text-xs sm:text-sm">{subdomainError}</div>}
                {errorMsg && <div className="text-red-500 text-xs sm:text-sm">{errorMsg}</div>}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button
                    onClick={handleAddQuiz}
                    disabled={actionLoading === 'save' || !originalUrl || !checkoutUrl || !subdomain || !!subdomainError}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {actionLoading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {actionLoading === 'save' ? 'Clonando...' : 'Clonar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setOriginalUrl('');
                      setCheckoutUrl('');
                      setSubdomain('');
                      setSubdomainError(null);
                      setErrorMsg(null);
                    }}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de quizzes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold px-4 py-4 sm:px-6 sm:pt-6 sm:pb-2 text-gray-900 dark:text-white">Quizzes Clonados</h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {quizzesLoading ? (
                <div className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Carregando...</div>
              ) : quizzes.length === 0 ? (
                <div className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhum quiz clonado ainda.</div>
              ) : (
                quizzes.map(quiz => (
                  <div key={quiz.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {quiz.url ? (
                          <a
                            href={quiz.url}
                            className="text-blue-600 dark:text-blue-400 underline break-all text-sm sm:text-base"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {quiz.url}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">(Sem URL hospedada)</span>
                        )}
                        {quiz.original_url && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                            <span className="font-semibold">Original:</span> {quiz.original_url}
                          </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                          <span className="font-semibold">Checkout:</span> {quiz.checkout_url}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {quiz.url && (
                          <button
                            onClick={() => handleDownloadZip(quiz)}
                            disabled={actionLoading === 'zip'}
                            className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                            title="Baixar ZIP"
                          >
                            {actionLoading === 'zip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuiz(quiz)}
                          disabled={deleteLoadingId === quiz.id}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Excluir"
                        >
                          {deleteLoadingId === quiz.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 