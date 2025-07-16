import { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Sidebar, SidebarBody, SidebarLink } from '../../components/ui/sidebar';
import { Layout, UserCog, LogOut, Wrench, Circle, SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import LogoBranco from '../../assets/logo-branco.png';
import IconBranco from '../../assets/ico-branco.png';

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

export function EncryptText() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const homoglyphs: { [key: string]: string } = {
    'a': 'а', // cyrillic a
    'b': 'b', // mantemos para parecer normal
    'c': 'с', // cyrillic c
    'd': 'ԁ', // cyrillic d
    'e': 'е', // cyrillic e
    'g': 'ɡ', // latin g
    'h': 'һ', // cyrillic h
    'i': 'і', // cyrillic i
    'k': 'κ', // greek k
    'l': 'ⅼ', // roman numeral l
    'm': 'м', // cyrillic m
    'n': 'ո', // armenian n
    'o': 'о', // cyrillic o
    'p': 'р', // cyrillic p
    'q': 'ԛ', // cyrillic q
    'r': 'r', // keep r
    's': 'ѕ', // cyrillic s
    't': 'т', // cyrillic t
    'u': 'υ', // greek u
    'v': 'ѵ', // cyrillic v
    'w': 'ԝ', // cyrillic w
    'x': 'х', // cyrillic x
    'y': 'у', // cyrillic y
    'z': 'ᴢ', // latin z
    'ç': 'ҫ', // cyrillic c cedilha
    'á': 'а́',
    'é': 'е́',
    'ã': 'а̃',
    'õ': 'о̃',
    'â': 'а̂',
    'ê': 'е̂',
  };

  function obfuscateChar(char: string) {
    const lower = char.toLowerCase();
    const mapped = homoglyphs[lower] || char;
    const finalChar = (char === char.toUpperCase()) ? mapped.toUpperCase() : mapped;
    return finalChar + '\u200B'; // adiciona um caractere invisível após cada letra
  }

  const encryptText = () => {
    const result = input.split('').map(obfuscateChar).join('');
    setOutput(result);
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Criptografar Texto</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Texto para criptografar:</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`w-full px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base`}
                  rows={4}
                  placeholder="Digite seu texto aqui..."
                />
              </div>

              <button
                onClick={encryptText}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criptografar
              </button>

              {output && (
                <div>
                  <label className="block text-sm font-medium mb-2">Resultado:</label>
                  <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg break-all text-sm sm:text-base">{output}</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
