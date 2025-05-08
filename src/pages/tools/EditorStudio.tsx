import { useEffect, useState } from 'react';
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
  useEffect(() => {
    if (!cloneId) return;

    const loadContent = async () => {
      try {
        // Buscar o HTML principal diretamente
        const htmlRes = await api.get(`/sites/${cloneId}`);
        const html = htmlRes.data;

        setHtml(html);
      } catch (error) {
        console.error('Erro ao carregar o site:', error);
        alert('❌ Site não encontrado ou formato inválido');
      }
    };

    loadContent();
  }, [cloneId]);

  useEffect(() => {
    return () => {
      // Limpeza não necessária: gjsEditor removido
    };
  }, []);

  if (!cloneId) return <div className="p-8">Selecione um site para editar.</div>;
  if (html === null) return <div className="p-8">Carregando editor...</div>;

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-1 w-full h-full flex flex-col p-0 m-0">
        <VisualEditor clonedData={{ html, css: '', assets: {} }} />
      </main>
    </div>
  );
}
