import { useEditorStore } from '../editorStore';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useLocation } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { ContentSelectionModal } from '../../components/modals/ContentSelectionModal';
import { ImageGalleryModal } from '../../components/modals/ImageGalleryModal';
import { EmojiSelectorModal } from '../../components/modals/EmojiSelectorModal';
import { UrlInputModal } from '../../components/modals/UrlInputModal';

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

function isRelevantScript(s: Element) {
  // Exclude editor scripts
  if (s.id === 'editor-script' || s.id === 'editor-styles') {
    return false;
  }

  const terms = [
    // Analytics e Tracking
    'facebook.com/tr',
    '/tr?id=',
    '/pixel',
    '/analytics',
    '/gtag',
    '/utm',
    '/clarity',
    '/fixbug',
    '/hotjar',
    '/google-analytics',
    '/utmify',
    '/connect.facebook.net',
    '/googletagmanager.com',
    '/clarity.ms',

    // Redirecionamentos e Navegação
    'window.location',
    'location.href',
    'location.replace',
    'URLSearchParams',
    'addEventListener',
    'history.pushState',
    'history.replaceState',
    'document.location',
    'window.open',
    'redirect',

    // Outros scripts importantes
    'querySelector',
    'getElementById',
    'localStorage',
    'sessionStorage',
    'fetch(',
    'axios',
    '.ajax',
    'XMLHttpRequest'
  ];

  // Verifica o src do script
  if ((s as HTMLScriptElement).src) {
    return terms.some(term => (s as HTMLScriptElement).src.includes(term));
  }

  // Verifica o conteúdo do script
  if (s.innerHTML) {
    return terms.some(term => s.innerHTML.includes(term));
  }

  return false;
}

interface ControlPanelProps {
  onAfterSave?: () => void | Promise<void>;
}

