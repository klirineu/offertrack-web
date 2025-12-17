import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Loader2, Clock, Download, Upload, CheckCircle, Copy, X, Settings, AlertCircle } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
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

interface DnsRecord {
  type: string;
  name: string;
  fullName?: string;
  value: string;
  reason?: string;
  note?: string;
}

interface DnsOption {
  title: string;
  description?: string;
  nameservers?: string[];
  records?: DnsRecord[];
  steps?: string[];
  note?: string;
}

interface DnsInstructions {
  type?: string;
  name?: string;
  value?: string;
  note?: string;
  // Novo formato (Vercel-style): lista plana de registros
  records?: DnsRecord[];
  option1?: DnsOption;
  option2?: DnsOption;
}


export default function Editor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlParam = searchParams.get('url');

  const { user, profile } = useAuth();
  const [clones, setClones] = useState<CloneSite[]>([]);
  const [clonesLoading, setClonesLoading] = useState(false);
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
  const [cloneSuccessData, setCloneSuccessData] = useState<{
    url: string;
    subdomain: string;
    originalUrl?: string;
  } | null>(null);
  const [domainConfigModalOpen, setDomainConfigModalOpen] = useState(false);
  const [selectedCloneForDomain, setSelectedCloneForDomain] = useState<CloneSite | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainConfig, setDomainConfig] = useState<{
    domain: string;
    verified: boolean;
    ownershipVerified?: boolean;
    configured?: boolean;
    dnsInstructions: DnsInstructions | null;
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadClones = async () => {
      if (!user) return;
      setClonesLoading(true);
      const { data, error } = await fetchClonesService(user.id);
      if (error) console.error('Erro ao carregar clones:', error);
      if (data) setClones(data as unknown as CloneSite[]);
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

    const { error } = await removeCloneService(user.id, id, clone.subdomain);

    if (error) {
      console.error('Erro ao deletar clone:', error);
      alert('Erro ao deletar clone');
    } else {
      setClones(prev => prev.filter(clone => clone.id !== id));
    }
    setDeleteLoadingId(null);
  };

  const handleOpenDomainConfig = async (clone: CloneSite) => {
    setSelectedCloneForDomain(clone);
    setDomainConfigModalOpen(true);
    setDomainInput('');
    // Importante: o backend agora exige ?domain=... em /dns-instructions.
    // Então, não buscamos instruções até o usuário informar um domínio e clicar em "Adicionar Domínio"
    // ou "Verificar Agora".
    setDomainConfig(null);
  };

  const handleAddDomain = async () => {
    if (!selectedCloneForDomain || !domainInput) return;
    if (!user || !profile) return;

    // Verificar se tem assinatura ativa
    if (profile.subscription_status !== 'active') {
      setErrorModal('Para configurar domínio próprio você precisa de uma assinatura ativa. Assine um plano para continuar.');
      return;
    }

    const subdomain = getSubdomainFromUrl(selectedCloneForDomain.url);
    if (!subdomain) {
      setErrorModal('Não foi possível identificar o subdomínio do site.');
      return;
    }

    setDomainLoading(true);
    try {
      // Obter o token JWT do Supabase Auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setErrorModal('Usuário não autenticado');
        setDomainLoading(false);
        return;
      }

      const response = await api.post(`/api/sites/${subdomain}/add-domain`, {
        domain: domainInput.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        const uiMessage =
          response.data?.verification?.message ||
          response.data?.message ||
          'Domínio adicionado. Configure o DNS conforme instruções.';

        setDomainConfig({
          domain: response.data.domain,
          verified: response.data.verification?.verified || false,
          ownershipVerified: response.data.verification?.ownershipVerified,
          configured: response.data.verification?.configured,
          dnsInstructions: response.data.dnsInstructions,
          message: uiMessage,
        });
      } else {
        setErrorModal(response.data.error || 'Erro ao adicionar domínio');
      }
    } catch (error: unknown) {
      console.error('Erro ao adicionar domínio:', error);
      const errorData = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
      const errorMessage = errorData?.error || errorData?.message || 'Erro ao adicionar domínio';
      setErrorModal(errorMessage);
    } finally {
      setDomainLoading(false);
    }
  };

  const checkDomainStatus = useCallback(async () => {
    if (!selectedCloneForDomain || !domainInput) return;
    if (!user) return;

    const subdomain = getSubdomainFromUrl(selectedCloneForDomain.url);
    if (!subdomain) return;

    setDomainChecking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setDomainChecking(false);
        return;
      }

      const response = await api.get(`/api/sites/${subdomain}/verify-domain`, {
        params: { domain: domainInput.trim() },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.data.verified) {
        const domain = response.data.domain || domainInput.trim();
        setDomainConfig((prev) => {
          const next = {
            domain,
            verified: true,
            ownershipVerified: response.data.ownershipVerified,
            configured: response.data.configured,
            dnsInstructions: null,
            message: response.data.message || 'Domínio verificado e configurado corretamente',
          };
          return prev ? { ...prev, ...next } : next;
        });
      } else {
        const domain = response.data.domain || domainInput.trim();
        // Novo backend já devolve dnsInstructions aqui; usamos /dns-instructions só como fallback.
        if (typeof response.data.dnsInstructions !== 'undefined') {
          setDomainConfig({
            domain,
            verified: false,
            ownershipVerified: response.data.ownershipVerified,
            configured: response.data.configured,
            dnsInstructions: response.data.dnsInstructions,
            message: response.data.message || 'Domínio ainda não está verificado. Configure o DNS conforme instruções abaixo.',
          });
        } else {
          const instructionsResponse = await api.get(`/api/sites/${subdomain}/dns-instructions`, {
            params: { domain },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          setDomainConfig({
            domain,
            verified: false,
            ownershipVerified: instructionsResponse.data.ownershipVerified,
            configured: instructionsResponse.data.configured,
            dnsInstructions: instructionsResponse.data.dnsInstructions,
            message: instructionsResponse.data.message || response.data.message || 'Domínio ainda não está verificado',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
    } finally {
      setDomainChecking(false);
    }
  }, [selectedCloneForDomain, domainInput, user]);

  // Polling automático para verificar status
  useEffect(() => {
    if (domainConfig && !domainConfig.verified && domainConfigModalOpen) {
      const interval = setInterval(() => {
        checkDomainStatus();
      }, 10000); // Verificar a cada 10 segundos

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainConfig?.verified, domainConfigModalOpen, checkDomainStatus]);

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
      if (clonesData) setClones(clonesData as unknown as CloneSite[]);

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

      // Atualizar lista de clones
      const { data: clonesData, error: clonesError } = await fetchClonesService(user.id);
      if (clonesError) console.error('Erro ao carregar clones:', clonesError);
      if (clonesData) setClones(clonesData as unknown as CloneSite[]);

      // Mostrar modal de sucesso
      setCloneSuccessData({
        url: urlSite,
        subdomain: subdomainCorreto,
        originalUrl: url
      });
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
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <Edit className="w-6 h-6" />
            </div>
            <div className="page-header-content flex-1">
              <h1 className="page-header-title">Clonar Sites</h1>
              <p className="page-header-subtitle">Clone e edite sites com facilidade</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCloneUrlToProcess('')}
                className="cta-button"
                style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
              >
                <Plus className="w-4 h-4" /> Clonar Site
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="secondary-button"
                style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
              >
                <Upload className="w-4 h-4" /> Hospedar
              </button>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8" style={{ paddingTop: '100px' }}>
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
              <div className="modal-overlay">
                <div className="modal-content max-w-lg">
                  <div className="app-modal-header">
                    <h2 className="modal-title">
                      Clonar Site
                    </h2>
                    <button
                      onClick={() => setCloneUrlToProcess(null)}
                      className="modal-close"
                      disabled={actionLoading !== null}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Escolha como deseja clonar o site:
                    </p>

                    <div className="form-field-wrapper">
                      <label className="form-field-label">URL do Site</label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com"
                        value={cloneUrlToProcess}
                        onChange={e => setCloneUrlToProcess(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field-wrapper">
                      <label className="form-field-label">Nome do site (subdomínio)</label>
                      <input
                        type="text"
                        placeholder="meusite"
                        value={subdomainInput}
                        maxLength={20}
                        onChange={e => {
                          setSubdomainInput(e.target.value);
                          setSubdomainError(validateSubdomain(e.target.value));
                        }}
                        className="form-input"
                      />
                      {subdomainError && <div className="form-field-error-message">{subdomainError}</div>}
                    </div>

                    {/* Opções de clonagem */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <button
                        className="p-6 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:shadow-md"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--bg-card-hover)'
                        }}
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
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--accent)', color: 'white' }}>
                            <Edit className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Editor Visual</h3>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Clone e edite visualmente
                          </p>
                        </div>
                      </button>

                      <button
                        className="p-6 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:shadow-md"
                        style={{
                          borderColor: 'var(--border)',
                          background: 'var(--bg-card-hover)'
                        }}
                        disabled={actionLoading !== null || !cloneUrlToProcess}
                        onClick={async () => {
                          try {
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
                          } catch (error) {
                            setActionLoading(null);
                            setErrorModal('Erro ao processar ZIP. Verifique se a URL está correta e tente novamente.');
                            console.error('Erro ao baixar ZIP:', error);
                          }
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--primary)', color: 'white' }}>
                            <Download className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Download ZIP</h3>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Baixe o código fonte
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Loading overlay */}
                    {actionLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
                          <span style={{ color: 'var(--text)' }}>
                            {actionLoading === 'editor' ? 'Abrindo editor...' : 'Preparando download...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="app-modal-footer">
                    <button
                      className="secondary-button"
                      onClick={() => setCloneUrlToProcess(null)}
                      disabled={actionLoading !== null}
                    >
                      Cancelar
                    </button>
                  </div>
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

            {/* Modal de Sucesso da Clonagem */}
            {cloneSuccessData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg">
                  {/* Header com ícone de sucesso */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                      Site Clonado com Sucesso! 🎉
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                      Seu site está pronto para ser editado
                    </p>
                  </div>

                  {/* Informações do Site */}
                  <div className="space-y-4 mb-6">
                    {/* URL do Site */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        URL do Site
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={cloneSuccessData.url}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cloneSuccessData.url);
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
                    {cloneSuccessData.originalUrl && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          URL Original
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                          {cloneSuccessData.originalUrl}
                        </p>
                      </div>
                    )}

                    {/* Subdomínio */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        🌐 <strong>Subdomínio:</strong> {cloneSuccessData.subdomain}
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        navigate(`/tools/editor-studio?id=${cloneSuccessData.subdomain}`);
                        setCloneSuccessData(null);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Edit className="w-5 h-5" />
                      Editar Site
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cloneSuccessData.url);
                        alert('URL copiada!');
                      }}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Copy className="w-5 h-5" />
                      Copiar URL
                    </button>
                    <button
                      onClick={() => {
                        setCloneSuccessData(null);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Upload de ZIP */}
            {showUploadModal && (
              <div className="modal-overlay">
                <div className="modal-content max-w-2xl">
                  <div className="app-modal-header">
                    <h2 className="modal-title">
                      Hospedar Site
                    </h2>
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadZipFile(null);
                        setUploadSubdomain('');
                        setUploadSubdomainError(null);
                      }}
                      className="modal-close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                      Faça upload de um arquivo ZIP contendo seu site (HTML, CSS, JS, imagens, etc.)
                    </p>

                    <div className="space-y-6">
                      {/* Subdomain Section */}
                      <div className="form-field-wrapper">
                        <label className="form-field-label">Nome do site (subdomínio)</label>
                        <input
                          type="text"
                          placeholder="meusite"
                          value={uploadSubdomain}
                          maxLength={20}
                          onChange={(e) => {
                            setUploadSubdomain(e.target.value);
                            setUploadSubdomainError(validateSubdomain(e.target.value));
                          }}
                          className="form-input"
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Seu site ficará em: {uploadSubdomain || 'meusite'}.clonup.site
                        </p>
                        {uploadSubdomainError && (
                          <div className="form-field-error-message">{uploadSubdomainError}</div>
                        )}
                      </div>

                      {/* Upload Section */}
                      <div className="form-field-wrapper">
                        <label className="form-field-label">Arquivo ZIP</label>
                        <div
                          className="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-blue-400"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--bg-card-hover)'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'var(--accent-light)';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files.length > 0) {
                              const file = files[0];
                              if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
                                if (file.size > 50 * 1024 * 1024) {
                                  setErrorModal('O arquivo ZIP deve ter no máximo 50MB');
                                  return;
                                }
                                setUploadZipFile(file);
                              } else {
                                setErrorModal('Por favor, selecione apenas arquivos ZIP');
                              }
                            }
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                          }}
                          onClick={() => document.getElementById('zip-upload')?.click()}
                        >
                          {uploadZipFile ? (
                            <div className="space-y-3">
                              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--success-light)' }}>
                                <svg className="w-5 h-5" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{uploadZipFile.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  {(uploadZipFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadZipFile(null);
                                }}
                                className="text-xs px-2 py-1 rounded-md transition-colors"
                                style={{
                                  background: 'var(--error-light)',
                                  color: 'var(--error)'
                                }}
                              >
                                Remover
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                                <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                                  Arraste e solte aqui
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  ou clique para selecionar
                                </p>
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Máximo 50MB
                              </div>
                            </div>
                          )}
                        </div>
                        <input
                          id="zip-upload"
                          type="file"
                          accept=".zip"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 50 * 1024 * 1024) {
                                setErrorModal('O arquivo ZIP deve ter no máximo 50MB');
                                e.target.value = '';
                                return;
                              }
                              setUploadZipFile(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app-modal-footer">
                    <button
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadZipFile(null);
                        setUploadSubdomain('');
                        setUploadSubdomainError(null);
                      }}
                      className="secondary-button"
                      disabled={uploadLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleZipUpload}
                      disabled={!uploadZipFile || !uploadSubdomain || uploadLoading || !!uploadSubdomainError}
                      className="cta-button"
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
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Sucesso do Upload */}
            {uploadSuccess && (
              <div className="modal-overlay">
                <div className="modal-content max-w-lg">
                  <div className="app-modal-header">
                    <h2 className="modal-title">
                      🎉 Site Hospedado!
                    </h2>
                    <button
                      onClick={() => setUploadSuccess(null)}
                      className="modal-close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="app-modal-body">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-green-600 dark:text-green-400"
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
                      <div>
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                          Site Hospedado com Sucesso! 🎉
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Seu site está online e pronto para uso
                        </p>
                      </div>
                    </div>

                    {/* URL Display */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          navigate(`/tools/editor-studio?id=${uploadSuccess.subdomain}`);
                          setUploadSuccess(null);
                        }}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Editor
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uploadSuccess.siteUrl);
                          alert('✓ URL copiada para a área de transferência!');
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar
                      </button>
                      <button
                        onClick={() => window.open(uploadSuccess.siteUrl, '_blank')}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de clones */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Sites Clonados</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {clones.length} {clones.length === 1 ? 'site' : 'sites'}
                </span>
              </div>

              {/* Aviso para usuários em trial */}
              {profile?.subscription_status === 'trialing' && clones.length > 0 && (
                <div className="m-6 mb-0">
                  <div className="alert alert-warning">
                    <Download className="alert-icon" />
                    <div className="alert-content">
                      <div className="alert-title">Download bloqueado durante o teste</div>
                      <div className="alert-message">
                        O download de sites em ZIP está disponível apenas para assinantes.
                        <button
                          onClick={() => navigate('/escolher-plano')}
                          className="underline font-medium ml-1 hover:opacity-80"
                        >
                          Assine agora
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {clonesLoading ? (
                <div className="p-12 text-center">
                  <div className="loader mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary)' }}>Carregando sites...</p>
                </div>
              ) : clones.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
                    <Edit className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Nenhum site clonado ainda</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Clique em "Clonar Site" para começar</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {clones.map(clone => (
                    <div key={clone.id} className="p-6 hover:bg-opacity-50 transition" style={{ background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Status & Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {clone.url ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                ✓ Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                ⏳ Processando
                              </span>
                            )}
                            {clone.url && (
                              <a
                                href={clone.url}
                                className="text-sm font-semibold hover:opacity-80 transition truncate"
                                style={{ color: 'var(--accent)' }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {clone.url}
                              </a>
                            )}
                          </div>
                          {clone.original_url && (
                            <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <span className="font-semibold whitespace-nowrap">Original:</span>
                              <span className="truncate">{clone.original_url}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {clone.url && (
                            <>
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
                                className="cta-button"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleZipDownload(clone)}
                                disabled={actionLoading === 'zip' || profile?.subscription_status === 'trialing' || profile?.subscription_status !== 'active'}
                                className="secondary-button"
                                style={{
                                  padding: '0.5rem 1rem',
                                  fontSize: '0.875rem',
                                  opacity: (profile?.subscription_status === 'trialing' || profile?.subscription_status !== 'active') ? 0.5 : 1
                                }}
                                title={
                                  profile?.subscription_status === 'trialing'
                                    ? 'Download bloqueado durante o período de teste'
                                    : profile?.subscription_status !== 'active'
                                      ? 'Você precisa de um plano ativo'
                                      : 'Baixar ZIP'
                                }
                              >
                                {actionLoading === 'zip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                ZIP
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleOpenDomainConfig(clone)}
                            className="p-2 rounded-lg transition-colors hover:bg-blue-500/10"
                            style={{ color: 'var(--accent)' }}
                            title="Configurar domínio"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClone(clone.id)}
                            disabled={deleteLoadingId === clone.id}
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--error)' }}
                            title="Excluir"
                          >
                            {deleteLoadingId === clone.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de Configuração de Domínio */}
            {domainConfigModalOpen && selectedCloneForDomain && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                      Configurar Domínio Customizado
                    </h2>
                    <button
                      onClick={() => {
                        setDomainConfigModalOpen(false);
                        setSelectedCloneForDomain(null);
                        setDomainInput('');
                        setDomainConfig(null);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <X className="w-5 h-5" style={{ color: 'var(--text)' }} />
                    </button>
                  </div>

                  {/* Site info */}
                  <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-card-hover)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Site:</strong> {selectedCloneForDomain.url}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <strong>Subdomínio:</strong> {getSubdomainFromUrl(selectedCloneForDomain.url)}
                    </p>
                  </div>

                  {/* Aviso sobre novo sistema de clonagem */}
                  <div className="mb-6 p-4 rounded-lg border-2 border-blue-500" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                          Novo Sistema de Clonagem e Hospedagem Premium
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Para adicionar domínio próprio em sites clonados, você precisará clonar o site novamente usando nosso novo sistema de clonagem e hospedagem premium. Sites clonados anteriormente precisam ser recriados para suportar domínios customizados.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aviso sobre assinatura necessária */}
                  {profile?.subscription_status !== 'active' && (
                    <div className="mb-6 p-4 rounded-lg border-2 border-yellow-500" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                            Assinatura Necessária
                          </h3>
                          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                            Para configurar domínio próprio você precisa de uma assinatura ativa. Assine um plano para continuar.
                          </p>
                          <button
                            onClick={() => navigate('/escolher-plano')}
                            className="cta-button text-sm"
                          >
                            Assine Agora
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulário para adicionar domínio */}
                  <div className="space-y-4 mb-6">
                    <div className="form-field-wrapper">
                      <label className="form-field-label">
                        Domínio Customizado
                      </label>
                      <input
                        type="text"
                        placeholder="meusite.com.br"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        disabled={domainLoading || profile?.subscription_status !== 'active'}
                        className="form-input"
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Digite o domínio que deseja usar (sem http:// ou https://)
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddDomain}
                        disabled={domainLoading || !domainInput.trim() || profile?.subscription_status !== 'active'}
                        className="cta-button"
                        style={{
                          opacity: profile?.subscription_status !== 'active' ? 0.6 : 1,
                          cursor: profile?.subscription_status !== 'active' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {domainLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adicionando...
                          </>
                        ) : (
                          'Adicionar Domínio'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setDomainConfigModalOpen(false);
                          setSelectedCloneForDomain(null);
                          setDomainInput('');
                          setDomainConfig(null);
                        }}
                        className="secondary-button"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>

                  {/* Instruções DNS - sempre mostrar se disponível */}
                  {domainConfig && domainConfig.dnsInstructions && (
                    <div className="space-y-6 mt-6">
                      <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card-hover)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-blue-500" />
                          <p className="font-semibold" style={{ color: 'var(--text)' }}>
                            Instruções DNS para Configurar Domínio
                          </p>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {domainConfig.domain ? domainConfig.message : 'Siga as instruções abaixo para configurar seu domínio próprio no provedor de DNS. Você pode usar uma das duas opções disponíveis.'}
                        </p>
                        {typeof domainConfig.ownershipVerified === 'boolean' && typeof domainConfig.configured === 'boolean' && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <div>
                              <span className="font-semibold" style={{ color: 'var(--text)' }}>Propriedade (TXT):</span>{' '}
                              {domainConfig.ownershipVerified ? 'OK' : 'Pendente'}
                            </div>
                            <div>
                              <span className="font-semibold" style={{ color: 'var(--text)' }}>Apontamento (CNAME/A):</span>{' '}
                              {domainConfig.configured ? 'OK' : 'Pendente'}
                            </div>
                            <div>
                              <span className="font-semibold" style={{ color: 'var(--text)' }}>Verificado:</span>{' '}
                              {domainConfig.verified ? 'OK' : 'Pendente'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Novo formato: lista plana de registros (records[]) */}
                      {Array.isArray(domainConfig.dnsInstructions.records) && domainConfig.dnsInstructions.records.length > 0 && (
                        <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
                            Registros DNS
                          </h3>
                          <div className="space-y-3">
                            {domainConfig.dnsInstructions.records.map((record: DnsRecord, i: number) => (
                              <div
                                key={i}
                                className="p-4 rounded border"
                                style={{ borderColor: 'var(--border)', background: 'var(--bg-card-hover)' }}
                              >
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  <div>
                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                      Tipo
                                    </p>
                                    <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                      {record.type}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                      Nome
                                    </p>
                                    <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                      {record.fullName || record.name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                      Valor
                                    </p>
                                    <p className="font-mono text-sm break-all" style={{ color: 'var(--text)' }}>
                                      {record.value}
                                    </p>
                                  </div>
                                </div>
                                {(record.reason || record.note) && (
                                  <p className="text-xs italic mt-2" style={{ color: 'var(--text-secondary)' }}>
                                    {[record.reason, record.note].filter(Boolean).join(' — ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          {domainConfig.dnsInstructions.note && (
                            <p className="text-xs italic p-3 rounded mt-4" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}>
                              {domainConfig.dnsInstructions.note}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Se tiver duas opções (option1 e option2) */}
                      {domainConfig.dnsInstructions.option1 && domainConfig.dnsInstructions.option2 && (
                        <>
                          {/* Opção 1: Nameservers */}
                          <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                              {domainConfig.dnsInstructions.option1.title}
                            </h3>
                            {domainConfig.dnsInstructions.option1.description && (
                              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                {domainConfig.dnsInstructions.option1.description}
                              </p>
                            )}

                            <div className="mb-4">
                              <p className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                                Nameservers:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {domainConfig.dnsInstructions.option1.nameservers?.map((ns: string, i: number) => (
                                  <div
                                    key={i}
                                    className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm"
                                    style={{ color: 'var(--text)' }}
                                  >
                                    {ns}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {domainConfig.dnsInstructions.option1.steps && (
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                                  Passo a passo:
                                </h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {domainConfig.dnsInstructions.option1.steps.map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {domainConfig.dnsInstructions.option1.note && (
                              <p className="text-xs italic p-3 rounded" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}>
                                {domainConfig.dnsInstructions.option1.note}
                              </p>
                            )}
                          </div>

                          {/* Opção 2: Registros DNS */}
                          <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                              {domainConfig.dnsInstructions.option2.title}
                            </h3>
                            {domainConfig.dnsInstructions.option2.description && (
                              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                {domainConfig.dnsInstructions.option2.description}
                              </p>
                            )}

                            <div className="mb-4">
                              <p className="font-semibold mb-3" style={{ color: 'var(--text)' }}>
                                Registros DNS:
                              </p>
                              <div className="space-y-3">
                                {domainConfig.dnsInstructions.option2.records?.map((record: DnsRecord, i: number) => (
                                  <div
                                    key={i}
                                    className="p-4 rounded border"
                                    style={{ borderColor: 'var(--border)', background: 'var(--bg-card-hover)' }}
                                  >
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                      <div>
                                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                          Tipo
                                        </p>
                                        <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                          {record.type}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                          Nome
                                        </p>
                                        <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                          {record.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                          Valor
                                        </p>
                                        <p className="font-mono text-sm break-all" style={{ color: 'var(--text)' }}>
                                          {record.value}
                                        </p>
                                      </div>
                                    </div>
                                    {record.note && (
                                      <p className="text-xs italic mt-2" style={{ color: 'var(--text-secondary)' }}>
                                        {record.note}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {domainConfig.dnsInstructions.option2.steps && (
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
                                  Passo a passo:
                                </h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {domainConfig.dnsInstructions.option2.steps.map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {domainConfig.dnsInstructions.option2.note && (
                              <p className="text-xs italic p-3 rounded" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}>
                                {domainConfig.dnsInstructions.option2.note}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Formato antigo (compatibilidade) */}
                      {domainConfig.dnsInstructions.type && !domainConfig.dnsInstructions.option1 && (
                        <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
                            Instruções DNS
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Tipo
                              </p>
                              <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                {domainConfig.dnsInstructions.type}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Nome/Host
                              </p>
                              <p className="font-mono text-sm" style={{ color: 'var(--text)' }}>
                                {domainConfig.dnsInstructions.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                Valor/Destino
                              </p>
                              <p className="font-mono text-sm break-all" style={{ color: 'var(--text)' }}>
                                {domainConfig.dnsInstructions.value}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                                TTL
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text)' }}>
                                3600 (ou padrão)
                              </p>
                            </div>
                            {domainConfig.dnsInstructions.note && (
                              <p className="text-xs italic mt-3" style={{ color: 'var(--text-secondary)' }}>
                                {domainConfig.dnsInstructions.note}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={checkDomainStatus}
                          disabled={domainChecking}
                          className="cta-button"
                        >
                          {domainChecking ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            'Verificar Agora'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setDomainConfigModalOpen(false);
                            setSelectedCloneForDomain(null);
                            setDomainInput('');
                            setDomainConfig(null);
                          }}
                          className="secondary-button"
                        >
                          Fechar
                        </button>
                      </div>

                      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                        ⏱️ Verificando automaticamente a cada 10 segundos...
                      </p>
                    </div>
                  )}

                  {/* Domínio verificado */}
                  {domainConfig && domainConfig.verified && (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg border-2 border-green-500" style={{ background: 'var(--bg-card)' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="w-8 h-8 text-green-500" />
                          <h3 className="text-xl font-bold text-green-600">
                            Domínio Verificado!
                          </h3>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
                          {domainConfig.message}
                        </p>
                        <div className="p-4 rounded" style={{ background: 'var(--bg-card-hover)' }}>
                          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                            Seu site está disponível em:
                          </p>
                          <a
                            href={`https://${domainConfig.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-blue-600 hover:underline"
                          >
                            https://{domainConfig.domain}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDomainConfigModalOpen(false);
                          setSelectedCloneForDomain(null);
                          setDomainInput('');
                          setDomainConfig(null);
                        }}
                        className="cta-button w-full"
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </StandardNavigation>
  );
}