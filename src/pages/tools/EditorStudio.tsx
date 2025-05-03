import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';

declare global {
  interface Window {
    gjsEditor?: unknown;
  }
}

export default function EditorStudio() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const cloneId = searchParams.get('id');
  const [html, setHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  console.log(cloneId)
  useEffect(() => {
    if (!cloneId) return;

    const loadContent = async () => {
      try {
        // Buscar o HTML principal diretamente
        const htmlRes = await fetch(`https://production-web.up.railway.app/sites/${cloneId}`);

        if (!htmlRes.ok) throw new Error('Erro ao carregar o site');
        const rawHtml = await htmlRes.text();

        setHtml(rawHtml);
      } catch (error) {
        console.error('Erro ao carregar o site:', error);
        alert('❌ Site não encontrado ou formato inválido');
      }
    };

    loadContent();
  }, [cloneId]);

  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (html !== null) {
      setEditorKey(prev => prev + 1);
    }
  }, [html]);

  console.log(editorKey)

  const handleSave = async () => {
    setSaving(true);
    const editor = window.gjsEditor as { getHtml: () => string } | undefined;
    if (!editor) return;
    const html = editor.getHtml();
    await fetch(`https://production-web.up.railway.app/save/${cloneId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    });
    setSaving(false);
    alert('✅ Site salvo com sucesso!');
  };

  useEffect(() => {
    return () => {
      if (window.gjsEditor && typeof (window.gjsEditor as any).destroy === 'function') {
        (window.gjsEditor as any).destroy();
      }
      window.gjsEditor = undefined;
    };
  }, []);


  if (!cloneId) return <div className="p-8">Selecione um site para editar.</div>;
  if (html === null) return <div className="p-8">Carregando editor...</div>;

  return (
    <div className="min-h-screen h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="w-full shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-6 z-10">
        <div className="flex-1 flex items-center gap-4">
          <button
            onClick={() => {
              if (window.gjsEditor && typeof (window.gjsEditor as any).destroy === 'function') {
                (window.gjsEditor as any).destroy();
              }
              window.gjsEditor = undefined;
              navigate('/tools/clonesites')
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Voltar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>
      <main className="flex-1 w-full h-full flex flex-col p-0 m-0">
        <div className="flex-1 w-full h-full">
          <StudioEditor
            key={editorKey}
            options={{
              project: {
                type: 'web',
                default: {
                  pages: [
                    { name: 'Home', component: html }
                  ],
                }

              },
              licenseKey: '4922ed05e3f04ad4bcd7dba620015f145d3f9b475d7f4f70bdbf415859c77e10'
            }}
          />

        </div>
      </main>
    </div>
  );
}
