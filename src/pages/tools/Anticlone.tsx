import { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout, UserCog, Settings as SettingsIcon, LogOut, Circle, ArrowLeft, Plus, Copy, ExternalLink, Shield, Wrench } from 'lucide-react';
import { SidebarBody, SidebarLink, Sidebar } from '../../components/ui/sidebar';

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const mockOffers = [
  {
    id: '1',
    originalUrl: 'https://meusite.com/oferta1',
    createdAt: '2024-04-01',
    clonedDomains: [
      {
        domain: 'sitepirata1.com',
        firstSeen: '2024-04-02',
        redirectUrl: 'https://checkoutseguro.com/oferta1'
      },
      {
        domain: 'clone2.net',
        firstSeen: '2024-04-03',
        redirectUrl: null
      }
    ]
  }
];

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

export function Anticlone() {
  const { theme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [newOfferUrl, setNewOfferUrl] = useState('');
  const [newRedirectUrl, setNewRedirectUrl] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

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
        { label: "Anticlone", href: "/tools/anticlone", icon: <Circle className="h-4 w-4" /> }
      ],
    },
    {
      label: "Logout",
      href: "/logout",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const handleCopyScript = (offerId: string) => {
    const script = `<script src="https://meusistema.com/anticlone/${offerId}.js"></script>`;
    navigator.clipboard.writeText(script);
  };

  const handleSaveRedirect = (domain: string) => {
    // Implement save redirect logic here
    setSelectedDomain(null);
    setNewRedirectUrl('');
  };

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
                label: mockUser.name,
                href: "/profile",
                icon: (
                  <img
                    src={mockUser.avatar}
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
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Anticlone
                </h1>
              </div>
              <button
                onClick={() => setShowNewOfferForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Oferta
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {showNewOfferForm ? (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <h2 className="text-lg font-semibold mb-4">Nova Oferta</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL da Oferta*</label>
                  <input
                    type="url"
                    value={newOfferUrl}
                    onChange={(e) => setNewOfferUrl(e.target.value)}
                    placeholder="https://meusite.com/oferta"
                    className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowNewOfferForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Implement save logic
                      setShowNewOfferForm(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="px-6 py-3">URL Original</th>
                    <th className="px-6 py-3">Data Cadastro</th>
                    <th className="px-6 py-3">Clones Detectados</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOffers.map((offer) => (
                    <tr key={offer.id} className={`border-t border-gray-200 dark:border-gray-700`}>
                      <td className="px-6 py-4">{offer.originalUrl}</td>
                      <td className="px-6 py-4">{new Date(offer.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{offer.clonedDomains.length}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyScript(offer.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            title="Copiar Script"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedOffer(offer.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            title="Ver Detalhes"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedOffer && (
            <div className={`mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Domínios Clonados</h2>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {mockOffers[0].clonedDomains.map((clone) => (
                  <div
                    key={clone.domain}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{clone.domain}</span>
                      <span className="text-sm text-gray-500">
                        Detectado em: {new Date(clone.firstSeen).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedDomain === clone.domain ? (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">URL de Redirecionamento</label>
                          <input
                            type="url"
                            value={newRedirectUrl}
                            onChange={(e) => setNewRedirectUrl(e.target.value)}
                            placeholder="https://checkoutseguro.com/oferta"
                            className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedDomain(null)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveRedirect(clone.domain)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm">
                          {clone.redirectUrl ? (
                            <span className="text-green-600 dark:text-green-400">
                              Redirecionando para: {clone.redirectUrl}
                            </span>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Nenhuma ação configurada
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedDomain(clone.domain)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Configurar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}