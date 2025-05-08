import { useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface LivePreviewProps {
  previewMode: 'desktop' | 'mobile';
  content: { html: string; css: string; assets: Record<string, string> };
  onSelectElement?: (selector: string, otId?: string) => void;
  dragType?: string | null;
  style?: React.CSSProperties;
}

const LivePreview = ({ previewMode, content, onSelectElement, dragType, style }: LivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { setNodeRef } = useDroppable({ id: 'preview-drop' });

  // Só atualiza o conteúdo do iframe quando o HTML base muda
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                ${content.css}
                .__ot-selected { outline: 2px solid #2563eb !important; outline-offset: 2px !important; }
                .__ot-drag-handle { position: absolute; top: 2px; left: 2px; z-index: 100; background: #2563eb; color: #fff; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: grab; }
                .__ot-draggable { position: relative; }
                html {
                  scroll-behavior: smooth;
                  overflow-y: scroll;
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
                html::-webkit-scrollbar { display: none; }
              </style>
            </head>
            <body>${content.html}
              <script>
                // Adiciona handles de drag em cada filho do body
                function addDragHandles() {
                  Array.from(document.body.children).forEach(function(el) {
                    if (!el.classList.contains('__ot-draggable')) {
                      el.classList.add('__ot-draggable');
                      var handle = document.createElement('div');
                      handle.className = '__ot-drag-handle';
                      handle.innerHTML = '↕';
                      handle.title = 'Arrastar para mover';
                      handle.onmousedown = function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!el.dataset.otId) el.dataset.otId = Date.now().toString() + Math.random().toString(36).slice(2);
                        window.parent.postMessage({ type: 'ot-drag-internal', otId: el.dataset.otId }, '*');
                      };
                      el.insertBefore(handle, el.firstChild);
                    }
                  });
                }
                addDragHandles();
                // Reaplica handles ao adicionar novos elementos
                var observer = new MutationObserver(addDragHandles);
                observer.observe(document.body, { childList: true });
                document.body.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  let el = e.target;
                  if (!el || el === document.body) return;
                  document.querySelectorAll('.__ot-selected').forEach(x => x.classList.remove('__ot-selected'));
                  el.classList.add('__ot-selected');
                  if (!el.dataset.otId) el.dataset.otId = Date.now().toString() + Math.random().toString(36).slice(2);
                  let selector = el.tagName.toLowerCase();
                  if (el.id) selector += '#' + el.id;
                  if (el.className) selector += '.' + [...el.classList].join('.');
                  window.parent.postMessage({ type: 'element-selected', selector, otId: el.dataset.otId }, '*');
                }, true);
                // Drag-and-drop real para o iframe
                document.body.addEventListener('mouseup', function(e) {
                  try {
                    if (window.parent && window.parent.__otDragType) {
                      var type = window.parent.__otDragType;
                      var html = '';
                      if (type === 'button') html = '<button>Botão</button>';
                      if (type === 'text') html = '<p>Texto de exemplo</p>';
                      if (type === 'image') html = '<img src="https://placehold.co/200x100" alt="Imagem" />';
                      if (type === 'video') html = '<video src="https://www.w3schools.com/html/mov_bbb.mp4" controls width="200"></video>';
                      if (type === 'link') html = '<a href="#">Link</a>';
                      if (type === 'input') html = '<input type="text" placeholder="Digite aqui" />';
                      if (type === 'header') html = '<header style="background:#222;color:#fff;padding:24px;text-align:center;font-size:2rem;">Header Moderno</header>';
                      if (type === 'hero') html = '<section style="padding:48px;text-align:center;background:#f5f5f5;"><h1>Hero Section</h1><p>Chamada de destaque</p></section>';
                      if (type === 'cta') html = '<section style="padding:32px;text-align:center;background:#2563eb;color:#fff;"><h2>Chamada para ação</h2><button style="margin-top:16px;">Quero saber mais</button></section>';
                      if (type === 'contact') html = '<section style="padding:32px;text-align:center;"><h2>Fale conosco</h2><form><input type="text" placeholder="Seu nome" style="margin:8px;"/><input type="email" placeholder="Seu email" style="margin:8px;"/><button>Enviar</button></form></section>';
                      if (type === 'pricing') html = '<section style="padding:32px;text-align:center;background:#f0f0f0;"><h2>Planos</h2><div style="display:flex;justify-content:center;gap:16px;"><div style="background:#fff;padding:16px;">Básico</div><div style="background:#fff;padding:16px;">Pro</div></div></section>';
                      if (html) {
                        var temp = document.createElement('div');
                        temp.innerHTML = html;
                        Array.from(temp.childNodes).forEach(function(node) {
                          document.body.appendChild(node);
                        });
                      }
                      window.parent.__otDragType = null;
                      window.parent.postMessage({ type: 'ot-drag-reset' }, '*');
                    }
                  } catch (err) {}
                }, true);
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, []);

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