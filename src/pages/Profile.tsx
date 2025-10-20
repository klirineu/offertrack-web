import React from 'react';
import { User, Mail, CreditCard, AlertCircle } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { StandardNavigation } from '../components/StandardNavigation';
import { useAuth } from '../context/AuthContext';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { checkTrialStatus } from '../utils/trialUtils';
import { formatPhone, validatePhone, cleanPhone } from '../utils/phoneValidation';


export function Profile() {
  const { theme } = useThemeStore();
  const [open, setOpen] = React.useState(false);
  const { user, profile, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState((profile as any)?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      const phoneNumber = (profile as any)?.phone || '';
      // Se o telefone já está formatado, mantém; senão formata
      setPhone(phoneNumber.includes('(') ? phoneNumber : formatPhone(phoneNumber));
    }
  }, [profile]);

  // Calcular início e expiração da assinatura
  let inicioAssinatura = null;
  let expiraEm = null;
  let diasRestantes = null;
  let statusInfo = '';

  // Verificar se está em trial
  if (profile?.subscription_status === 'trialing') {
    const trialStatus = checkTrialStatus({
      subscription_status: profile.subscription_status,
      trial_started_at: profile.trial_started_at,
      created_at: profile.created_at
    });

    if (trialStatus.isInTrial) {
      diasRestantes = trialStatus.daysRemaining;
      expiraEm = trialStatus.trialEndDate;
      statusInfo = `Período de teste gratuito - ${diasRestantes} ${diasRestantes === 1 ? 'dia restante' : 'dias restantes'}`;
    }
  } else if (profile?.subscription_renewed_at) {
    inicioAssinatura = new Date(profile.subscription_renewed_at);
    expiraEm = addMonths(inicioAssinatura, 1);

    if (expiraEm) {
      const agora = new Date();
      diasRestantes = differenceInCalendarDays(expiraEm, agora);
      statusInfo = `Sua assinatura é válida até: ${format(expiraEm, 'dd/MM/yyyy', { locale: ptBR })}`;

      if (diasRestantes && diasRestantes > 0) {
        statusInfo += ` - Faltam ${diasRestantes} dias para expirar.`;
      } else {
        statusInfo += ' - Sua assinatura expirou.';
      }
    }
  }

  // Status em português
  const statusPt = profile?.subscription_status
    ? {
      active: 'Ativa',
      trialing: 'Período de Teste (7 dias grátis)',
      canceled: 'Cancelada',
      expired: 'Expirada',
      past_due: 'Pagamento em atraso',
      unpaid: 'Não paga',
    }[profile.subscription_status] || profile.subscription_status
    : '';

  // Gerenciar assinatura
  const handleManage = () => {
    window.location.href = '/escolher-plano';
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara (99) 99999-9999
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers.length === 0 ? '' : `(${numbers}`;
      }
      if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      }
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }

    // Se tiver mais que 11 dígitos, corta
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);

    // Validar apenas se o campo não estiver vazio
    if (formatted.length > 0) {
      const error = validatePhone(formatted);
      setPhoneError(error);
    } else {
      setPhoneError('');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar telefone antes de salvar
    if (phone && phoneError) {
      setError('Por favor, corrija o número de telefone.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone ? cleanPhone(phone) : ''
      } as any);

      if (error) throw error;

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!password || password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    setPasswordLoading(true);
    const { error } = await changePassword(password);
    setPasswordLoading(false);
    if (error) setPasswordError('Erro ao trocar senha.');
    else {
      setPasswordSuccess('Senha alterada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Profile
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <img
                  src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || user?.email || 'U')}
                  alt={profile?.full_name || user?.email || 'Usuário'}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-semibold dark:text-white">{profile?.full_name || user?.email || 'Usuário'}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{user?.email}</p>
                  {user?.created_at && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Cadastrado em: {format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base break-all">{user?.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Status: <b>{profile ? statusPt : ''}</b><br />
                    {statusInfo}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                  <button
                    onClick={handleManage}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Gerenciar Assinatura
                  </button>
                  {/* <button
                    onClick={handleCancel}
                    disabled={cancelLoading || !!(profile && profile.subscription_status === 'canceled')}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 text-sm sm:text-base"
                  >
                    {cancelLoading ? 'Cancelando...' : 'Cancelar Assinatura'}
                  </button> */}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Informações do Perfil
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm sm:text-base"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || '');
                        const phoneNumber = (profile as any)?.phone || '';
                        // Se o telefone já está formatado, mantém; senão formata
                        setPhone(phoneNumber.includes('(') ? phoneNumber : formatPhone(phoneNumber));
                      }}
                      className="w-full sm:w-auto text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm sm:text-base">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 sm:p-4 bg-green-500/10 border border-green-500 rounded text-green-500 text-sm sm:text-base">
                  {success}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base">{profile?.full_name || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone/WhatsApp
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className={`w-full px-3 py-2 pr-10 border rounded-md dark:bg-gray-700 dark:text-white text-sm sm:text-base ${phoneError
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : phone.length >= 14 && !phoneError
                            ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2`}
                      />
                      {phoneError ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      ) : phone.length >= 14 && !phoneError ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : null}
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-500">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-white text-sm sm:text-base">
                      {(profile as any)?.phone ? formatPhone((profile as any).phone) : 'Não informado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white text-sm sm:text-base break-all">{profile?.email}</p>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">Trocar Senha</h3>
              {passwordSuccess && <div className="mb-2 p-2 sm:p-3 bg-green-100 text-green-700 rounded text-sm sm:text-base">{passwordSuccess}</div>}
              {passwordError && <div className="mb-2 p-2 sm:p-3 bg-red-100 text-red-700 rounded text-sm sm:text-base">{passwordError}</div>}
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 text-sm sm:text-base"
                >
                  {passwordLoading ? 'Salvando...' : 'Trocar Senha'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </StandardNavigation>
  );
}