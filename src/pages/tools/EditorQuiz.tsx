import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Edit, Circle, Wrench, CheckCircle, Copy } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';
import { fetchQuizzesService, removeQuizService, Quiz } from '../../services/quizzesService';
import { cloneQuizWithAuth } from '../../services/api';
import { supabase } from '../../lib/supabase';


export default function EditorQuiz() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
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
  const [quizType, setQuizType] = useState<'inlead' | 'xquiz'>('inlead');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [clonedQuizData, setClonedQuizData] = useState<{
    id: string;
    slug: string;
    url: string;
    title: string;
    originalUrl?: string;
    steps?: unknown[];
  } | null>(null);


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
      // Usar rota baseada no tipo de quiz selecionado
      const apiRoute = quizType === 'xquiz' ? '/api/clone/xquiz' : '/api/clone/quiz';
      const res = await cloneQuizWithAuth(originalUrl, finalSubdomain, apiRoute);
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

      // Salvar dados do quiz clonado para mostrar no modal de sucesso
      setClonedQuizData(responseData.data);

      setModalOpen(false);
      setOriginalUrl('');
      setSubdomain('');
      setSubdomainError(null);
      setSlugModified(null);
      setQuizType('inlead');

      // Abrir modal de sucesso
      setSuccessModalOpen(true);

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
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
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

                {/* Campo de seleção do tipo de quiz */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Quiz
                  </label>
                  <select
                    value={quizType}
                    onChange={e => setQuizType(e.target.value as 'inlead' | 'xquiz')}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  >
                    <option value="inlead">Inlead</option>
                    <option value="xquiz">XQuiz (BETA) 🚀</option>
                  </select>
                  {quizType === 'xquiz' && (
                    <div className="mt-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ <strong>BETA:</strong> Esta funcionalidade está em fase de testes. Pode haver instabilidades.
                      </p>
                    </div>
                  )}
                </div>

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
                    {actionLoading === 'save' ? 'Clonando...' : 'Clonar Quiz'}
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setOriginalUrl('');
                      setSubdomain('');
                      setSubdomainError(null);
                      setSlugModified(null);
                      setErrorMsg(null);
                      setQuizType('inlead');
                    }}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Sucesso */}
          {successModalOpen && clonedQuizData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg">
                {/* Header com ícone de sucesso */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                    Quiz Clonado com Sucesso! 🎉
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                    Seu quiz está pronto para ser usado
                  </p>
                </div>

                {/* Informações do Quiz */}
                <div className="space-y-4 mb-6">
                  {/* Título */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Título
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1 break-words">
                      {clonedQuizData.title}
                    </p>
                  </div>

                  {/* URL do Quiz */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      URL do Quiz
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={clonedQuizData.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(clonedQuizData.url);
                          alert('URL copiada!');
                        }}
                        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        title="Copiar URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* URL Original */}
                  {clonedQuizData.originalUrl && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        URL Original
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                        {clonedQuizData.originalUrl}
                      </p>
                    </div>
                  )}

                  {/* Informações Adicionais */}
                  {clonedQuizData.steps && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        📊 <strong>{clonedQuizData.steps.length}</strong> etapas clonadas com sucesso
                      </p>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      window.open(`https://quiz.clonup.pro/quiz/${clonedQuizData.id}`, '_blank');
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit className="w-5 h-5" />
                    Editar Quiz
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(clonedQuizData.url);
                      alert('URL copiada!');
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Copy className="w-5 h-5" />
                    Copiar URL
                  </button>
                  <button
                    onClick={() => {
                      setSuccessModalOpen(false);
                      setClonedQuizData(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Fechar
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
    </StandardNavigation>
  );
} 