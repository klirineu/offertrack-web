import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface LivePreviewProps {
  previewMode: 'desktop' | 'mobile';
  content: { html: string; css: string; assets: Record<string, string> };
  onSelectElement?: (selector: string, otId?: string) => void;
  dragType?: string | null;
  style?: React.CSSProperties;
  siteId: string;
}

// Função utilitária para extrair <head> e <body> do HTML do usuário
function extractHeadAndBody(html: string) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const userHead = headMatch ? headMatch[1] : '';
  let userBody = bodyMatch ? bodyMatch[1] : html;
  // Se não houver <body>, remove <html> e <head> para evitar duplicidade
  if (!bodyMatch) {
    userBody = userBody.replace(/<head[\s\S]*?<\/head>/i, '').replace(/<html[^>]*>|<\/html>/gi, '');
  }
  return { userHead, userBody };
}

// Função utilitária para tornar caminhos de assets absolutos
function absolutizeAssetPaths(html: string, siteId: string) {
  const base = `https://${siteId}.clonup.site/`;
  // Substitui href/src que começam com css/, js/, img/, assets/, static/
  return html.replace(/(href|src)=(['"])(css|js|img|assets|static)\//g, `$1=$2${base}$3/`);
}

const LivePreview = ({ previewMode, content, onSelectElement, dragType, style, siteId }: LivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { setNodeRef } = useDroppable({ id: 'preview-drop' });
  // Pegue o siteId de algum lugar (exemplo: do content ou de uma prop)
  // Aqui, supondo que venha em content.assets.siteId

  // Ajusta os caminhos antes de extrair head/body
  const htmlComPathsAbsolutos = absolutizeAssetPaths(content.html, siteId!);

  // Só atualiza o conteúdo do iframe quando o HTML base muda
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Usa o HTML com paths absolutos
        const { userHead, userBody } = extractHeadAndBody(htmlComPathsAbsolutos);
        doc.open();
        doc.write(`
          <html>
            <head>
              ${userHead}
              <style>
                ${content.css}
                /* Se quiser highlight de seleção, use apenas outline temporário via CSS */
                .ot-preview-selected { outline: 2px solid #2563eb !important; outline-offset: 2px !important; }
                html {
                  scroll-behavior: smooth;
                  overflow-y: scroll;
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                html::-webkit-scrollbar { display: none; }
              </style>
            </head>
            <body>
              ${userBody}
              <script>
                document.body.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  let el = e.target;
                  if (!el || el === document.body) return;
                  // Gera otId se não existir
                  if (!el.dataset.otId) el.dataset.otId = Date.now().toString() + Math.random().toString(36).slice(2);
                  // Remove highlight anterior
                  document.querySelectorAll('.ot-preview-selected').forEach(x => x.classList.remove('ot-preview-selected'));
                  // Adiciona highlight visual temporário
                  el.classList.add('ot-preview-selected');
                  // Monta seletor simples
                  let selector = el.tagName.toLowerCase();
                  if (el.id) selector += '#' + el.id;
                  if (el.className) selector += '.' + [...el.classList].join('.');
                  window.parent.postMessage({ type: 'element-selected', selector, otId: el.dataset.otId }, '*');
                }, true);
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [content, htmlComPathsAbsolutos]);

  useEffect(() => {
    function handler(event: MessageEvent) {
      if (event.data && event.data.type === 'element-selected' && onSelectElement) {
        onSelectElement(event.data.selector, event.data.otId);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSelectElement]);

  // Overlay visual para drop
  const overlay = dragType ? (
    <div
      className="absolute inset-0 z-20 cursor-pointer"
      style={{ background: 'rgba(37,99,235,0.08)', border: '2px dashed #2563eb' }}
      onMouseUp={() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        let html = '';
        if (dragType === 'button') html = '<button>Botão</button>';
        if (dragType === 'text') html = '<p>Texto de exemplo</p>';
        if (dragType === 'image') html = '<img src="https://placehold.co/200x100" alt="Imagem" />';
        if (dragType === 'video') html = '<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="200"></video>';
        if (dragType === 'link') html = '<a href="#">Link</a>';
        if (dragType === 'input') html = '<input type="text" placeholder="Digite aqui" />';
        if (dragType === 'header') html = '<header style="background:#222;color:#fff;padding:24px;text-align:center;font-size:2rem;">Header Moderno</header>';
        if (dragType === 'hero') html = '<section style="padding:48px;text-align:center;background:#f5f5f5;"><h1>Hero Section</h1><p>Chamada de destaque</p></section>';
        if (dragType === 'cta') html = '<section style="padding:32px;text-align:center;background:#2563eb;color:#fff;"><h2>Chamada para ação</h2><button style="margin-top:16px;">Quero saber mais</button></section>';
        if (dragType === 'contact') html = '<section style="padding:32px;text-align:center;"><h2>Fale conosco</h2><form><input type="text" placeholder="Seu nome" style="margin:8px;"/><input type="email" placeholder="Seu email" style="margin:8px;"/><button>Enviar</button></form></section>';
        if (dragType === 'pricing') html = '<section style="padding:32px;text-align:center;background:#f0f0f0;"><h2>Planos</h2><div style="display:flex;justify-content:center;gap:16px;"><div style="background:#fff;padding:16px;">Básico</div><div style="background:#fff;padding:16px;">Pro</div></div></section>';
        if (html) {
          const temp = doc.createElement('div');
          temp.innerHTML = html;
          Array.from(temp.childNodes).forEach(node => doc.body.appendChild(node));
        }
        window.__otDragType = null;
      }}
    />
  ) : null;

  return (
    <div ref={setNodeRef} className="relative flex-1 h-full flex items-center justify-center min-w-0 bg-gray-900">
      {overlay}
      {previewMode === 'mobile' ? (
        <div style={{ width: 390, height: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 24, boxShadow: '0 0 0 4px #222', background: '#222', margin: '0 auto' }}>
          <iframe
            ref={iframeRef}
            title='preview'
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 20,
              background: '#fff',
              boxShadow: '0 0 0 1px #222',
              transition: 'width 0.2s, height 0.2s',
              display: 'block',
              ...style,
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center min-w-0">
          <iframe
            ref={iframeRef}
            title='preview'
            style={{
              width: '100%',
              height: 900,
              border: '1px solid #222',
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 0 0 1px #222',
              transition: 'width 0.2s, height 0.2s',
              display: 'block',
              ...style,
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
};

export default LivePreview; 