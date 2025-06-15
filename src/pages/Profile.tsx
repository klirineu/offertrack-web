import React from 'react';
import { User, Mail, CreditCard, Circle, Wrench } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { differenceInCalendarDays } from 'date-fns';

import LogoBranco from '../assets/logo-branco.png';
import IconBranco from '../assets/ico-branco.png';

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

export function Profile() {
  const { theme } = useThemeStore();
  const [open, setOpen] = React.useState(false);
  const { user, profile, updateProfile, isLoading, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Calcular início e expiração da assinatura
  let inicioAssinatura = null;
  let expiraEm = null;
  if (profile?.subscription_renewed_at) {
    inicioAssinatura = new Date(profile.subscription_renewed_at);
    expiraEm = addMonths(inicioAssinatura, 1);
  }

  // Calcular dias restantes
  let diasRestantes = null;
  if (expiraEm) {
    const agora = new Date();
    diasRestantes = differenceInCalendarDays(expiraEm, agora);
  }

  // Status em português
  const statusPt = profile?.subscription_status
    ? {
      active: 'Ativa',
      trialing: 'Em avaliação',
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

  // Cancelar assinatura
  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    setCancelLoading(true);
    await supabase
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('id', profile.id);
    if (typeof window !== 'undefined' && window.location) window.location.reload();
    setCancelLoading(false);
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
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      // Remove formatação do telefone antes de salvar
      const phoneNumbers = phone.replace(/\D/g, '');

      const { error } = await updateProfile({
        full_name: fullName,
        phone: phoneNumbers
      });

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
    //     <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
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
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Profile
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || user?.email || 'U')}
                  alt={profile?.full_name || user?.email || 'Usuário'}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold dark:text-white">{profile?.full_name || user?.email || 'Usuário'}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  {user?.created_at && (
                    <p className="text-gray-500 text-sm mt-1">Cadastrado em: {format(new Date(user.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Status: <b>{profile ? statusPt : ''}</b><br />
                    {expiraEm && profile ? (
                      <>
                        Sua assinatura é válida até: <b>{format(expiraEm, 'dd/MM/yyyy', { locale: ptBR })}</b><br />
                        {diasRestantes && diasRestantes > 0
                          ? `Faltam ${diasRestantes} dias para expirar.`
                          : 'Sua assinatura expirou.'}
                      </>
                    ) : null}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={handleManage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gerenciar Assinatura
                  </button>
                  {/* <button
                    onClick={handleCancel}
                    disabled={cancelLoading || !!(profile && profile.subscription_status === 'canceled')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                  >
                    {cancelLoading ? 'Cancelando...' : 'Cancelar Assinatura'}
                  </button> */}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Informações do Perfil
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile?.full_name || '');
                        setPhone(profile?.phone || '');
                      }}
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded text-green-500">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profile?.full_name || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone/WhatsApp
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(99) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{profile?.email}</p>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Trocar Senha</h3>
              {passwordSuccess && <div className="mb-2 p-2 bg-green-100 text-green-700 rounded">{passwordSuccess}</div>}
              {passwordError && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{passwordError}</div>}
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {passwordLoading ? 'Salvando...' : 'Trocar Senha'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}