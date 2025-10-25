import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Globe, Clock, Settings as SettingsIcon } from 'lucide-react';
import { StandardNavigation } from '../components/StandardNavigation';
import { useAuth } from '../context/AuthContext';
import { checkTrialStatus } from '../utils/trialUtils';




export function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, profile } = useAuth();

  return (
    <StandardNavigation>
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div className="page-header-content">
              <h1 className="page-header-title">Configurações</h1>
              <p className="page-header-subtitle">Personalize sua experiência</p>
            </div>
          </header>

          <main className="px-4 py-8 lg:px-8" style={{ marginTop: '100px' }}>
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
              <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8" style={{ color: 'var(--text)' }}>Configurações</h1>

              <div className="space-y-4 sm:space-y-6">
                <div className="dashboard-card">
                  <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Aparência</h2>
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
                      className="secondary-button w-full sm:w-auto"
                    >
                      {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </button>
                  </div>
                </div>

                <div className="dashboard-card">
                  <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Notificações</h2>
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

                <div className="dashboard-card">
                  <h2 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Idioma e Região</h2>
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
        </>
      )}
    </StandardNavigation>
  );
}