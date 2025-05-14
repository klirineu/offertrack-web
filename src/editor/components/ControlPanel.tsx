import { useEditorStore } from '../editorStore';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLocation } from 'react-router-dom';

function getElementByOtId(doc: Document | null, otId: string | null): HTMLElement | null {
  if (!doc || !otId) return null;
  return doc.querySelector(`[data-ot-id="${otId}"]`) as HTMLElement | null;
}

function isStylable(el: HTMLElement | null) {
  if (!el) return false;
  // Não estilizar tags sem visual (ex: script, style, etc)
  const nonStylable = ['SCRIPT', 'STYLE', 'META', 'TITLE', 'LINK'];
  return !nonStylable.includes(el.tagName);
}

function insertScriptInHtml(html: string, script: string, position: 'head' | 'body') {
  if (!script.trim()) return html;
  if (position === 'head') {
    return html.replace(/<\/head>/i, script + '\n</head>');
  } else {
    return html.replace(/<\/body>/i, script + '\n</body>');
  }
}

function isRelevantScript(s: HTMLScriptElement) {
  // Externo
  if (s.src) {
    if (
      s.src.includes('localhost') ||
      s.src.includes('127.0.0.1') ||
      s.src.includes('5173') ||
      s.src.match(/\/(assets|main|static|js|vite|@vite|sockjs-node|__vite_ping|@react-refresh|@vite\/client|local|dev|webpack|node_modules|esbuild|hmr|hot-update)\//)
    ) {
      return false;
    }
    return true;
  }
  // Inline
  if (s.innerHTML) {
    const sysWords = ['vite', 'react', 'hmr', 'webpack', 'editor', 'dnd', 'ot-', 'hot-update'];
    if (sysWords.some(w => s.innerHTML.toLowerCase().includes(w))) return false;
    if (s.innerHTML.trim().length < 10) return false;
    return true;
  }
  return false;
}

const ControlPanel = () => {
  const selectedElement = useEditorStore((s) => s.selectedElement);
  const selectedOtId = useEditorStore((s) => s.selectedOtId);
  const setSelectedElement = useEditorStore((s) => s.setSelectedElement);
  const setSelectedOtId = useEditorStore((s) => s.setSelectedOtId);
  const [text, setText] = useState('');
  const [href, setHref] = useState('');
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [id, setId] = useState('');
  const [className, setClassName] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [color, setColor] = useState('');
  const [radius, setRadius] = useState('');
  const [padding, setPadding] = useState('');
  const [margin, setMargin] = useState('');
  const [textAlign, setTextAlign] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isStylableElement, setIsStylableElement] = useState(true);
  const location = useLocation();
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [fontWeight, setFontWeight] = useState('');
  const [fontStyle, setFontStyle] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [bgColorInput, setBgColorInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptHead, setScriptHead] = useState('');
  const [scriptBody, setScriptBody] = useState('');
  const [showScriptManager, setShowScriptManager] = useState(false);
  const [headScriptsText, setHeadScriptsText] = useState('');
  const [bodyScriptsText, setBodyScriptsText] = useState('');

  // Sincroniza atributos do elemento selecionado
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe || !selectedOtId) return;
    const doc = iframe.contentDocument;
    const el = getElementByOtId(doc, selectedOtId);
    if (!el) return;
    setSelectedTag(el.tagName.toLowerCase());
    setText(el.innerText || '');
    setId(el.id || '');
    setClassName(el.className || '');
    setIsStylableElement(isStylable(el));
    setHref(el.tagName === 'A' ? (el as HTMLAnchorElement).getAttribute('href') || '' : '');
    setSrc((el.tagName === 'IMG' || el.tagName === 'VIDEO') ? (el as HTMLImageElement).getAttribute('src') || '' : '');
    setAlt(el.tagName === 'IMG' ? (el as HTMLImageElement).getAttribute('alt') || '' : '');
    setBgColor(isStylable(el) ? (el.style.backgroundColor || window.getComputedStyle(el).backgroundColor || '') : '');
    setColor(isStylable(el) ? (el.style.color || window.getComputedStyle(el).color || '') : '');
    setBgColorInput(isStylable(el) ? (el.style.backgroundColor || window.getComputedStyle(el).backgroundColor || '') : '');
    setColorInput(isStylable(el) ? (el.style.color || window.getComputedStyle(el).color || '') : '');
    setRadius(isStylable(el) ? (el.style.borderRadius || window.getComputedStyle(el).borderRadius || '') : '');
    setPadding(isStylable(el) ? (el.style.padding || window.getComputedStyle(el).padding || '') : '');
    setMargin(isStylable(el) ? (el.style.margin || window.getComputedStyle(el).margin || '') : '');
    setTextAlign(isStylable(el) ? (el.style.textAlign || window.getComputedStyle(el).textAlign || '') : '');
    setWidth(isStylable(el) ? (el.style.width || window.getComputedStyle(el).width || '') : '');
    setHeight(isStylable(el) ? (el.style.height || window.getComputedStyle(el).height || '') : '');
    setFontSize(isStylable(el) ? (el.style.fontSize || window.getComputedStyle(el).fontSize || '') : '');
    setFontFamily(isStylable(el) ? (el.style.fontFamily || window.getComputedStyle(el).fontFamily || '') : '');
    setFontWeight(isStylable(el) ? (el.style.fontWeight || window.getComputedStyle(el).fontWeight || '') : '');
    setFontStyle(isStylable(el) ? (el.style.fontStyle || window.getComputedStyle(el).fontStyle || '') : '');
  }, [selectedOtId]);

  // Atualiza atributos no elemento do iframe e estado local
  function updateAttr(attr: string, value: string) {
    const iframe = document.querySelector('iframe');
    if (!iframe || !selectedOtId) return;
    const doc = iframe.contentDocument;
    const el = getElementByOtId(doc, selectedOtId);
    if (!el) return;
    switch (attr) {
      case 'text': el.innerText = value; setText(value); break;
      case 'href': if (el.tagName === 'A') (el as HTMLAnchorElement).setAttribute('href', value); setHref(value); break;
      case 'src':
        if (el.tagName === 'IMG') (el as HTMLImageElement).setAttribute('src', value);
        if (el.tagName === 'VIDEO') (el as HTMLVideoElement).setAttribute('src', value);
        setSrc(value);
        break;
      case 'alt': if (el.tagName === 'IMG') (el as HTMLImageElement).setAttribute('alt', value); setAlt(value); break;
      case 'id': el.id = value; setId(value); break;
      case 'class': el.className = value; setClassName(value); break;
      case 'bgColor': if (isStylable(el)) { el.style.backgroundColor = value; setBgColor(value); } break;
      case 'color': if (isStylable(el)) { el.style.color = value; setColor(value); } break;
      case 'radius': if (isStylable(el)) { el.style.borderRadius = value; setRadius(value); } break;
      case 'padding': if (isStylable(el)) { el.style.padding = value; setPadding(value); } break;
      case 'margin': if (isStylable(el)) { el.style.margin = value; setMargin(value); } break;
      case 'textAlign':
        if (isStylable(el)) {
          if (el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'H6' || el.tagName === 'SPAN') {
            el.style.textAlign = value;
          } else if (el.tagName === 'BUTTON' || el.tagName === 'IMG' || el.tagName === 'A' || el.tagName === 'INPUT') {
            // Centralizar: margin auto + display block
            if (value === 'center') {
              el.style.display = 'block';
              el.style.marginLeft = 'auto';
              el.style.marginRight = 'auto';
              el.style.float = '';
            } else if (value === 'left') {
              el.style.display = 'block';
              el.style.marginLeft = '0';
              el.style.marginRight = 'auto';
              el.style.float = '';
            } else if (value === 'right') {
              el.style.display = 'block';
              el.style.marginLeft = 'auto';
              el.style.marginRight = '0';
              el.style.float = '';
            } else {
              el.style.display = '';
              el.style.marginLeft = '';
              el.style.marginRight = '';
              el.style.float = '';
            }
          } else {
            // fallback para float
            if (value === 'left') el.style.float = 'left';
            else if (value === 'right') el.style.float = 'right';
            else el.style.float = '';
          }
          setTextAlign(value);
        }
        break;
      case 'width': if (isStylable(el)) { el.style.width = value; setWidth(value); } break;
      case 'height': if (isStylable(el)) { el.style.height = value; setHeight(value); } break;
      case 'fontSize': if (isStylable(el)) { el.style.fontSize = value; setFontSize(value); } break;
      case 'fontFamily': if (isStylable(el)) { el.style.fontFamily = value; setFontFamily(value); } break;
      case 'fontWeight': if (isStylable(el)) { el.style.fontWeight = value; setFontWeight(value); } break;
      case 'fontStyle': if (isStylable(el)) { el.style.fontStyle = value; setFontStyle(value); } break;
    }
  }

  // Salvar alterações no backend
  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Remove qualquer classe de seleção visual do DOM antes de serializar
    doc.querySelectorAll('.__ot-selected, .ot-preview-selected').forEach(el => el.classList.remove('__ot-selected', 'ot-preview-selected'));

    // Serializa o HTML do iframe
    let html = doc.documentElement.outerHTML;

    // Remove o script de seleção do editor (iframe)
    html = html.replace(/<script[^>]*>[^<]*document\.body\.addEventListener[\s\S]*?<\/script>/g, '');

    // Remove classes do editor via regex
    html = html.replace(/\s(__ot-draggable|__ot-selected)\b/g, '');

    // Remove drag handles e overlays
    html = html.replace(/<div[^>]*class="[^"]*__ot-drag-handle[^"]*"[^>]*>.*?<\/div>/gs, '');
    html = html.replace(/<div[^>]*title="Arrastar para mover"[^>]*>.*?<\/div>/gs, '');
    html = html.replace(/<div[^>]*>↕<\/div>/gs, '');

    // Obter subdomínio
    const params = new URLSearchParams(location.search);
    const subdomain = params.get('id');
    try {
      const res = await api.post('/api/clone/save', { html, subdomain });
      if (res.status === 200) {
        setSaveMsg('Site salvo com sucesso!');
      } else {
        setSaveMsg('Erro ao salvar o site.');
      }
    } catch {
      setSaveMsg('Erro ao salvar o site.');
    }
    setSaving(false);
  }

  function handleRemoveElement() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    let el: HTMLElement | null = null;
    if (selectedOtId) {
      el = doc.querySelector(`[data-ot-id="${selectedOtId}"]`);
    }
    // fallback: tenta pelo .__ot-selected
    if (!el) {
      el = doc.querySelector('.__ot-selected');
    }
    if (el && el !== doc.body) {
      el.remove();
      setSelectedElement(null);
      setSelectedOtId(null);
    }
  }

  function handleAddScript() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    let html = doc.documentElement.outerHTML;
    if (scriptHead.trim()) {
      html = insertScriptInHtml(html, scriptHead, 'head');
    }
    if (scriptBody.trim()) {
      html = insertScriptInHtml(html, scriptBody, 'body');
    }
    // Atualiza o iframe em tempo real
    doc.open();
    doc.write(html);
    doc.close();
    setShowScriptModal(false);
    setScriptHead('');
    setScriptBody('');
    setSaveMsg('Script inserido com sucesso!');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function openScriptManager() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    // Extrai todos os scripts do head (apenas relevantes)
    const headScripts = Array.from(doc.head.querySelectorAll('script'))
      .filter(isRelevantScript)
      .map(s => s.outerHTML)
      .join('\n');
    // Extrai todos os scripts do body (apenas relevantes)
    const bodyScripts = Array.from(doc.body.querySelectorAll('script'))
      .filter(isRelevantScript)
      .map(s => s.outerHTML)
      .join('\n');
    setHeadScriptsText(headScripts);
    setBodyScriptsText(bodyScripts);
    setShowScriptManager(true);
  }

  function handleSaveScripts() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    // Remove todos os scripts do head/body
    Array.from(doc.head.querySelectorAll('script')).forEach(s => s.remove());
    Array.from(doc.body.querySelectorAll('script')).forEach(s => s.remove());
    // Insere scripts do textarea do head
    if (headScriptsText.trim()) {
      const temp = doc.createElement('div');
      temp.innerHTML = headScriptsText;
      Array.from(temp.childNodes).forEach(node => doc.head.appendChild(node));
    }
    // Insere scripts do textarea do body
    if (bodyScriptsText.trim()) {
      const temp = doc.createElement('div');
      temp.innerHTML = bodyScriptsText;
      Array.from(temp.childNodes).forEach(node => doc.body.appendChild(node));
    }
    setShowScriptManager(false);
    setSaveMsg('Scripts atualizados!');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  if (!selectedElement) {
    return (
      <aside className="w-96 bg-gray-900 text-gray-100 p-6 rounded-lg shadow-lg h-full flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pt-4">
        <button
          className="mb-4 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar site'}
        </button>
        <button
          className="mb-4 py-2 px-4 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow"
          onClick={openScriptManager}
        >
          Gerenciar Scripts
        </button>
        {saveMsg && <div className={`mb-4 text-sm ${saveMsg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</div>}
        <div>Selecione um elemento para editar.</div>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-gray-900 text-gray-100 p-6 rounded-lg shadow-lg h-full flex flex-col min-w-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
      <button
        className="mb-4 py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Salvando...' : 'Salvar site'}
      </button>
      <button
        className="mb-4 py-2 px-4 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow"
        onClick={openScriptManager}
      >
        Gerenciar Scripts
      </button>
      {saveMsg && <div className={`mb-4 text-sm ${saveMsg.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</div>}
      <h2 className="font-bold text-xl mb-4 text-blue-400">Painel de Edição</h2>
      <div className="mb-4 text-xs text-gray-400">Selecionado: <span className="font-mono text-blue-300">{selectedElement}</span></div>
      <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
        <label className="block text-sm mb-1 mt-2">Texto:</label>
        <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={text} onChange={e => { setText(e.target.value); updateAttr('text', e.target.value); }} />
        <label className="block text-sm mb-1">ID:</label>
        <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={id} onChange={e => { setId(e.target.value); updateAttr('id', e.target.value); }} />
        <label className="block text-sm mb-1">Classes:</label>
        <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={className} onChange={e => { setClassName(e.target.value); updateAttr('class', e.target.value); }} />
        {selectedElement.startsWith('a') && (
          <>
            <label className="block text-sm mb-1">Link (href):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={href} onChange={e => { setHref(e.target.value); updateAttr('href', e.target.value); }} />
          </>
        )}
        {selectedElement.startsWith('img') && (
          <>
            <label className="block text-sm mb-1">Imagem (src):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={src} onChange={e => { setSrc(e.target.value); updateAttr('src', e.target.value); }} />
            <label className="block text-sm mb-1">Alt:</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={alt} onChange={e => { setAlt(e.target.value); updateAttr('alt', e.target.value); }} />
          </>
        )}
        {selectedElement.startsWith('video') && (
          <>
            <label className="block text-sm mb-1">Vídeo (src):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={src} onChange={e => { setSrc(e.target.value); updateAttr('src', e.target.value); }} />
          </>
        )}
        {isStylableElement && <>
          <label className="block text-sm mb-1">Cor de fundo:</label>
          <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
            <input type="color" className="w-8 h-8 p-0 border border-gray-700 rounded" value={bgColor.startsWith('rgb') || bgColor === 'transparent' ? '#000000' : bgColor}
              onChange={e => {
                setBgColor(e.target.value);
                setBgColorInput(e.target.value);
              }}
              onBlur={e => { updateAttr('bgColor', (e.target as HTMLInputElement).value); }}
              onMouseUp={e => { updateAttr('bgColor', (e.target as HTMLInputElement).value); }}
            />
            <input type="text" className="w-24 border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1" value={bgColorInput}
              onChange={e => {
                setBgColorInput(e.target.value);
                setBgColor(e.target.value);
              }}
              onBlur={e => updateAttr('bgColor', (e.target as HTMLInputElement).value)}
              placeholder="#RRGGBB ou nome"
            />
            <button className="ml-1 px-2 py-1 rounded bg-gray-700 text-xs hover:bg-gray-600" onClick={() => { setBgColor('transparent'); setBgColorInput('transparent'); updateAttr('bgColor', 'transparent'); }}>Transparente</button>
          </div>
          <label className="block text-sm mb-1">Cor do texto:</label>
          <div className="flex flex-wrap items-center gap-2 mb-2 min-w-0">
            <input type="color" className="w-8 h-8 p-0 border border-gray-700 rounded" value={color.startsWith('rgb') || color === 'transparent' ? '#000000' : color}
              onChange={e => {
                setColor(e.target.value);
                setColorInput(e.target.value);
              }}
              onBlur={e => { updateAttr('color', (e.target as HTMLInputElement).value); }}
              onMouseUp={e => { updateAttr('color', (e.target as HTMLInputElement).value); }}
            />
            <input type="text" className="w-24 border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1" value={colorInput}
              onChange={e => {
                setColorInput(e.target.value);
                setColor(e.target.value);
              }}
              onBlur={e => updateAttr('color', (e.target as HTMLInputElement).value)}
              placeholder="#RRGGBB ou nome"
            />
            <button className="ml-1 px-2 py-1 rounded bg-gray-700 text-xs hover:bg-gray-600" onClick={() => { setColor('transparent'); setColorInput('transparent'); updateAttr('color', 'transparent'); }}>Transparente</button>
          </div>
          <label className="block text-sm mb-1">Border Radius:</label>
          <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={radius} onChange={e => { setRadius(e.target.value); updateAttr('radius', e.target.value); }} placeholder="ex: 8px" />
          <label className="block text-sm mb-1">Padding:</label>
          <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={padding} onChange={e => { setPadding(e.target.value); updateAttr('padding', e.target.value); }} placeholder="ex: 16px" />
          <label className="block text-sm mb-1">Margin:</label>
          <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={margin} onChange={e => { setMargin(e.target.value); updateAttr('margin', e.target.value); }} placeholder="ex: 16px 0" />
          <label className="block text-sm mb-1">Alinhamento:</label>
          <select className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={textAlign} onChange={e => { setTextAlign(e.target.value); updateAttr('textAlign', e.target.value); }}>
            <option value="">Padrão</option>
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </>}
        {isStylableElement && <>
          <label className="block text-sm mb-1">Largura (width):</label>
          <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={width} onChange={e => { setWidth(e.target.value); updateAttr('width', e.target.value); }} placeholder="ex: 100% ou 300px" />
          <label className="block text-sm mb-1">Altura (height):</label>
          <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={height} onChange={e => { setHeight(e.target.value); updateAttr('height', e.target.value); }} placeholder="ex: 50px" />
        </>}
        {isStylableElement && ([
          'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'div', 'b', 'strong', 'em', 'i', 'u', 'small', 'label', 'button', 'input', 'textarea'
        ].includes(selectedTag)) && <>
            <label className="block text-sm mb-1">Tamanho da fonte (font-size):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={fontSize} onChange={e => { setFontSize(e.target.value); updateAttr('fontSize', e.target.value); }} placeholder="ex: 16px ou 2rem" />
            <label className="block text-sm mb-1">Fonte (font-family):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={fontFamily} onChange={e => { setFontFamily(e.target.value); updateAttr('fontFamily', e.target.value); }} placeholder="ex: Arial, sans-serif" />
            <label className="block text-sm mb-1">Peso (font-weight):</label>
            <input type="text" className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={fontWeight} onChange={e => { setFontWeight(e.target.value); updateAttr('fontWeight', e.target.value); }} placeholder="ex: 400, 700, bold" />
            <label className="block text-sm mb-1">Estilo (font-style):</label>
            <select className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-2" value={fontStyle} onChange={e => { setFontStyle(e.target.value); updateAttr('fontStyle', e.target.value); }}>
              <option value="">Normal</option>
              <option value="italic">Itálico</option>
              <option value="oblique">Oblíquo</option>
            </select>
          </>}
      </div>
      {selectedElement && (
        <button
          className="mb-4 mt-2 py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-bold shadow disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleRemoveElement}
        >
          Remover elemento
        </button>
      )}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Adicionar Script</h3>
            <label className="block text-sm mb-1">Script para &lt;head&gt;:</label>
            <textarea
              className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4"
              rows={4}
              value={scriptHead}
              onChange={e => setScriptHead(e.target.value)}
              placeholder="&lt;script&gt;...&lt;/script&gt; ou &lt;script src=...&gt;&lt;/script&gt;"
            />
            <label className="block text-sm mb-1">Script para &lt;body&gt;:</label>
            <textarea
              className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4"
              rows={4}
              value={scriptBody}
              onChange={e => setScriptBody(e.target.value)}
              placeholder="&lt;script&gt;...&lt;/script&gt; ou &lt;script src=...&gt;&lt;/script&gt;"
            />
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleAddScript}>Salvar</button>
              <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white font-bold" onClick={() => setShowScriptModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showScriptManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Gerenciar Scripts</h3>
            <div className="mb-4">
              <h4 className="font-bold text-blue-300 mb-2">Scripts no &lt;head&gt;</h4>
              <textarea
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4"
                rows={6}
                value={headScriptsText}
                onChange={e => setHeadScriptsText(e.target.value)}
                placeholder="Cole aqui seus <script>...</script> ou <script src=...></script> para o <head>"
              />
            </div>
            <div className="mb-4">
              <h4 className="font-bold text-blue-300 mb-2">Scripts no &lt;body&gt;</h4>
              <textarea
                className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4"
                rows={6}
                value={bodyScriptsText}
                onChange={e => setBodyScriptsText(e.target.value)}
                placeholder="Cole aqui seus <script>...</script> ou <script src=...></script> para o <body>"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleSaveScripts}>Salvar Scripts</button>
              <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white font-bold" onClick={() => setShowScriptManager(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ControlPanel; 