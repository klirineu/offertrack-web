import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, Moon, Sun, Bell, Globe, Wrench, Clock } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../components/ui/sidebar';
import { useAuth } from '../context/AuthContext';
import { checkTrialStatus } from '../utils/trialUtils';



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

export function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();

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
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Configurações</h1>
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

          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 dark:text-white">Configurações</h1>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">Aparência</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Tema</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
                  >
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">Notificações</h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Email Notificações</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-semibold mb-4 dark:text-white">Idioma e Região</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Idioma</span>
                  </div>
                  <select className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 border-0 rounded-md px-3 py-2 text-sm sm:text-base">
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}