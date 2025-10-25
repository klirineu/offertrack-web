import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Edit, Circle, Wrench, CheckCircle, Copy, X } from 'lucide-react';

// Função para traduzir status do quiz
const translateQuizStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'draft': 'Rascunho',
    'published': 'Publicado',
    'archived': 'Arquivado',
    'pending': 'Pendente',
    'active': 'Ativo',
    'inactive': 'Inativo'
  };
  return statusMap[status] || status;
};
import { StandardNavigation } from '../../components/StandardNavigation';
import { useAuth } from '../../context/AuthContext';
import { fetchQuizzesService, removeQuizService, Quiz } from '../../services/quizzesService';
import { cloneQuizWithAuth } from '../../services/api';
import { supabase } from '../../lib/supabase';


export default function EditorQuiz() {
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
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <Circle className="w-6 h-6" />
            </div>
            <div className="page-header-content flex-1">
              <h1 className="page-header-title">Quizzes Clonados</h1>
              <p className="page-header-subtitle">Gerencie seus quizzes InLead e XQuiz</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="cta-button"
              style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
            >
              <Plus className="w-4 h-4" />
              Clonar Quiz
            </button>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8" style={{ paddingTop: '100px' }}>
            {/* Aviso de Lançamento do Editor de Quiz */}
            <div className="alert alert-success mb-6">
              <span className="alert-icon">🚀</span>
              <div className="alert-content">
                <div className="alert-title">
                  <Wrench className="inline w-4 h-4 mr-2" />
                  NOVO LANÇAMENTO
                </div>
                <div className="alert-message">
                  Editor de Quiz Avançado disponível! Acesse em Ferramentas → Clonar Quiz
                </div>
              </div>
              <button
                onClick={() => window.open('https://quiz.clonup.pro', '_blank')}
                className="starter-button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Acessar Quiz Editor
              </button>
            </div>

            {/* Modal de clonagem de quiz */}
            {modalOpen && (
              <div className="modal-overlay">
                <div className="modal-content max-w-2xl">
                  <div className="app-modal-header">
                    <h2 className="modal-title">
                      Clonar Quiz
                    </h2>
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
                      className="modal-close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <div className="space-y-6">
                      <div className="form-field-wrapper">
                        <label className="form-field-label">Tipo de Quiz</label>
                        <select
                          value={quizType}
                          onChange={e => setQuizType(e.target.value as 'inlead' | 'xquiz')}
                          className="form-input"
                        >
                          <option value="inlead">Inlead</option>
                          <option value="xquiz">XQuiz (BETA) 🚀</option>
                        </select>
                        {quizType === 'xquiz' && (
                          <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)' }}>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              ⚠️ <strong>BETA:</strong> Esta funcionalidade está em fase de testes. Pode haver instabilidades.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="form-field-wrapper">
                        <label className="form-field-label">URL do site do quiz</label>
                        <input
                          type="url"
                          placeholder="https://exemplo.com/quiz"
                          value={originalUrl}
                          onChange={e => setOriginalUrl(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-field-wrapper">
                        <label className="form-field-label">Nome do quiz (subdomínio)</label>
                        <input
                          type="text"
                          placeholder="meuquiz"
                          value={subdomain}
                          maxLength={20}
                          onChange={e => {
                            setSubdomain(e.target.value);
                            setSubdomainError(validateSubdomain(e.target.value));
                          }}
                          className="form-input"
                        />
                        {subdomainError && <div className="form-field-error-message">{subdomainError}</div>}
                        {slugModified && (
                          <div className="mt-2 p-2 rounded-lg" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--accent)' }}>
                            <p className="text-xs" style={{ color: 'var(--accent)' }}>{slugModified}</p>
                          </div>
                        )}
                        {errorMsg && <div className="form-field-error-message">{errorMsg}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="app-modal-footer">
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
                      className="secondary-button"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddQuiz}
                      disabled={actionLoading === 'save' || !originalUrl || !subdomain || !!subdomainError}
                      className="cta-button"
                    >
                      {actionLoading === 'save' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Clonando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Clonar Quiz
                        </>
                      )}
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
            <div className="dashboard-card">
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Quizzes Clonados</h3>
                <span className="badge badge-info">{quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}</span>
              </div>

              {quizzesLoading ? (
                <div className="p-12 text-center">
                  <div className="loader mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Carregando quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
                    <Circle className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Nenhum quiz clonado ainda</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Clique em "Clonar Quiz" para começar</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="p-6 hover:bg-opacity-50 transition" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="badge badge-success">✓ Ativo</span>
                            <a
                              href={`https://quiz.clonup.pro/${quiz.slug}`}
                              className="text-sm font-semibold hover:opacity-80 transition truncate"
                              style={{ color: 'var(--accent)' }}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              https://quiz.clonup.pro/{quiz.slug}
                            </a>
                          </div>
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                            {quiz.title}
                          </div>
                          {quiz.description && (
                            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                              {quiz.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span className="badge badge-info">{translateQuizStatus(quiz.status || 'published')}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditQuiz(quiz)}
                            className="cta-button"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz)}
                            disabled={deleteLoadingId === quiz.id}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--error)' }}
                            title="Excluir"
                          >
                            {deleteLoadingId === quiz.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </StandardNavigation >
  );
} 