const ControlPanel = ({ onAfterSave }: ControlPanelProps) => {
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
  const [headScriptsText, setHeadScriptsText] = useState('');
  const [bodyScriptsText, setBodyScriptsText] = useState('');
  const [showScriptManager, setShowScriptManager] = useState(false);
  const [customLink, setCustomLink] = useState('');

  // Estados dos modais de imagem
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);

  // Sincroniza atributos do elemento selecionado
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe || !selectedOtId) return;
    const doc = iframe.contentDocument;
    const el = getElementByOtId(doc, selectedOtId);
    if (!el) return;

    // Verifica se o elemento está dentro de um <a>
    const parentAnchor = el.closest('a');
    if (parentAnchor) {
      setSelectedElement('a');
      setSelectedOtId(parentAnchor.getAttribute('data-ot-id') || selectedOtId);
      setHref(parentAnchor.getAttribute('href') || '');
      setCustomLink(parentAnchor.getAttribute('href') || '');
    } else {
      setSelectedTag(el.tagName.toLowerCase());
      setCustomLink('');
    }

    setText(el.innerText || '');
    setId(el.id || '');
    setClassName(el.className || '');
    setIsStylableElement(isStylable(el));
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

    let anchorElement: HTMLElement | null = null;
    if (attr === 'href') {
      anchorElement = el.tagName === 'A' ? el : el.closest('a');
    }

    switch (attr) {
      case 'text':
        el.innerText = value;
        setText(value);
        break;
      case 'href':
        if (anchorElement) {
          anchorElement.setAttribute('href', value);
          setHref(value);
          setCustomLink(value);
        }
        break;
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

    // Obter subdomínio para converter URLs
    const params = new URLSearchParams(location.search);
    const subdomain = params.get('id');
    const domain = `https://${subdomain}.clonup.com`;

    // Preserva o HTML original
    const originalHtml = doc.documentElement.outerHTML;

    // Função para decodificar entidades HTML
    const decodeHtmlEntities = (html: string) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = html;
      return textarea.value;
    };

    // Decodifica o HTML antes de parsear
    const decodedHtml = decodeHtmlEntities(originalHtml);

    // Cria um parser temporário para manipular o HTML sem afetar a estrutura
    const parser = new DOMParser();
    const tempDoc = parser.parseFromString(decodedHtml, 'text/html');

    // Remove atributos do editor mas mantém os elementos
    tempDoc.querySelectorAll('[data-editor-selected]').forEach(el => {
      el.removeAttribute('data-editor-selected');
    });
    tempDoc.querySelectorAll('[data-ot-id]').forEach(el => {
      el.removeAttribute('data-ot-id');
    });
    tempDoc.querySelectorAll('.__ot-draggable').forEach(el => {
      el.classList.remove('__ot-draggable');
    });
    tempDoc.querySelectorAll('.__ot-selected').forEach(el => {
      el.classList.remove('__ot-selected');
    });
    tempDoc.querySelectorAll('.ot-preview-selected').forEach(el => {
      el.classList.remove('ot-preview-selected');
    });

    // Remove scripts e estilos do editor
    tempDoc.getElementById('editor-script')?.remove();
    tempDoc.getElementById('editor-styles')?.remove();

    // Remove apenas os elementos de drag handle
    tempDoc.querySelectorAll('[title="Arrastar para mover"]').forEach(el => el.remove());
    tempDoc.querySelectorAll('.__ot-drag-handle').forEach(el => el.remove());

    // Preserva os links e seus atributos
    tempDoc.querySelectorAll('a').forEach(a => {
      // Mantém o href atualizado
      const href = a.getAttribute('href');
      if (href) {
        a.setAttribute('href', href);
      }
      // Garante que os estilos sejam mantidos
      if (!a.style.textDecoration) {
        a.style.textDecoration = 'none';
      }
      if (!a.style.color) {
        a.style.color = 'inherit';
      }
    });

    // Converte URLs absolutas de volta para relativas
    const convertUrlsToRelative = (element: Element) => {
      // Converte src e href
      ['src', 'href'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.startsWith(domain)) {
          element.setAttribute(attr, value.replace(domain, ''));
        }
      });

      // Converte background-image em style
      const style = element.getAttribute('style');
      if (style && style.includes(domain)) {
        element.setAttribute('style', style.replace(new RegExp(domain, 'g'), ''));
      }
    };

    // Aplica conversão em todos elementos
    tempDoc.querySelectorAll('*').forEach(convertUrlsToRelative);

    // Preserva DOCTYPE se existir
    const doctype = doc.doctype;
    let html = '';

    if (doctype) {
      const doctypeString = new XMLSerializer().serializeToString(doctype);
      html = doctypeString + '\n';
    }

    // Adiciona o HTML decodificado
    html += tempDoc.documentElement.outerHTML;

    // Remove atributos residuais do editor usando regex que preserva quebras de linha
    html = html.replace(/\s+data-editor-selected="[^"]*"/g, '');
    html = html.replace(/\s+data-ot-id="[^"]*"/g, '');
    html = html.replace(/\s+class="\s*"/g, '');
    html = html.replace(/\s+style="\s*"/g, '');

    // Garante que o HTML não está escapado
    html = decodeHtmlEntities(html);

    // Preserva os links sem estilo padrão
    tempDoc.querySelectorAll('a').forEach(a => {
      if (!a.style.textDecoration) {
        a.style.textDecoration = 'none';
      }
      if (!a.style.color) {
        a.style.color = 'inherit';
      }
    });

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
    if (onAfterSave) await onAfterSave();
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

  function openScriptManager() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Função melhorada para formatar scripts evitando duplicações e scripts dinâmicos
    const formatScripts = (scripts: Element[]) => {
      const processedScripts = new Set<string>();
      const formattedScripts: string[] = [];

      scripts
        .filter(isRelevantScript)
        .forEach(script => {
          const scriptEl = script as HTMLScriptElement;

          // Filtra scripts que foram carregados dinamicamente pelo Facebook ou outros serviços
          const isDynamicScript =
            // Scripts do Facebook carregados dinamicamente
            (scriptEl.src && scriptEl.src.includes('connect.facebook.net/signals/config')) ||
            (scriptEl.src && scriptEl.src.includes('connect.facebook.net/en_US/fbevents.js') && !scriptEl.innerHTML) ||
            // Scripts com atributos que indicam carregamento dinâmico
            scriptEl.hasAttribute('data-fbq-loaded') ||
            scriptEl.hasAttribute('data-gtm-loaded') ||
            // Scripts sem innerHTML que foram carregados por src dinamicamente (exceto se foram adicionados pelo usuário)
            (scriptEl.src && !scriptEl.innerHTML && !scriptEl.hasAttribute('data-editor-managed') && !scriptEl.hasAttribute('data-user-added'));

          // Pula scripts dinâmicos
          if (isDynamicScript) {
            return;
          }

          let identifier: string;

          // Cria identificador único para evitar duplicações
          if (scriptEl.src) {
            // Para scripts externos, usa a URL base como identificador
            const url = new URL(scriptEl.src);
            identifier = `${url.origin}${url.pathname}`;
          } else {
            // Para scripts inline, usa hash do conteúdo
            identifier = btoa(scriptEl.innerHTML.trim()).substring(0, 20);
          }

          // Pula se já foi processado
          if (processedScripts.has(identifier)) {
            console.log('Script duplicado detectado, pulando:', identifier);
            return;
          }

          processedScripts.add(identifier);

          // Limpa e formata o HTML do script
          let scriptHTML = script.outerHTML;

          // Remove atributos desnecessários adicionados dinamicamente
          scriptHTML = scriptHTML
            .replace(/\s+data-editor-(added|managed)="true"/g, '')
            .replace(/\s+data-user-added="true"/g, '')
            .replace(/\s+async=""/g, ' async')
            .replace(/\s+defer=""/g, ' defer')
            .trim();

          // Preserva comentários se existirem
          const parentNode = script.parentNode;
          if (parentNode) {
            const previousNode = script.previousSibling;
            const nextNode = script.nextSibling;

            let fullHTML = scriptHTML;

            // Adiciona comentário anterior se for um comentário relacionado
            if (previousNode && previousNode.nodeType === Node.COMMENT_NODE) {
              const comment = previousNode.textContent?.trim() || '';
              if (comment.toLowerCase().includes('pixel') ||
                comment.toLowerCase().includes('facebook') ||
                comment.toLowerCase().includes('meta') ||
                comment.toLowerCase().includes('analytics')) {
                fullHTML = `<!--${comment}-->\n${scriptHTML}`;
              }
            }

            // Adiciona comentário posterior se for um comentário relacionado
            if (nextNode && nextNode.nodeType === Node.COMMENT_NODE) {
              const comment = nextNode.textContent?.trim() || '';
              if (comment.toLowerCase().includes('end') ||
                comment.toLowerCase().includes('pixel') ||
                comment.toLowerCase().includes('facebook') ||
                comment.toLowerCase().includes('meta')) {
                fullHTML = `${fullHTML}\n<!--${comment}-->`;
              }
            }

            scriptHTML = fullHTML;
          }

          formattedScripts.push(scriptHTML);
        });

      return formattedScripts.join('\n\n');
    };

    // Extrai scripts do head (excluindo scripts do editor)
    const headScripts = Array.from(doc.head.querySelectorAll('script:not([id="editor-script"]):not([id="editor-styles"])'));
    const headNoScripts = Array.from(doc.head.querySelectorAll('noscript:not([data-editor-essential])'));

    // Extrai scripts do body
    const bodyScripts = Array.from(doc.body.querySelectorAll('script'));
    const bodyNoScripts = Array.from(doc.body.querySelectorAll('noscript'));

    // Formata os scripts
    const formattedHeadScripts = formatScripts(headScripts);
    const formattedHeadNoScripts = formatScripts(headNoScripts);
    const formattedBodyScripts = formatScripts(bodyScripts);
    const formattedBodyNoScripts = formatScripts(bodyNoScripts);

    // Combina os scripts com separação adequada
    const headContent = [formattedHeadScripts, formattedHeadNoScripts]
      .filter(content => content.trim())
      .join('\n\n');

    const bodyContent = [formattedBodyScripts, formattedBodyNoScripts]
      .filter(content => content.trim())
      .join('\n\n');

    setHeadScriptsText(headContent);
    setBodyScriptsText(bodyContent);
    setShowScriptManager(true);
  }

  function handleSaveScripts() {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    try {
      // Preserva scripts essenciais do editor antes de remover
      const editorScripts = Array.from(doc.head.querySelectorAll('script[id="editor-script"], script[id="editor-styles"]'));
      const editorNoScripts = Array.from(doc.head.querySelectorAll('noscript[data-editor-essential]'));

      // Remove apenas scripts adicionados pelo usuário (não os do editor nem os dinâmicos)
      Array.from(doc.head.querySelectorAll('script:not([id="editor-script"]):not([id="editor-styles"]), noscript:not([data-editor-essential])')).forEach(s => {
        // Não remove scripts que foram carregados dinamicamente pelo Facebook
        const scriptEl = s as HTMLScriptElement;
        const isDynamicScript =
          (scriptEl.src && scriptEl.src.includes('connect.facebook.net/signals/config')) ||
          (scriptEl.src && scriptEl.src.includes('connect.facebook.net/en_US/fbevents.js') && !scriptEl.innerHTML) ||
          scriptEl.hasAttribute('data-fbq-loaded') ||
          scriptEl.hasAttribute('data-gtm-loaded');

        if (!isDynamicScript) {
          s.remove();
        }
      });

      Array.from(doc.body.querySelectorAll('script, noscript')).forEach(s => s.remove());

      // Função para inserir scripts de forma segura
      const insertScriptsSafely = (container: HTMLElement, scriptsText: string) => {
        if (!scriptsText.trim()) return;

        // Divide por blocos (incluindo comentários)
        const blocks = scriptsText.split(/\n\s*\n/).filter(block => block.trim());

        blocks.forEach(block => {
          try {
            // Verifica se o bloco contém comentários
            const hasComments = block.includes('<!--') && block.includes('-->');

            if (hasComments) {
              // Processa bloco com comentários
              const tempDiv = doc.createElement('div');
              tempDiv.innerHTML = block.trim();

              // Adiciona todos os nós (comentários e elementos)
              Array.from(tempDiv.childNodes).forEach(node => {
                if (node.nodeType === Node.COMMENT_NODE) {
                  // Adiciona comentário
                  container.appendChild(node.cloneNode(true));
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (element.tagName === 'SCRIPT') {
                    const scriptEl = element as HTMLScriptElement;

                    // Verifica duplicação
                    const isDuplicate = scriptEl.src ?
                      container.querySelector(`script[src="${scriptEl.src}"]`) :
                      Array.from(container.querySelectorAll('script:not([src])')).some(s =>
                        s.innerHTML.trim() === scriptEl.innerHTML.trim()
                      );

                    if (isDuplicate) {
                      console.warn('Script duplicado detectado, pulando:', scriptEl.src || 'inline script');
                      return;
                    }

                    // Cria novo elemento script
                    const newScript = doc.createElement('script');

                    // Copia atributos
                    Array.from(scriptEl.attributes).forEach(attr => {
                      newScript.setAttribute(attr.name, attr.value);
                    });

                    // Adiciona conteúdo
                    if (scriptEl.src) {
                      newScript.src = scriptEl.src;
                    } else {
                      newScript.innerHTML = scriptEl.innerHTML;
                    }

                    // Marca como adicionado pelo usuário
                    newScript.setAttribute('data-user-added', 'true');
                    container.appendChild(newScript);
                  } else {
                    // Para outros elementos
                    const clonedElement = element.cloneNode(true) as Element;
                    clonedElement.setAttribute('data-user-added', 'true');
                    container.appendChild(clonedElement);
                  }
                }
              });
            } else {
              // Processa bloco sem comentários (método original)
              const tempDiv = doc.createElement('div');
              tempDiv.innerHTML = block.trim();

              Array.from(tempDiv.children).forEach(element => {
                if (element.tagName === 'SCRIPT') {
                  const scriptEl = element as HTMLScriptElement;

                  // Verifica duplicação por src ou conteúdo
                  const isDuplicate = scriptEl.src ?
                    container.querySelector(`script[src="${scriptEl.src}"]`) :
                    Array.from(container.querySelectorAll('script:not([src])')).some(s =>
                      s.innerHTML.trim() === scriptEl.innerHTML.trim()
                    );

                  if (isDuplicate) {
                    console.warn('Script duplicado detectado, pulando:', scriptEl.src || 'inline script');
                    return;
                  }

                  // Cria novo elemento script
                  const newScript = doc.createElement('script');

                  // Copia atributos
                  Array.from(scriptEl.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                  });

                  // Adiciona conteúdo
                  if (scriptEl.src) {
                    newScript.src = scriptEl.src;
                  } else {
                    newScript.innerHTML = scriptEl.innerHTML;
                  }

                  // Marca como adicionado pelo usuário
                  newScript.setAttribute('data-user-added', 'true');
                  container.appendChild(newScript);
                } else {
                  // Para outros elementos
                  const clonedElement = element.cloneNode(true) as Element;
                  clonedElement.setAttribute('data-user-added', 'true');
                  container.appendChild(clonedElement);
                }
              });
            }
          } catch (blockError) {
            console.error('Erro ao processar bloco de script:', blockError);
          }
        });
      };

      // Insere scripts no head e body
      insertScriptsSafely(doc.head, headScriptsText);
      insertScriptsSafely(doc.body, bodyScriptsText);

      // Restaura scripts essenciais do editor no head se foram removidos
      editorScripts.forEach(script => {
        if (!doc.head.contains(script)) {
          doc.head.appendChild(script);
        }
      });

      editorNoScripts.forEach(noscript => {
        if (!doc.head.contains(noscript)) {
          doc.head.appendChild(noscript);
        }
      });

      setShowScriptManager(false);
      setSaveMsg('Scripts atualizados com sucesso!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar scripts:', error);
      setSaveMsg('Erro ao salvar scripts. Verifique a sintaxe.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  // Função para envolver o elemento selecionado com <a href="...">
  function wrapSelectedWithLink(href: string) {
    const iframe = document.querySelector('iframe');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const el = getElementByOtId(doc, selectedOtId);
    if (!el) return;

    // Se já está dentro de um <a>, só atualiza o href
    const existingAnchor = el.closest('a');
    if (existingAnchor) {
      existingAnchor.setAttribute('href', href);
      existingAnchor.style.textDecoration = 'none';
      existingAnchor.style.color = 'inherit';
      if (!existingAnchor.hasAttribute('data-ot-id')) {
        existingAnchor.setAttribute('data-ot-id', nanoid());
      }
      setSelectedElement('a');
      setSelectedOtId(existingAnchor.getAttribute('data-ot-id') || '');
      setHref(href);
      setCustomLink(href);
      return;
    }

    // Cria o <a> e move o elemento para dentro
    const a = doc.createElement('a');
    const newId = nanoid();
    a.setAttribute('href', href);
    a.setAttribute('data-ot-id', newId);
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    el.parentElement?.replaceChild(a, el);
    a.appendChild(el);

    // Atualiza o estado do link no input
    setCustomLink(href);
    setHref(href);

    // Atualiza o elemento selecionado para o novo <a>
    setSelectedElement('a');
    setSelectedOtId(newId);
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
        {/* Campo para adicionar link customizado em qualquer elemento que não seja <a> */}
        {selectedElement && !selectedElement.startsWith('a') && (
          <div className="mb-2">
            <label className="block text-sm mb-1">Adicionar link (envolver com &lt;a&gt;):</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1"
                placeholder="https://..."
                value={customLink}
                onChange={e => setCustomLink(e.target.value)}
              />
              <button
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
                onClick={() => {
                  if (customLink.trim()) wrapSelectedWithLink(customLink.trim());
                }}
                type="button"
              >Aplicar link</button>
            </div>
          </div>
        )}
        {selectedElement.startsWith('img') && (
          <>
            <label className="block text-sm mb-1">Imagem (src):</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 cursor-not-allowed opacity-75"
                value={src}
                readOnly
                placeholder="Clique no botão ao lado para selecionar"
                title="Use o botão ao lado para selecionar uma imagem"
              />
              <button
                type="button"
                onClick={() => setContentModalOpen(true)}
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold whitespace-nowrap"
                title="Selecionar imagem"
              >
                🖼️
              </button>
            </div>
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
      {showScriptManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4 text-blue-400">Gerenciar Scripts</h3>

            {/* Dicas de uso */}
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-sm text-blue-200">
              <h4 className="font-semibold mb-2">💡 Dicas importantes:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Scripts duplicados são automaticamente detectados e ignorados</li>
                <li>• Use &lt;head&gt; para scripts de tracking (Facebook, Google Analytics)</li>
                <li>• Use &lt;body&gt; para scripts que interagem com elementos da página</li>
                <li>• Scripts do editor são protegidos e não aparecem aqui</li>
                <li>• <strong>Scripts carregados dinamicamente</strong> (como configs do Facebook) são ocultados automaticamente</li>
              </ul>
            </div>

            {/* Aviso sobre scripts dinâmicos */}
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-sm text-green-200">
              <h4 className="font-semibold mb-2">✅ Funcionamento Normal:</h4>
              <p className="text-xs">
                Quando você adiciona o Facebook Pixel, ele pode carregar scripts adicionais automaticamente
                (como <code>signals/config</code> e <code>fbevents.js</code>). Esses scripts dinâmicos são
                <strong> ocultados desta interface</strong> para evitar confusão, mas continuam funcionando normalmente.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                  📄 Scripts no &lt;head&gt;
                  <span className="text-xs text-gray-400">({headScriptsText.split('<script').length - 1} scripts)</span>
                </h4>
                <textarea
                  className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4 font-mono text-xs"
                  rows={10}
                  value={headScriptsText}
                  onChange={e => setHeadScriptsText(e.target.value)}
                  placeholder={`Cole aqui seus scripts para o <head>

Exemplo - Facebook Pixel:
<script>
  !function(f,b,e,v,n,t,s){...}
  fbq('init', 'SEU_PIXEL_ID');
  fbq('track', 'PageView');
</script>`}
                />
              </div>

              <div>
                <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                  📄 Scripts no &lt;body&gt;
                  <span className="text-xs text-gray-400">({bodyScriptsText.split('<script').length - 1} scripts)</span>
                </h4>
                <textarea
                  className="w-full border border-gray-700 bg-gray-800 text-gray-100 rounded px-2 py-1 mb-4 font-mono text-xs"
                  rows={10}
                  value={bodyScriptsText}
                  onChange={e => setBodyScriptsText(e.target.value)}
                  placeholder={`Cole aqui seus scripts para o <body>

Exemplo - Script de interação:
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Seu código aqui
  });
</script>`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-center">
              <button className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleSaveScripts}>
                💾 Salvar Scripts
              </button>
              <button className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-800 text-white font-bold" onClick={() => setShowScriptManager(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Seleção de Imagem */}
      <ContentSelectionModal
        isOpen={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        onSelectImage={() => {
          setContentModalOpen(false);
          setGalleryModalOpen(true);
        }}
        onSelectUrl={() => {
          setContentModalOpen(false);
          setUrlModalOpen(true);
        }}
        onSelectEmoji={() => {
          setContentModalOpen(false);
          setEmojiModalOpen(true);
        }}
      />

      <ImageGalleryModal
        isOpen={galleryModalOpen}
        onClose={() => setGalleryModalOpen(false)}
        onSelectImage={(imageUrl) => {
          setSrc(imageUrl);
          updateAttr('src', imageUrl);
          setGalleryModalOpen(false);
        }}
      />

      <EmojiSelectorModal
        isOpen={emojiModalOpen}
        onClose={() => setEmojiModalOpen(false)}
        onSelectEmoji={(emoji) => {
          // Converter emoji para data URI
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.font = '100px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, 64, 64);
            const dataUrl = canvas.toDataURL();
            setSrc(dataUrl);
            updateAttr('src', dataUrl);
          }
          setEmojiModalOpen(false);
        }}
      />

      <UrlInputModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={(imageUrl) => {
          setSrc(imageUrl);
          updateAttr('src', imageUrl);
          setUrlModalOpen(false);
        }}
      />
    </aside>
  );
};

export default ControlPanel; 