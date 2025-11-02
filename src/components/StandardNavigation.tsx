import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Wrench, Star } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from './ui/sidebar';
import { useAuth } from '../context/AuthContext';

import LogoIcon from '../assets/favicon.png';

const Logo = () => {
  return (
    <Link to="/" className="logo" style={{ fontSize: '1.5rem', padding: '0.5rem' }}>
      <div className="logo-icon" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
        <img src={LogoIcon} alt="ClonUp" style={{ width: '40px', height: '40px' }} />
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

interface StandardNavigationProps {
  children: React.ReactNode | ((sidebarOpen: boolean) => React.ReactNode);
}

export function StandardNavigation({ children }: StandardNavigationProps) {
  const [open, setOpen] = useState(true); // Sidebar aberto por padrão
  const { user, profile, signOut } = useAuth();

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Layout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    // Adicionar link de Ofertas Escaladas - desabilitado se não tiver assinatura ativa
    {
      label: "Ofertas Escaladas",
      href: profile?.subscription_status === 'active' ? "/escalated-offers" : "#",
      icon: (
        <Star className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      disabled: profile?.subscription_status !== 'active',
    },
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
      label: "Admin",
      href: "/admin",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
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
        <SidebarBody className="w-64 border-r h-screen fixed left-0 top-0 z-40">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIconOnly />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="mt-auto border-t" style={{ borderColor: 'rgba(30, 41, 59, 0.5)', paddingTop: '1rem' }}>
            {/* Perfil */}
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

      <div className={`${open ? 'md:pl-[240px]' : 'md:pl-[70px]'} transition-all duration-300`}>
        {typeof children === 'function' ? children(open) : children}
      </div>
    </div>
  );
}
