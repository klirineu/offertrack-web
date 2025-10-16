import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';
import { fetchQuizzesService, removeQuizService, Quiz } from '../../services/quizzesService';
import { cloneQuizWithAuth } from '../../services/api';
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
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [actionLoading, setActionLoading] = useState<'zip' | 'save' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [slugModified, setSlugModified] = useState<string | null>(null);

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
    const { data: quiz } = await supabase.from("quizzes").select("slug").eq("slug", sub).maybeSingle();
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

      // Verificar se o slug já existe e gerar um único se necessário
      let finalSubdomain = subdomain;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const unique = await checkSubdomainUnique(finalSubdomain);
        if (unique) {
          break; // Slug é único, pode usar
        }

        // Gerar novo slug com ID único
        const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
        finalSubdomain = `${subdomain}-${timestamp}`;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        setSubdomainError("Não foi possível gerar um nome único. Tente outro nome.");
        setActionLoading(null);
        return;
      }

      // Se o slug foi modificado, informar ao usuário
      if (finalSubdomain !== subdomain) {
        console.log(`Slug modificado de "${subdomain}" para "${finalSubdomain}"`);
        setSlugModified(`Nome "${subdomain}" já estava em uso. Usando "${finalSubdomain}" automaticamente.`);
        setSubdomain(finalSubdomain); // Atualizar o campo para mostrar o slug final
      }

      // Chamar API para clonar o quiz com autenticação JWT
      const res = await cloneQuizWithAuth(originalUrl, finalSubdomain);
      const responseData = res.data;

      if (!responseData.success) {
        setErrorMsg('Erro ao clonar quiz: ' + (responseData.message || 'Erro desconhecido'));
        setActionLoading(null);
        return;
      }

      // A API já salvou no banco de dados, não precisamos fazer nada aqui

      const { data: quizzesData, error: quizzesError } = await fetchQuizzesService(user.id);
      if (quizzesError) console.error('Erro ao carregar quizzes:', quizzesError);
      if (quizzesData) setQuizzes(quizzesData);

      setModalOpen(false);
      setOriginalUrl('');
      setSubdomain('');
      setSubdomainError(null);
      setSlugModified(null);

    } catch (error) {
      console.error('Erro ao adicionar quiz:', error);
      setErrorMsg('Erro inesperado ao clonar quiz');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteQuiz = async (quiz: Quiz) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este quiz?')) return;

    setDeleteLoadingId(quiz.id);

    try {
      await removeQuizService(user.id, quiz.id, quiz.slug);
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

  // Função de download temporariamente removida
  // const handleDownloadZip = async (quiz: Quiz) => {
  //   const quizUrl = `https://quiz.clonup.pro/${quiz.slug}`;
  //   
  //   setActionLoading('zip');
  //   try {
  //     const response = await api.post('/api/clone/zip', { url: quizUrl }, { responseType: 'blob' });
  //     const blob = response.data;
  //     const link = document.createElement('a');
  //     link.href = window.URL.createObjectURL(blob);
  //     link.download = `${quiz.slug}.zip`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error('Erro ao baixar ZIP:', error);
  //     alert('Erro ao baixar o arquivo ZIP');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const handleEditQuiz = (quiz: Quiz) => {
    // Usar o ID do quiz para editar
    window.open(`https://quiz.clonup.pro/quiz/${quiz.id}`, '_blank');
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 text-green-900 font-semibold text-sm shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <span className="inline-flex items-center"><Wrench className="w-4 h-4 mr-2 text-green-700" /> 🚀 NOVO LANÇAMENTO</span>
                <span className="text-xs font-normal text-green-800">Editor de Quiz Avançado - Você será redirecionado para nossa plataforma completa!</span>
              </div>
              <button
                onClick={() => window.open('https://quiz.clonup.pro', '_blank')}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-xs font-medium whitespace-nowrap"
              >
                Acessar Quiz Editor
              </button>
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
                {slugModified && <div className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">{slugModified}</div>}
                {errorMsg && <div className="text-red-500 text-xs sm:text-sm">{errorMsg}</div>}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button
                    onClick={handleAddQuiz}
                    disabled={actionLoading === 'save' || !originalUrl || !subdomain || !!subdomainError}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {actionLoading === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {actionLoading === 'save' ? 'Clonando...' : 'Clonar'}
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setOriginalUrl('');
                      setSubdomain('');
                      setSubdomainError(null);
                      setSlugModified(null);
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
                        <a
                          href={`https://quiz.clonup.pro/${quiz.slug}`}
                          className="text-blue-600 dark:text-blue-400 underline break-all text-sm sm:text-base"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          https://quiz.clonup.pro/{quiz.slug}
                        </a>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                          <span className="font-semibold">Título:</span> {quiz.title}
                        </div>
                        {quiz.description && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                            <span className="font-semibold">Descrição:</span> {quiz.description}
                          </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                          <span className="font-semibold">Status:</span> {quiz.status || 'published'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditQuiz(quiz)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Botão de download temporariamente removido */}
                        {/* <button
                          onClick={() => handleDownloadZip(quiz)}
                          disabled={actionLoading === 'zip'}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          title="Baixar ZIP"
                        >
                          {actionLoading === 'zip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button> */}
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