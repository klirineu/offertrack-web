import React, { useState } from 'react';
import { StandardNavigation } from '../../components/StandardNavigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeStore } from '../../store/themeStore';
import api from '../../services/api';
import { MediaUpload } from '../../components/ui/MediaUpload';


const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const StripMeta: React.FC = () => {
  const { theme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanFileUrl, setCleanFileUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setCleanFileUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/strip-meta', formData, { responseType: 'blob' });
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Erro ao processar o arquivo.');
      }
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setCleanFileUrl(url);
      // Tenta manter a extensão do arquivo original
      const ext = file.name.split('.').pop();
      // Baixar automaticamente
      const a = document.createElement('a');
      a.href = url;
      a.download = `arquivo-limpo.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardNavigation>
      <div className="px-4 py-8 lg:px-0 pt-16 lg:pt-0">
        <header className={`${theme === 'dark' ? 'bg-gray-800 border-b border-gray-700' : 'bg-white shadow-sm'} px-4 py-4 lg:px-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Remover Metadados de Vídeo/Imagem</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <MediaUpload accept="image/*,video/*" onFile={setFile} />
              {!loading && (
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  Remover Metadados
                </button>
              )}
            </form>
            {loading && <Spinner />}
            {error && <div className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            {!loading && cleanFileUrl && file && (
              <div className="mt-6"></div>
            )}
          </div>
        </main>
      </div>
    </StandardNavigation>
  );
};

export default StripMeta; 