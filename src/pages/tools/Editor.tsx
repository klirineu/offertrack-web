import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Loader2, Clock, Download, Upload } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useThemeStore } from '../../store/themeStore';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { fetchClonesService, addCloneService, removeCloneService, checkCloneLimit, CloneSite } from '../../services/clonesService';
import { supabase } from '../../lib/supabase';
import { checkTrialStatus } from '../../utils/trialUtils';

// Permitir tipagem global para o editor
declare global {
  interface Window {
    gjsEditor?: unknown;
  }
}


export default function Editor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const urlParam = searchParams.get('url');

  const { user, profile } = useAuth();
  const [clones, setClones] = useState<CloneSite[]>([]);
  const [clonesLoading, setClonesLoading] = useState(false);
  const [editorResult, setEditorResult] = useState<{ url: string, id: string } | null>(null);
  const copyRef = useRef<HTMLInputElement>(null);
  const [actionLoading, setActionLoading] = useState<'editor' | 'zip' | null>(null);
  const [cloneUrlToProcess, setCloneUrlToProcess] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [subdomainInput, setSubdomainInput] = useState("");
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadZipFile, setUploadZipFile] = useState<File | null>(null);
  const [uploadSubdomain, setUploadSubdomain] = useState("");
  const [uploadSubdomainError, setUploadSubdomainError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<{ subdomain: string; siteUrl: string } | null>(null);

  useEffect(() => {
    const loadClones = async () => {
      if (!user) return;
      setClonesLoading(true);
      const { data, error } = await fetchClonesService(user.id);
      if (error) console.error('Erro ao carregar clones:', error);
      if (data) setClones(data);
      setClonesLoading(false);
    };
    loadClones();
  }, [user]);

  useEffect(() => {
    if (urlParam) {
      setCloneUrlToProcess(urlParam);
    }

  }, [urlParam]);



  // Função utilitária para extrair o subdomínio
  function getSubdomainFromUrl(url: string): string {
    try {
      const { hostname } = new URL(url);
      const parts = hostname.split('.');
      if (parts.length > 2) return parts[0];
      return '';
    } catch {
      return '';
    }
  }

  // Função para validar subdomínio
  function validateSubdomain(value: string) {
    if (!/^[a-zA-Z0-9-]{1,20}$/.test(value)) {
      return "Use até 20 letras, números ou hífen (-)";
    }
    return null;
  }

  // Função para checar unicidade
  async function checkSubdomainUnique(sub: string) {
    const { data: site } = await supabase.from("cloned_sites").select("subdomain").eq("subdomain", sub).maybeSingle();
    const { data: quiz } = await supabase.from("quizzes").select("slug").eq("slug", sub).maybeSingle();
    return !site && !quiz;
  }


  const handleDeleteClone = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este clone?')) return;
    if (!user) return;

    setDeleteLoadingId(id);

    // Find the clone to get its subdomain
    const clone = clones.find(c => c.id === id);
    if (!clone) {
      setDeleteLoadingId(null);
      return;
    }

    const { error } = await removeCloneService(user.id, id);

    if (error) {
      console.error('Erro ao deletar clone:', error);
      alert('Erro ao deletar clone');
    } else {
      setClones(prev => prev.filter(clone => clone.id !== id));
    }
    setDeleteLoadingId(null);
  };

  const handleZipDownload = async (clone: CloneSite) => {
    // Verificar se o usuário tem plano ativo (não pode estar em trial)
    if (!profile) {
      setErrorModal('Erro ao verificar perfil do usuário');
      return;
    }

    if (profile.subscription_status === 'trialing') {
      setErrorModal('O download de sites não está disponível durante o período de teste. Assine um plano para desbloquear esta funcionalidade.');
      return;
    }

    if (profile.subscription_status !== 'active') {
      setErrorModal('Você precisa de um plano ativo para baixar sites. Assine um plano para continuar.');
      return;
    }

    // Extrair subdomínio da URL do clone
    const subdomain = getSubdomainFromUrl(clone.url);
    if (!subdomain) {
      setErrorModal('Não foi possível identificar o subdomínio do site');
      return;
    }

    setActionLoading('zip');
    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token;

      if (!supabaseToken) {
        setErrorModal('Erro de autenticação. Faça login novamente.');
        return;
      }

      // Fazer requisição para baixar o site usando a instância api
      const response = await api.post('/api/download-site',
        { subdomain: subdomain },
        {
          headers: {
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob' // Importante para receber o arquivo ZIP
        }
      );

      // Obter o blob do arquivo ZIP
      const blob = response.data;

      // Criar link para download
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = `${subdomain}.zip`;
      a.click();

      // Limpar o objeto URL após o download
      setTimeout(() => window.URL.revokeObjectURL(a.href), 100);

    } catch (err) {
      console.error('Erro ao baixar ZIP:', err);
      let errorMessage = 'Erro ao baixar o site. Tente novamente.';

      // Tratar erros do axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setErrorModal(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleZipUpload = async () => {
    if (!uploadZipFile || !uploadSubdomain || !user) return;

    // Validar subdomínio
    const validationError = validateSubdomain(uploadSubdomain.toLowerCase());
    if (validationError) {
      setUploadSubdomainError(validationError);
      return;
    }

    // Verificar se o subdomínio está disponível
    const isUnique = await checkSubdomainUnique(uploadSubdomain.toLowerCase());
    if (!isUnique) {
      setUploadSubdomainError('Este nome já está em uso.');
      return;
    }

    // Verificar limite de clones
    const limit = await checkCloneLimit(user.id);
    if (!limit.allowed) {
      setErrorModal(limit.error?.message || 'Limite de clones atingido.');
      return;
    }

    setUploadLoading(true);
    setUploadSubdomainError(null);

    try {
      // Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token;

      if (!supabaseToken) {
        setErrorModal('Erro de autenticação. Faça login novamente.');
        return;
      }

      // Criar FormData
      const formData = new FormData();
      formData.append('zip', uploadZipFile);
      formData.append('subdomain', uploadSubdomain.toLowerCase());

      // Enviar para a API usando a instância api
      const response = await api.post('/api/zip-upload', formData, {
        headers: {
          'Authorization': `Bearer ${supabaseToken}`,
        }
      });

      const result = response.data;

      if (!result.success) {
        setErrorModal(result.message || 'Erro ao processar o ZIP');
        return;
      }

      // Adicionar à lista de clones no Supabase
      const siteUrl = result.data.siteUrl;
      const { error } = await addCloneService(user.id, 'upload-zip', siteUrl, uploadSubdomain.toLowerCase());

      if (error) {
        console.error('Erro ao salvar clone:', error);
      }

      // Atualizar lista de clones
      const { data: clonesData, error: clonesError } = await fetchClonesService(user.id);
      if (clonesError) console.error('Erro ao carregar clones:', clonesError);
      if (clonesData) setClones(clonesData);

      // Mostrar sucesso
      setUploadSuccess({
        subdomain: result.data.subdomain,
        siteUrl: result.data.siteUrl
      });

      // Limpar formulário
      setUploadZipFile(null);
      setUploadSubdomain('');
      setShowUploadModal(false);

    } catch (err) {
      console.error('Erro ao fazer upload do ZIP:', err);
      let errorMessage = 'Erro ao fazer upload do ZIP. Tente novamente.';

      // Tratar erros do axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }

      setErrorModal(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  // Função específica para clonar para o editor
  async function handleCloneToEditor(url: string, subdomainCorreto: string) {
    if (!user) return;
    setActionLoading('editor');
    try {
      // Verificar limite antes de chamar o backend
      const limit = await checkCloneLimit(user.id);
      if (!limit.allowed) {
        setErrorModal(limit.error?.message || 'Limite de clones atingido.');
        setActionLoading(null);
        return;
      }
      const res = await api.post('/api/clone/folder', { url, subdomain: subdomainCorreto });
      const data = res.data;
      const urlSite = data.url;
      const { error } = await addCloneService(user.id, url, urlSite, subdomainCorreto);
      if (error) throw error;
      setEditorResult({ url: urlSite, id: subdomainCorreto || '' });
      // Atualizar lista de clones
      const { data: clonesData, error: clonesError } = await fetchClonesService(user.id);
      if (clonesError) console.error('Erro ao carregar clones:', clonesError);
      if (clonesData) setClones(clonesData);
    } catch (err) {
      let msg = 'Erro inesperado ao clonar.';
      if (err && typeof err === 'object') {
        if (err instanceof Error && err.message) {
          if (err.message.includes('duplicate key value')) {
            msg = 'Este subdomínio já está em uso. Escolha outro.';
          } else {
            msg = err.message;
          }
        } else if ('error' in err && err.error && typeof err.error === 'object' && 'message' in err.error && typeof err.error.message === 'string') {
          msg = err.error.message;
        } else if ('message' in err && typeof (err as Error).message === 'string') {
          msg = (err as Error).message;
        }
      }
      setErrorModal(msg);
      console.error('Erro inesperado no handleCloneToEditor:', err);
    } finally {
      setActionLoading(null);
      setCloneUrlToProcess(null);
    }
  }

  console.log(clones);

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Edit className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Clonar Sites
                </h1>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setCloneUrlToProcess('')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus className="w-4 h-4" /> Clonar Site
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  <Upload className="w-4 h-4" /> Hospedar Site
                </button>
                <button
                  onClick={() => navigate('/tools/clonequiz')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <Plus className="w-4 h-4" /> Clonar Quiz
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          {/* Trial Status Banner */}
          {profile?.subscription_status === 'trialing' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Período de Teste Gratuito
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {(() => {
                      const trialStatus = checkTrialStatus({
                        subscription_status: profile.subscription_status,
                        trial_started_at: profile.trial_started_at,
                        created_at: profile.created_at
                      });
                      return `Você tem ${trialStatus.daysRemaining} ${trialStatus.daysRemaining === 1 ? 'dia restante' : 'dias restantes'} no seu período de teste. Aproveite todos os recursos do plano Starter!`;
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => window.location.href = '/escolher-plano'}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Ver Planos
                </button>
              </div>
            </div>
          )}

          {/* Modal de escolha ao clonar site */}
          {cloneUrlToProcess !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 items-center w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">O que deseja fazer?</h2>
                <input
                  type="url"
                  placeholder="https://exemplo.com"
                  value={cloneUrlToProcess}
                  onChange={e => setCloneUrlToProcess(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Nome do site (subdomínio)"
                  value={subdomainInput}
                  maxLength={20}
                  onChange={e => {
                    setSubdomainInput(e.target.value);
                    setSubdomainError(validateSubdomain(e.target.value));
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                />
                {subdomainError && <div className="text-red-500 text-xs sm:text-sm">{subdomainError}</div>}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 
                w-full">
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white 
                    rounded-lg hover:bg-blue-700 disabled:opacity-50 
                    disabled:cursor-not-allowed flex items-center 
                    justify-center gap-2 text-sm sm:text-base"
                    disabled={actionLoading !== null || !cloneUrlToProcess}
                    onClick={async () => {
                      const err = validateSubdomain(subdomainInput.toLowerCase());
                      if (err) { setSubdomainError(err); return; }
                      setSubdomainError(null);
                      const unique = await checkSubdomainUnique(subdomainInput.toLowerCase());
                      if (!unique) { setSubdomainError("Este nome já está em uso."); return; }
                      await handleCloneToEditor(cloneUrlToProcess!, subdomainInput.toLowerCase());
                    }}
                  >
                    {actionLoading === 'editor' ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg> Processando...</span>
                    ) : (
                      <><Edit className="w-5 h-5" /> Editor</>
                    )}
                  </button>
                  <button
                    className="w-full px-4 py-2 bg-green-600 text-white 
                    rounded-lg hover:bg-green-700 disabled:opacity-50 
                    disabled:cursor-not-allowed flex items-center 
                    justify-center gap-2 text-sm sm:text-base"
                    disabled={actionLoading !== null || !cloneUrlToProcess}
                    onClick={async () => {
                      setActionLoading('zip');
                      const res = await api.post('/api/clone/zip', { url: cloneUrlToProcess }, { responseType: 'blob' });
                      setActionLoading(null);
                      if (res.status < 200 || res.status >= 300) {
                        setErrorModal('Erro ao baixar ZIP');
                        return;
                      }
                      const blob = res.data;
                      const a = document.createElement('a');
                      a.href = window.URL.createObjectURL(blob);
                      const domain = new URL(cloneUrlToProcess).hostname.replace(/^www\./, '');
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
                  className="text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                  onClick={() => setCloneUrlToProcess(null)}
                  disabled={actionLoading !== null}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Modal de erro */}
          {errorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col gap-4 items-center w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-bold text-center text-red-600">Erro</h2>
                <p className="text-center text-gray-900 dark:text-white text-sm sm:text-base">{errorModal}</p>
                <button
                  onClick={() => setErrorModal(null)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Modal de resultado do editor */}
          {editorResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 items-center w-full max-w-md">
                <h2 className="text-lg sm:text-xl font-bold text-center text-green-600">Clone Criado!</h2>
                <p className="text-center text-gray-900 dark:text-white text-sm sm:text-base">
                  Seu site foi clonado com sucesso!
                </p>
                <input
                  ref={copyRef}
                  type="text"
                  value={editorResult.url}
                  readOnly
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm break-all"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <button
                    onClick={() => {
                      copyRef.current?.select();
                      document.execCommand('copy');
                      alert('URL copiada!');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Copiar URL
                  </button>
                  <button
                    onClick={() => navigate(`/tools/editor-studio?id=${editorResult.id}`)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
                  >
                    Editar
                  </button>
                </div>
                <button
                  onClick={() => setEditorResult(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Modal de Upload de ZIP */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 w-full max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white">Hospedar Site</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Faça upload de um arquivo ZIP contendo seu site (HTML, CSS, JS, imagens, etc.)
                </p>

                {/* Input de arquivo */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arquivo ZIP
                  </label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) { // 50MB limit
                          setErrorModal('O arquivo ZIP deve ter no máximo 50MB');
                          e.target.value = '';
                          return;
                        }
                        setUploadZipFile(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  {uploadZipFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ {uploadZipFile.name} ({(uploadZipFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Input de subdomínio */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome do site (subdomínio)
                  </label>
                  <input
                    type="text"
                    placeholder="meusite"
                    value={uploadSubdomain}
                    maxLength={20}
                    onChange={(e) => {
                      setUploadSubdomain(e.target.value);
                      setUploadSubdomainError(validateSubdomain(e.target.value));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Seu site ficará em: {uploadSubdomain || 'meusite'}.clonup.site
                  </p>
                  {uploadSubdomainError && (
                    <p className="text-xs text-red-500 mt-1">{uploadSubdomainError}</p>
                  )}
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={handleZipUpload}
                    disabled={!uploadZipFile || !uploadSubdomain || uploadLoading || !!uploadSubdomainError}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Hospedar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadZipFile(null);
                      setUploadSubdomain('');
                      setUploadSubdomainError(null);
                    }}
                    disabled={uploadLoading}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Sucesso do Upload */}
          {uploadSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-6 sm:p-8 flex flex-col gap-4 sm:gap-6 w-full max-w-md">
                {/* Success Icon */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    🎉 Site Hospedado!
                  </h2>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    Seu site foi hospedado com sucesso e já está disponível online!
                  </p>
                </div>

                {/* URL Display */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    URL do Site
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadSuccess.siteUrl}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadSuccess.siteUrl);
                        const btn = event?.target as HTMLButtonElement;
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '✓';
                        setTimeout(() => {
                          btn.innerHTML = originalText;
                        }, 2000);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="Copiar URL"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      navigate(`/tools/editor-studio?id=${uploadSuccess.subdomain}`);
                      setUploadSuccess(null);
                    }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Edit className="w-5 h-5" />
                    Abrir Editor
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(uploadSuccess.siteUrl);
                        alert('✓ URL copiada para a área de transferência!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar URL
                    </button>
                    <button
                      onClick={() => window.open(uploadSuccess.siteUrl, '_blank')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Abrir Site
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setUploadSuccess(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Lista de clones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold px-4 py-4 sm:px-6 sm:pt-6 sm:pb-2 text-gray-900 dark:text-white">Sites Clonados</h3>

            {/* Aviso para usuários em trial */}
            {profile?.subscription_status === 'trialing' && clones.length > 0 && (
              <div className="mx-4 mb-4 sm:mx-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Download className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Download bloqueado durante o teste
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      O download de sites em ZIP está disponível apenas para assinantes.
                      <button
                        onClick={() => navigate('/escolher-plano')}
                        className="underline font-medium ml-1 hover:text-yellow-900 dark:hover:text-yellow-100"
                      >
                        Assine agora
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {clonesLoading ? (
                <div className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Carregando...</div>
              ) : clones.length === 0 ? (
                <div className="px-4 py-4 sm:px-6 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhum site clonado ainda.</div>
              ) : (
                clones.map(clone => (
                  <div key={clone.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {clone.url ? (
                          <a
                            href={clone.url}
                            className="text-blue-600 dark:text-blue-400 underline break-all text-sm sm:text-base"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {clone.url}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">(Processando...)</span>
                        )}
                        {clone.original_url && (
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                            <span className="font-semibold">Original:</span> {clone.original_url}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {clone.url && (
                          <button
                            onClick={() => {
                              const urlSite = clone.url;
                              const subdomain = getSubdomainFromUrl(urlSite);
                              if (subdomain && subdomain.length > 0) {
                                navigate(`/tools/editor-studio?id=${subdomain}`);
                              } else {
                                setErrorModal('Não foi possível identificar o subdomínio do site clonado.');
                              }
                            }}
                            className="p-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {clone.url && (
                          <button
                            onClick={() => handleZipDownload(clone)}
                            disabled={actionLoading === 'zip' || profile?.subscription_status === 'trialing' || profile?.subscription_status !== 'active'}
                            className={`p-2 disabled:opacity-50 ${profile?.subscription_status === 'trialing' || profile?.subscription_status !== 'active'
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                              }`}
                            title={
                              profile?.subscription_status === 'trialing'
                                ? 'Download bloqueado durante o período de teste. Assine um plano para desbloquear.'
                                : profile?.subscription_status !== 'active'
                                  ? 'Você precisa de um plano ativo para baixar sites'
                                  : 'Baixar ZIP'
                            }
                          >
                            {actionLoading === 'zip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClone(clone.id)}
                          disabled={deleteLoadingId === clone.id}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          title="Excluir"
                        >
                          {deleteLoadingId === clone.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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