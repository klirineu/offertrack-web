import LivePreview from './components/LivePreview';
import ControlPanel from './components/ControlPanel';
import ComponentLibrary from './components/ComponentLibrary';
import { useEditorStore } from './editorStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EditorProps {
  clonedData: {
    html: string;
    css: string;
    assets: Record<string, string>;
  };
  onAfterSave?: () => void | Promise<void>;
}

declare global {
  interface Window {
    __otDragType?: string | null;
  }
}

const VisualEditor = ({ clonedData, onAfterSave }: EditorProps) => {
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);
  const setSelectedOtId = useEditorStore((s) => s.setSelectedOtId);
  const [dragType] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const navigate = useNavigate();

  // Conteúdo atual do HTML
  const currentHtml = clonedData.html;

  function handleSelectElement(selector: string, otId?: string) {
    setSelectedElement(selector);
    if (otId) setSelectedOtId(otId);
  }

  const params = new URLSearchParams(location.search);
  const siteId = params.get('id') ?? '';

  return (
    <div className="flex h-full">
      <div>
        <aside className="w-64 bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg flex flex-col min-w-0">
          <button
            className="mb-4 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              navigate('/tools/clonesites')
            }}
          >
            Voltar
          </button>
        </aside>
        <div className="relative min-w-0">
          <div className="w-32 min-w-0">
            <ComponentLibrary />
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, backdropFilter: 'blur(4px)', background: 'rgba(30,41,59,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textShadow: '0 2px 8px #000' }}>Em breve</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header com controles de visualização */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950 border-b border-gray-800 relative z-10 min-h-[48px]">
          <div className="flex items-center gap-6 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-2">Visualização:</span>
              <button
                className={`px-3 py-1.5 rounded-l text-sm font-medium transition ${previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setPreviewMode('desktop')}
              >
                Desktop
              </button>
              <button
                className={`px-3 py-1.5 rounded-r text-sm font-medium transition ${previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setPreviewMode('mobile')}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>
        {/* Preview principal */}
        <div className="flex-1 flex justify-center items-center bg-gray-900 min-w-0">
          <div className="w-full h-full flex justify-center items-center min-w-0">
            <LivePreview previewMode={previewMode} content={{ ...clonedData, html: currentHtml }} onSelectElement={(selector: string, otId?: string) => handleSelectElement(selector, otId)} dragType={dragType} style={{ width: '100%', maxWidth: '100%', minWidth: 0 }} siteId={siteId} />
          </div>
        </div>
      </div>
      <ControlPanel onAfterSave={onAfterSave} />
    </div>
  );
};

export default VisualEditor; 