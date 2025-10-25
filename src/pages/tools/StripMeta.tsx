import React, { useState } from 'react';
import { StandardNavigation } from '../../components/StandardNavigation';
import api from '../../services/api';
import { MediaUpload } from '../../components/ui/MediaUpload';
import { Circle } from 'lucide-react';


const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  </div>
);

const StripMeta: React.FC = () => {
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
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <Circle className="w-6 h-6" />
            </div>
            <div className="page-header-content">
              <h1 className="page-header-title">Remover Metadados</h1>
              <p className="page-header-subtitle">Remova metadados de vídeos e imagens</p>
            </div>
          </header>

          <main className="px-4 py-8 lg:px-8" style={{ marginTop: '100px' }}>
            <div className="dashboard-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-field-wrapper">
                  <label className="form-field-label">Arquivo para Processar</label>
                  <MediaUpload accept="image/*,video/*" onFile={setFile} />
                </div>

                {!loading && (
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || !file}
                      className="cta-button"
                    >
                      Remover Metadados
                    </button>
                  </div>
                )}

                {loading && <Spinner />}
                {error && <div className="form-field-error-message">{error}</div>}
                {!loading && cleanFileUrl && file && (
                  <div className="mt-6"></div>
                )}
              </form>
            </div>
          </main>
        </>
      )}
    </StandardNavigation>
  );
};

export default StripMeta; 