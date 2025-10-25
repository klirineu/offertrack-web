import React from 'react';
import { User, Settings, CreditCard, LogOut } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

// Adicionar tipo mínimo para Sidebar
export type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

interface SidebarProps {
  user: SidebarUser;
}

// components/Sidebar.tsx
// components/Sidebar.tsx
export function Sidebar({ user }: SidebarProps) {
  const { theme } = useThemeStore();

  return (
    <div className={`w-64 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r h-screen fixed left-0 top-0`} style={{
      background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 30px rgba(37, 99, 235, 0.2)',
      borderRight: '1px solid rgba(37, 99, 235, 0.3)'
    }}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <a
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}
          >
            <User className="w-5 h-5" />
            Profile
          </a>
          <a
            href="#subscription"
            className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}
          >
            <CreditCard className="w-5 h-5" />
            Subscription
          </a>
          <a
            href="/settings"
            className={`flex items-center gap-2 px-4 py-2 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'} rounded-md`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>
      </div>

      <div className={`absolute bottom-0 w-full p-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} border-t`}>
        <button
          className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} w-full px-4 py-2`}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}