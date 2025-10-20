import { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Filter, Search, Eye } from 'lucide-react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useAuth } from '../../context/AuthContext';

const mockRequests = [
  {
    id: 1,
    date: '2024-04-01',
    ip: '192.168.1.1',
    status: 'blocked',
    details: {
      userAgent: 'Mozilla/5.0...',
      country: 'Brazil',
      city: 'São Paulo'
    }
  },
  {
    id: 2,
    date: '2024-04-01',
    ip: '192.168.1.2',
    status: 'pending',
    details: {
      userAgent: 'Mozilla/5.0...',
      country: 'Brazil',
      city: 'Rio de Janeiro'
    }
  }
];

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

export function Requests() {
  const { theme } = useThemeStore();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  return (
    <StandardNavigation>
      <div className="transition-all duration-300">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-6 h-6 text-blue-600" />
                <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Requisições
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'pending'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setActiveTab('blocked')}
                  className={`px-3 py-2 rounded-md ${activeTab === 'blocked'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  Bloqueadas
                </button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por IP"
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">IP</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRequests.map((request) => (
                    <tr key={request.id} className={`border-t border-gray-200 dark:border-gray-700 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <td className="px-6 py-4">{new Date(request.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{request.ip}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${request.status === 'blocked'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {request.status === 'blocked' ? 'Bloqueado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </StandardNavigation>
  );
}