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
  // Preserva a estrutura original do HTML
  const htmlMatch = html.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  // Extrai os atributos originais das tags
  const htmlAttrs = (html.match(/<html([^>]*)>/i) || ['', ''])[1];
  const headAttrs = (html.match(/<head([^>]*)>/i) || ['', ''])[1];
  const bodyAttrs = (html.match(/<body([^>]*)>/i) || ['', ''])[1];

  // Se não encontrar as tags, tenta extrair o conteúdo
  const userHtml = htmlMatch ? htmlMatch[1] : html;
  const userHead = headMatch ? headMatch[1] : '';
  let userBody = bodyMatch ? bodyMatch[1] : userHtml;

  // Se não houver body/head, assume todo o conteúdo como body
  if (!bodyMatch && !headMatch) {
    userBody = userHtml.replace(/<html[^>]*>|<\/html>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/i, '');
  }

  return {
    htmlAttrs,
    headAttrs,
    bodyAttrs,
    userHead,
    userBody
  };
}

// Função utilitária para tornar caminhos de assets absolutos
function absolutizeAssetPaths(html: string, siteId: string) {
  const base = `https://${siteId}.clonup.site`;

  // Função auxiliar para normalizar caminhos
  function normalizePath(path: string) {
    // Remove ./ e ../ do início
    path = path.replace(/^\.\.?\//, '');
    // Remove / do início
    path = path.replace(/^\//, '');
    return path;
  }

  // Substitui todos os caminhos relativos por absolutos
  html = html.replace(
    /(href|src)=(['"])((?!https?:\/\/|\/\/|data:|#|mailto:|tel:)[^"']+)(['"])/g,
    (match, attr, quote1, path, quote2) => {
      // Ignora URLs que já são absolutas ou especiais
      if (path.match(/^(https?:\/\/|\/\/|data:|#|mailto:|tel:)/)) {
        return match;
      }

      // Normaliza o caminho
      const normalizedPath = normalizePath(path);

      // Retorna o caminho completo
      return `${attr}=${quote1}${base}/${normalizedPath}${quote2}`;
    }
  );

  return html;
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
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (doc) {
      const { htmlAttrs, headAttrs, bodyAttrs, userHead, userBody } = extractHeadAndBody(htmlComPathsAbsolutos);

      // CSS mínimo para mobile sem afetar cores
      const mobileCss = previewMode === 'mobile' ? `
        @media screen {
          html, body {
            width: 390px !important;
            min-width: 390px !important;
            max-width: 390px !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden !important;
          }
        }
      ` : '';

      // Script mínimo do editor
      const editorScript = `
        document.body.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          let el = e.target;
          if (!el || el === document.body) return;
          if (!el.dataset.otId) el.dataset.otId = Date.now().toString() + Math.random().toString(36).slice(2);
          document.querySelectorAll('[data-editor-selected]').forEach(x => x.removeAttribute('data-editor-selected'));
          el.setAttribute('data-editor-selected', 'true');
          let selector = el.tagName.toLowerCase();
          if (el.id) selector += '#' + el.id;
          if (el.className) selector += '.' + [...el.classList].join('.');
          window.parent.postMessage({ type: 'element-selected', selector, otId: el.dataset.otId }, '*');
        }, true);
      `;

      // Estilos mínimos do editor usando atributos em vez de classes
      const editorStyles = `
        [data-editor-selected] {
          outline: 2px solid #2563eb !important;
          outline-offset: 2px !important;
        }
        ${mobileCss}
      `;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html${htmlAttrs}>
          <head${headAttrs}>
            ${userHead}
            <style id="editor-styles">${editorStyles}</style>
          </head>
          <body${bodyAttrs}>
            ${userBody}
            <script id="editor-script">${editorScript}</script>
          </body>
        </html>
      `);
      doc.close();
    }

    // Cleanup: limpa o iframe ao desmontar
    return () => {
      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write('');
        iframe.contentDocument.close();
      }
    };
  }, [content, htmlComPathsAbsolutos, previewMode]);

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
        <div style={{
          width: 390,
          height: 844,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          boxShadow: '0 0 0 4px #222',
          background: '#222',
          margin: '0 auto',
          overflow: 'hidden',
          padding: 0,
        }}>
          <iframe
            key={previewMode}
            ref={iframeRef}
            title='previewMobile'
            style={{
              width: 390,
              height: 844,
              border: 'none',
              borderRadius: 20,
              background: 'transparent',
              display: 'block',
              overflow: 'auto',
              margin: 0,
              padding: 0,
              ...style,
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center min-w-0">
          <iframe
            key={previewMode}
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