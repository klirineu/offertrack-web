import { useState } from 'react';
import { Board } from '../components/Board';
import { NewOfferDialog } from '../components/NewOfferDialog';
import { EditOfferDialog } from '../components/EditOfferDialog';
import { useThemeStore } from '../store/themeStore';
import { useModalStore } from '../store/modalStore';
import { Link } from 'react-router-dom';
import { Layout, UserCog, Settings as SettingsIcon, Circle, Wrench, Users, Clock, Star, LogOut } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../components/ui/sidebar';
import { useAuth } from '../context/AuthContext';
import { checkTrialStatus } from '../utils/trialUtils';

import LogoIcon from '../assets/favicon.png';


const Logo = () => {
  return (
    <Link to="/" className="logo" style={{ fontSize: '1.5rem', padding: '0.5rem' }}>
      <div className="logo-icon" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
        <img src={LogoIcon} alt="ClonUp" style={{ width: '40', height: '40' }} />
      </div>
      ClonUp
    </Link>
  );
};

const LogoIconOnly = () => {
  return (
    <Link to="/" className="logo-icon" title="ClonUp" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
      <img src={LogoIcon} alt="ClonUp" style={{ width: '40px', height: '40px' }} />
    </Link>
  );
};

export function Dashboard() {
  const { theme } = useThemeStore(); // Obtenha o tema do store
  const [open, setOpen] = useState(true); // Sidebar aberto por padrão
  const { user, profile, signOut } = useAuth();
  const {
    isNewOfferDialogOpen,
    setIsNewOfferDialogOpen,
    isEditOfferDialogOpen,
    offers,
    onOfferUpdated,
    onNewOffer
  } = useModalStore();
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Layout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    // Adicionar link de Ofertas Escaladas apenas para usuários autorizados
    ...(profile?.email === 'klirineu.js@gmail.com' || profile?.email === 'naclisboa@gmail.com' ? [{
      label: "Ofertas Escaladas",
      href: "/escalated-offers",
      icon: (
        <Star className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    }] : []),
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
        { label: "Trackeamento", href: "/tools/trackeamento", icon: <Circle className="h-4 w-4" /> },
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Sites", href: "/tools/clonesites", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Quiz", href: "/tools/clonequiz", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    // Adiciona link de admin apenas para usuários admin
    ...(profile?.role === 'admin' ? [{
      label: "Administração",
      href: "/admin",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    }] : []),
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
  ];

  return (
    <div className="min-h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className={`w-64 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0 z-40`}>
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIconOnly />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="mt-auto border-t" style={{ borderColor: 'rgba(30, 41, 59, 0.5)', paddingTop: '1rem' }}>
            {/* Seção do Usuário */}
            <div className="px-2 py-3 border-t" style={{ borderColor: 'rgba(30, 41, 59, 0.5)' }}>
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.full_name || user?.email || 'U')}
                  className="h-8 w-8 flex-shrink-0 rounded-full"
                  alt="Avatar"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {profile?.full_name || 'Usuário'}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${profile?.subscription_status === 'active'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                      : profile?.subscription_status === 'trialing'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                      {profile?.subscription_status === 'active' ? 'PREMIUM' :
                        profile?.subscription_status === 'trialing' ? 'TRIAL' : 'FREE'}
                    </span>
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Sair */}
            <div className="px-2 py-2">
              <button
                onClick={async () => {
                  await signOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-red-500/10 hover:text-red-400"
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className={`${open ? 'md:pl-[240px]' : 'md:pl-[70px]'} transition-all duration-300`} style={{ position: 'relative', zIndex: 1 }}>
        <header className={`page-header ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="page-header-icon">
            <Layout className="w-6 h-6" />
          </div>
          <div className="page-header-content">
            <h1 className="page-header-title">Gestão de Ofertas</h1>
            <p className="page-header-subtitle">Gerencie todas as suas ofertas em um só lugar</p>
          </div>
        </header>

        <main className="px-4 py-8 lg:px-8" style={{ position: 'relative', zIndex: 1, paddingTop: '100px' }}>
          {/* Trial Status Banner */}
          {profile?.subscription_status === 'trialing' && (
            <div className="alert alert-info mb-6">
              <Clock className="alert-icon" />
              <div className="alert-content">
                <div className="alert-title">
                  Período de Teste Gratuito
                </div>
                <div className="alert-message">
                  {(() => {
                    const trialStatus = checkTrialStatus({
                      subscription_status: profile.subscription_status,
                      trial_started_at: profile.trial_started_at,
                      created_at: profile.created_at
                    });
                    return `Você tem ${trialStatus.daysRemaining} ${trialStatus.daysRemaining === 1 ? 'dia restante' : 'dias restantes'} no seu período de teste. Aproveite todos os recursos do plano Starter!`;
                  })()}
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/escolher-plano'}
                className="cta-button"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Ver Planos
              </button>
            </div>
          )}

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

          <Board />
        </main>
      </div>
      {/* <ClonupFloatingWidget /> */}

      {/* Modais renderizados fora do StandardNavigation para overlay completo */}
      <NewOfferDialog
        isOpen={isNewOfferDialogOpen}
        onClose={() => setIsNewOfferDialogOpen(false)}
        onSubmit={onNewOffer || (async () => { })}
      />
      {isEditOfferDialogOpen && (
        <EditOfferDialog
          offers={offers}
          onOfferUpdated={onOfferUpdated || (() => { })}
        />
      )}
    </div>
  );
}