import { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, ArrowLeft, Facebook, Globe, Smartphone, Tablet, Monitor, Wrench } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';
import { useAuthStore } from '../../store/authStore';

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        OfferTrack
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
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export function CreateCampaign() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);

  const toggleDevice = (device: string) => {
    setSelectedDevices(prev =>
      prev.includes(device)
        ? prev.filter(d => d !== device)
        : [...prev, device]
    );
  };

  const toggleNetwork = (network: string) => {
    setSelectedNetworks(prev =>
      prev.includes(network)
        ? prev.filter(n => n !== network)
        : [...prev, network]
    );
  };

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <Layout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
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
      label: "Filtro de Tráfego",
      href: "#",
      icon: (
        <svg className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg>
      ),
      subLinks: [
        { label: "Requisições", href: "/traffic-filter/requests", icon: <Circle className="h-4 w-4" /> },
        { label: "Domínios", href: "/traffic-filter/domains", icon: <Circle className="h-4 w-4" /> },
        { label: "Relatórios", href: "/traffic-filter/reports", icon: <Circle className="h-4 w-4" /> },
        { label: "Campanha", href: "/traffic-filter/campaigns", icon: <Circle className="h-4 w-4" /> },
      ],
    },
    {
      label: "Ferramentas",
      href: "#",
      icon: <Wrench className="text-neutral-700 dark:text-neutral-200 h-5 w-5" />,
      subLinks: [
        { label: "Criptografar Texto", href: "/tools/encrypt", icon: <Circle className="h-4 w-4" /> },
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> },
        { label: "Clonar Sites", href: "/tools/clonesites", icon: <Circle className="h-4 w-4" /> },
      ],
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
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/traffic-filter/campaigns"
                  className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : ''}`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </Link>
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Criar Campanha
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nome da Campanha*</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Ex: Black Friday 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Página Segura*</label>
                <div className="flex gap-2">
                  <span className={`px-3 py-2 rounded-l-lg border-y border-l ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                    }`}>
                    https://
                  </span>
                  <input
                    type="text"
                    className={`flex-1 px-4 py-2 rounded-r-lg border ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="exemplo.com/pagina-segura"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Página de Oferta*</label>
                <div className="flex gap-2">
                  <span className={`px-3 py-2 rounded-l-lg border-y border-l ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-400'
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                    }`}>
                    https://
                  </span>
                  <input
                    type="text"
                    className={`flex-1 px-4 py-2 rounded-r-lg border ${theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="exemplo.com/oferta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Network*</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
                    { name: 'TikTok', icon: <Globe className="w-5 h-5" /> },
                    { name: 'Google Ads', icon: <Globe className="w-5 h-5" /> },
                    { name: 'Kwai', icon: <Globe className="w-5 h-5" /> },
                  ].map((network) => (
                    <button
                      key={network.name}
                      onClick={() => toggleNetwork(network.name)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${selectedNetworks.includes(network.name)
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {network.icon}
                      {network.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dispositivo*</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: 'Celular', icon: <Smartphone className="w-5 h-5" /> },
                    { name: 'Tablet', icon: <Tablet className="w-5 h-5" /> },
                    { name: 'Computador', icon: <Monitor className="w-5 h-5" /> },
                  ].map((device) => (
                    <button
                      key={device.name}
                      onClick={() => toggleDevice(device.name)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${selectedDevices.includes(device.name)
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {device.icon}
                      {device.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link
                  to="/traffic-filter/campaigns"
                  className={`px-4 py-2 rounded-lg ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                    }`}
                >
                  Cancelar
                </Link>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Campanha
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const mockUser = {
  name: 'John Doe',

  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};