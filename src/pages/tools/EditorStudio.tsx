import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import VisualEditor from '../../editor/VisualEditor';
import api from '../../services/api';

declare global {
  interface Window {
    gjsEditor?: unknown;
  }
}

export default function EditorStudio() {
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('id');
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Função para buscar o HTML do backend com cache-busting agressivo
  const fetchHtml = useCallback(async () => {
    if (!cloneId) return;
    setLoading(true);
    try {
      // Cache-busting agressivo para evitar cache da Vercel
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const siteUrl = `https://${cloneId}.clonup.site?_t=${timestamp}&_r=${random}&nocache=1`;
      
      const htmlRes = await api.get(siteUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      setHtml(htmlRes.data);
      
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log('[EditorStudio] HTML carregado:', {
          length: htmlRes.data?.length || 0,
          hasImg: htmlRes.data?.includes('<img') || false,
          timestamp
        });
      }
    } catch (error) {
      setHtml(null);
      console.error('Erro ao carregar o site:', error);
      alert('❌ Site não encontrado ou formato inválido');
    } finally {
      setLoading(false);
    }
  }, [cloneId]);

  // Carrega o HTML só quando o cloneId muda
  useEffect(() => {
    fetchHtml();
  }, [fetchHtml]);

  // Função para ser chamada após salvar no editor
  const handleAfterSave = async () => {
    // Aguarda um pouco para garantir que o backend processou o salvamento
    await new Promise(resolve => setTimeout(resolve, 500));
    // Recarrega com cache-busting agressivo
    await fetchHtml();
  };

  if (!cloneId) return <div className="p-8">Selecione um site para editar.</div>;
  if (loading || html === null) return <div className="p-8">Carregando editor...</div>;

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-1 w-full h-full flex flex-col p-0 m-0">
        <VisualEditor
          clonedData={{ html, css: '', assets: {} }}
          onAfterSave={handleAfterSave}
        />
      </main>
    </div>
  );
}