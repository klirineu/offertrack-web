// == Clonup Floating Widget ==
// Só injeta uma vez
if (!window.__clonupWidgetInjected) {
  window.__clonupWidgetInjected = true;

  // Palavras-chave
  const palavrasChave = {
    "Weight Loss": {
      Portuguese: [
        "ritual matinal", "ritual noturno", "bebida caseira", "metabolismo", "acelerar o metabolismo", "manequim 38", "derreter", "secar", "gordura localizada", "banha", "gordurinha", "truque matinal", "queimar gordura", "segredinho", "receitinha", "misturinha", "cabeça de ozempic", "dieta", "coquetel", "eliminar os quilinhos extras", "semente bariátrica", "MONJARO", "MONJARO NATURAL", "Truque da banana", "Truque do limão", "Truque da laranja", "Chá Japonês"
      ],
      English: [
        "morning ritual", "night ritual", "homemade drink", "metabolism", "boost metabolism", "size 6", "melt", "dry", "localized fat", "fat", "morning trick", "burn fat", "little secret", "recipe", "mixture", "ozempic head", "diet", "cocktail", "eliminate extra pounds", "bariatric seed"
      ],
      Spanish: [
        "ritual matutino", "ritual nocturno", "bebida casera", "metabolismo", "acelerar el metabolismo", "talla 38", "derretir", "secar", "grasa localizada", "grasa", "truco matutino", "quemar grasa", "secretito", "receta", "mezcla", "cabeza de ozempic", "adelgazar", "quema grasa", "derretirá", "eliminar los kilitos de más", "semilla bariátrica"
      ]
    },
    "Diabetes": {
      Portuguese: [
        "tipo 2", "glicemia", "metformina", "açúcar no sangue", "glicose", "insulina", "ozempic", "saxenda", "canetinha", "diabetes", "método natural"
      ],
      English: [
        "type 2", "blood sugar", "metformin", "glucose", "insulin", "ozempic", "saxenda", "pen", "diabetes", "natural method", "Lower Blood Sugar"
      ],
      Spanish: [
        "tipo 2", "glucemia", "metformina", "azúcar en sangre", "glucosa", "insulina", "ozempic", "saxenda", "pluma", "diabetes", "método natural", "Bajar azucar", "niveles de azúcar", "reducir mis niveles de azúcar"
      ]
    },
    "Erectile Dysfunction": {
      Portuguese: [
        "pílulas azuis", "viagra", "tadalafil", "ferramenta", "amigão", "machado", "martelo", "duro como uma rocha", "cajado", "azulzinho", "pepino", "mangueira", "banana", "pequenino", "vitamina caseira", "devolver sua firmeza como nunca antes"
      ],
      English: [
        "blue pills", "viagra", "tadalafil", "your tool", "hard as a rock", "cucumber", "homemade vitamin", "restore your firmness like never before", "Nigerian Nut", "Nigerian Tonic", "increase size", "blood flow hack"
      ],
      Spanish: [
        "pastillas azules", "viagra", "tadalafil", "herramienta", "duro como una roca", "pepino", "vitamina casera", "devolver su firmeza como nunca antes", "Palo", "Problemas de erección", "Disfunción eréctil", "tu herramienta", "tromba", "huevo", "verga"
      ]
    },
    "Extra Income": {
      Portuguese: [
        "dinheiro", "bufunfa", "panela", "lucrativo", "app", "mudei de vida", "renda extra", "grana", "dinheiro online", "segunda profissão"
      ],
      English: [
        "cash", "money", "make money", "earning money", "lucrative", "app", "new app", "changed my life", "extra income", "online money", "side hustle"
      ],
      Spanish: [
        "dinero", "hacer dinero", "lucrativo", "aplicación", "cambié mi vida", "ingresos extra", "dinero en línea", "segunda profissão", "dinero fácil", "Ganar dinero", "Trabajar desde casa"
      ]
    },
    "Relationship": {
      Portuguese: [
        "meu ex", "chegar lá", "sentadinha", "superei", "amarração", "frase secreta", "conquistar ele", "trazer de volta", "seu amor", "segredinho", "reconquistar", "veja se ele está te traindo", "traição", "espião", "sedução", "seduzir", "casamento", "correr atrás de você", "Faça ele implorar para voltar com você"
      ],
      English: [
        "my ex", "get there", "overcome", "secret phrase", "conquer him", "bring back", "your love", "little secret", "win back", "see if he is cheating on you", "cheating", "spy", "seduction", "seduce", "marriage", "chase after you", "Make him beg to come back to you"
      ],
      Spanish: [
        "mi ex", "llegar allí", "superé", "frase secreta", "conquistarlo", "traer de vuelta", "tu amor", "secretito", "reconquistar", "ver si te está engañando", "traición", "espía", "seducción", "seducir", "matrimonio", "Volver con ex", "hombre te persiga"
      ]
    },
    "Skin care": {
      Portuguese: [
        "Pra quem já passou dos 45 anos", "Creminho anti-rugas", "Botox", "colágeno", "recuperar a firmeza da pele", "ácido hialurônico", "3 vezes mais colágeno", "pele mais jovem", "celulites", "unhas mais fortes", "colágeno potente"
      ],
      English: [
        "For those over 45", "Anti-wrinkle cream", "Botox", "collagen", "restore skin firmness", "hyaluronic acid", "3 times more collagen", "younger skin", "cellulite", "stronger nails", "potent collagen"
      ],
      Spanish: [
        "Para quienes ya pasaron los 45 años", "Crema antiarrugas", "Botox", "colágeno", "recuperar la firmeza de la piel", "ácido hialurónico", "3 veces más colágeno", "piel más joven", "celulitis", "uñas más fuertes", "colágeno potente"
      ]
    }
  };

  // CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('clonup-widget.css');
  document.head.appendChild(style);

  // Widget root
  const root = document.createElement('div');
  root.id = 'clonup-widget-root';
  document.body.appendChild(root);

  // Helper
  function createEl(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'class') {
        el.className = v;
      } else if (k === 'checked') {
        el.checked = v;
      } else if (k === 'value') {
        el.value = v;
      } else {
        el.setAttribute(k, v);
      }
    });
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    });
    return el;
  }

  // State
  let open = false;
  let categoria = Object.keys(palavrasChave)[0];
  let idioma = Object.keys(palavrasChave[categoria])[0];
  let copied = null;
  let qtdAnuncios = 0;
  let autoLoad = false;
  let autoLoadInterval = null;
  let autoLoadActive = false;
  let foundLinks = [];

  // --- SUPABASE CONFIG ---
  // ATENÇÃO: Para evitar erro de CSP, inclua @supabase/supabase-js no bundle da extensão e use import local!
  // Não use import via CDN em produção de extensão Chrome.
  const SUPABASE_URL = 'https://gakbtbjbywiphvspibbv.supabase.co'; // Troque pelo seu
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0 '; // Troque pelo seu
  let supabase = null;
  let supaSession = null;

  async function initSupabase() {
    if (!supabase) {
      supabase = window.supabase || window.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    if (!supaSession) {
      const sessionStr = localStorage.getItem('clonup_session');
      if (sessionStr) {
        supaSession = JSON.parse(sessionStr);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          supaSession = data.session;
          localStorage.setItem('clonup_session', JSON.stringify(data.session));
        }
      }
    }
  }

  async function loginClonup(email, password) {
    await initSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    supaSession = data.session;
    localStorage.setItem('clonup_session', JSON.stringify(data.session));
    return data.session;
  }

  function isLoggedIn() {
    return !!supaSession;
  }

  // --- UI helpers ---
  function showModal(html, onClose) {
    // Cria um modal simples
    let modal = document.createElement('div');
    modal.className = 'clonup-modal';
    modal.innerHTML = `<div class='clonup-modal-bg'></div><div class='clonup-modal-content'>${html}</div>`;
    document.body.appendChild(modal);
    modal.querySelector('.clonup-modal-bg').onclick = () => {
      modal.remove();
      if (onClose) onClose();
    };
    return modal;
  }

  // --- Importar anúncio ---
  async function importarAnuncioClonup({ title, description, tags, landingPageUrl, offerUrl }) {
    await initSupabase();
    if (!supaSession) throw new Error('Faça login primeiro!');
    const user_id = supaSession.user.id;
    const { data, error } = await supabase.from('offers').insert({
      user_id,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()),
      landing_page_url: landingPageUrl,
      offer_url: offerUrl,
      status: 'waiting',
      metrics: [],
    });
    if (error) throw error;
    return data;
  }

  // --- Clonar site ---
  async function clonarSiteClonup({ original_url }) {
    await initSupabase();
    if (!supaSession) throw new Error('Faça login primeiro!');
    const user_id = supaSession.user.id;
    const { data, error } = await supabase.from('anticlone_sites').insert({
      user_id,
      original_url,
      original_host: (new URL(original_url)).hostname,
      action_type: 'redirect',
      action_data: '',
    });
    if (error) throw error;
    return data;
  }

  // --- Baixar criativos ---
  function baixarCriativos() {
    const imgs = Array.from(document.querySelectorAll('img')).map(img => img.src);
    const videos = Array.from(document.querySelectorAll('video source')).map(v => v.src);
    const urls = [...imgs, ...videos];
    urls.forEach(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    showToast(`Baixados ${urls.length} criativos!`);
  }

  // --- UI principal extra ---
  // Removido: renderClonupExtra e setInterval(renderClonupExtra, 1000);

  // --- Modal de login ---
  function showLoginModal(onSuccess) {
    let html = `
      <h3 style='margin-bottom:12px'>Login Clonup</h3>
      <input id='clonup-login-email' type='email' placeholder='Email' style='width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <input id='clonup-login-pass' type='password' placeholder='Senha' style='width:100%;margin-bottom:12px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <button id='clonup-login-btn' style='width:100%;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:bold;'>Entrar</button>
      <div id='clonup-login-err' style='color:#e11d48;margin-top:8px;'></div>
    `;
    const modal = showModal(html);
    modal.querySelector('#clonup-login-btn').onclick = async () => {
      const email = modal.querySelector('#clonup-login-email').value;
      const pass = modal.querySelector('#clonup-login-pass').value;
      modal.querySelector('#clonup-login-btn').disabled = true;
      modal.querySelector('#clonup-login-err').textContent = '';
      try {
        await loginClonup(email, pass);
        modal.remove();
        showToast('Login realizado!');
        if (onSuccess) onSuccess();
      } catch (e) {
        modal.querySelector('#clonup-login-err').textContent = e.message || 'Erro ao logar';
        modal.querySelector('#clonup-login-btn').disabled = false;
      }
    };
  }

  // --- Modal de exportação para o Clonup ---
  function showExportModal() {
    const urlAtual = window.location.href;
    let html = `
      <h3 style='margin-bottom:12px'>Exportar para o Clonup</h3>
      <input id='clonup-export-title' type='text' placeholder='Nome do anúncio' style='width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <input id='clonup-export-desc' type='text' placeholder='Descrição' style='width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <input id='clonup-export-tags' type='text' placeholder='Tags (separadas por vírgula)' style='width:100%;margin-bottom:8px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <input id='clonup-export-url' type='text' value='${urlAtual}' placeholder='URL do site' style='width:100%;margin-bottom:12px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <button id='clonup-export-btn' style='width:100%;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:bold;'>Exportar</button>
      <div id='clonup-export-err' style='color:#e11d48;margin-top:8px;'></div>
    `;
    const modal = showModal(html);
    modal.querySelector('#clonup-export-btn').onclick = async () => {
      const title = modal.querySelector('#clonup-export-title').value;
      const description = modal.querySelector('#clonup-export-desc').value;
      const tags = modal.querySelector('#clonup-export-tags').value;
      const landingPageUrl = modal.querySelector('#clonup-export-url').value;
      modal.querySelector('#clonup-export-btn').disabled = true;
      modal.querySelector('#clonup-export-err').textContent = '';
      try {
        await importarAnuncioClonup({ title, description, tags, landingPageUrl, offerUrl: urlAtual });
        modal.remove();
        window.location.href = 'https://clonup.pro/dashboard';
      } catch (e) {
        modal.querySelector('#clonup-export-err').textContent = e.message || 'Erro ao exportar';
        modal.querySelector('#clonup-export-btn').disabled = false;
      }
    };
  }

  // --- Modal de baixar criativos ---
  function showDownloadCreativesModal() {
    let html = `
      <h3 style='margin-bottom:12px'>Baixar criativos</h3>
      <div style='margin-bottom:12px;'>Será baixado da URL atual:<br><b>${window.location.href}</b></div>
      <button id='clonup-creatives-btn' style='width:100%;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:bold;'>Baixar</button>
      <div id='clonup-creatives-err' style='color:#e11d48;margin-top:8px;'></div>
    `;
    const modal = showModal(html);
    modal.querySelector('#clonup-creatives-btn').onclick = async () => {
      const url = window.location.href;
      modal.querySelector('#clonup-creatives-btn').disabled = true;
      modal.querySelector('#clonup-creatives-err').textContent = '';
      try {
        // Integração real: ajuste a URL abaixo para sua API
        const resp = await fetch('/api/creatives/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!resp.ok) throw new Error('Erro ao baixar criativos');
        modal.remove();
        showToast('Download iniciado!');
      } catch (e) {
        modal.querySelector('#clonup-creatives-err').textContent = e.message || 'Erro ao baixar';
        modal.querySelector('#clonup-creatives-btn').disabled = false;
      }
    };
  }

  // --- Modal de clonar site ---
  function showCloneModal() {
    const urlAtual = window.location.href;
    let html = `
      <h3 style='margin-bottom:12px'>Clonar site</h3>
      <input id='clonup-clone-url' type='text' value='${urlAtual}' placeholder='URL do site' style='width:100%;margin-bottom:12px;padding:8px;border-radius:6px;border:1px solid #ccc;'>
      <button id='clonup-clone-btn' style='width:100%;padding:8px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:bold;'>Clonar</button>
      <div id='clonup-clone-err' style='color:#e11d48;margin-top:8px;'></div>
    `;
    const modal = showModal(html);
    modal.querySelector('#clonup-clone-btn').onclick = async () => {
      const url = modal.querySelector('#clonup-clone-url').value;
      modal.querySelector('#clonup-clone-btn').disabled = true;
      modal.querySelector('#clonup-clone-err').textContent = '';
      try {
        // Redireciona para a ferramenta de clonar site do Clonup
        window.location.href = `https://clonup.pro/tools/clonesites?url=${encodeURIComponent(url)}`;
      } catch (e) {
        modal.querySelector('#clonup-clone-err').textContent = e.message || 'Erro ao redirecionar';
        modal.querySelector('#clonup-clone-btn').disabled = false;
      }
    };
  }

  // Helper para pegar todos os cards
  function getCards() {
    const container = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
    if (!container) return [];
    return Array.from(container.querySelectorAll('.xh8yej3')).filter(card => card.querySelector('strong'));
  }

  // Destaca badge de quantidade em todos os cards
  function destacarQtdAnuncios() {
    getCards().forEach(card => {
      const strong = Array.from(card.querySelectorAll('strong')).find(s => /\d+\s+anúncios?/.test(s.textContent));
      if (strong) {
        strong.style.background = '#2563eb';
        strong.style.color = '#fff';
        strong.style.padding = '2px 10px';
        strong.style.marginLeft = '8px';
        strong.style.marginRight = '8px';
        strong.style.borderRadius = '12px';
        strong.style.fontWeight = 'bold';
        strong.style.fontSize = '1.1em';
        strong.style.boxShadow = '0 1px 4px #0002';
        strong.style.display = 'inline-block';
      }
    });
  }

  // Reorganiza os cards de acordo com a quantidade de anúncios
  function reorganizarCardsPorQuantidade() {
    const container = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
    if (!container) return;
    const cards = getCards();
    // Extrai quantidade de cada card
    const cardsComQtd = cards.map(card => {
      const strong = Array.from(card.querySelectorAll('strong')).find(s => /\d+\s+anúncios?/.test(s.textContent));
      const match = strong ? strong.textContent.match(/(\d+)/) : null;
      const qtd = match ? parseInt(match[1], 10) : 0;
      return { card, qtd };
    });
    // Ordena: primeiro os com qtd <= limite, do maior para o menor, depois os acima do limite
    const top = cardsComQtd.filter(c => c.qtd <= qtdAnuncios).sort((a, b) => b.qtd - a.qtd);
    const bottom = cardsComQtd.filter(c => c.qtd > qtdAnuncios).sort((a, b) => b.qtd - a.qtd);
    [...top, ...bottom].forEach(({ card }) => {
      card.style.display = 'block';
      container.appendChild(card);
    });
  }

  // Função para rolar e carregar anúncios na biblioteca do Facebook
  function tryAutoLoadFacebook() {
    if (!autoLoad) {
      autoLoadActive = false;
      render();
      return;
    }
    if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;
    autoLoadActive = true;
    render();
    window.scrollTo(0, document.body.scrollHeight);
    setTimeout(() => {
      destacarQtdAnuncios();
      filtrarCardsPorQuantidade();
      addVerAnunciosButtons();

      autoLoadInterval = setTimeout(tryAutoLoadFacebook, 1500);
    }, 1200);
  }

  // Função para filtrar, destacar e mostrar apenas os cards com quantidade >= qtdAnuncios (ou 1 se for 1)
  function filtrarCardsPorQuantidade() {
    if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;
    const container = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
    if (!container) return;
    // Remove mensagem anterior
    const oldMsg = container.querySelector('.clonup-no-cards-msg');
    if (oldMsg) oldMsg.remove();
    const cards = Array.from(container.querySelectorAll(':scope > .xh8yej3'));
    const minQtd = qtdAnuncios > 1 ? qtdAnuncios : 1;
    let count = 0;
    // Armazena cards que atendem e não atendem ao filtro
    const cardsFiltrados = [];
    const cardsRestantes = [];
    cards.forEach(card => {
      const strong = Array.from(card.querySelectorAll('strong')).find(s => /\d+\s+anúncios?/.test(s.textContent));
      if (!strong) {
        card.style.opacity = 0.5;
        cardsRestantes.push({ card, qtd: 0 });
        return;
      }
      const match = strong.textContent.match(/(\d+)/);
      const qtd = match ? parseInt(match[1], 10) : 0;
      if (qtd >= minQtd) {
        card.style.opacity = 1;
        cardsFiltrados.push({ card, qtd });
        count++;
      } else {
        card.style.opacity = 0.5;
        cardsRestantes.push({ card, qtd });
      }
    });
    // Ordena os cards visíveis do maior para o menor
    cardsFiltrados.sort((a, b) => b.qtd - a.qtd);
    cardsRestantes.sort((a, b) => b.qtd - a.qtd);
    // Reanexa todos os cards: primeiro os que atendem, depois os restantes
    [...cardsFiltrados, ...cardsRestantes].forEach(({ card }) => container.appendChild(card));
    // Se nenhum card atende ao filtro, mostra mensagem
    if (cardsFiltrados.length === 0) {
      const msg = document.createElement('div');
      msg.className = 'clonup-no-cards-msg';
      msg.style.cssText = 'background:#fef3c7;color:#92400e;padding:10px 16px;border-radius:8px;margin-bottom:12px;font-weight:500;text-align:center;';
      msg.textContent = `Nenhum card com ${minQtd} anúncios encontrado.`;
      container.insertBefore(msg, container.firstChild);
    }
    showToast(`Exibindo ${cardsFiltrados.length} cards com ${minQtd} anúncios ou mais.`);
  }

  // Clique na palavra: insere entre aspas duplas, dá Enter e feedback
  function handlePalavraClick(palavra) {
    const valor = `"${palavra}"`;
    navigator.clipboard.writeText(valor);
    copied = palavra;
    render();
    setTimeout(() => { copied = null; render(); }, 1200);
    // Tenta inserir no input de busca
    const input = document.querySelector('input[type="search"], input[placeholder*="pesquisar" i], input[placeholder*="search" i]');
    if (input) {
      input.value = valor;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // Simula o Enter corretamente
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true, cancelable: true });
      input.dispatchEvent(enterEvent);
      // Tenta submeter o form se existir
      if (input.form) {
        input.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
      setTimeout(() => {
        input.blur();
        input.focus();
      }, 100);
    }
  }

  // Toast
  function showToast(msg) {
    let toast = document.getElementById('clonup-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clonup-toast';
      toast.className = 'clonup-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
  }

  function addVerAnunciosButtons() {
    // Só roda na biblioteca do Facebook Ads
    if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;

    // 1. Pega todos os scripts JSON do body e mapeia page_profile_uri => page_id
    const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
    const profileUriToId = {};
    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        function findProfile(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.page_profile_uri && obj.page_id) {
            // Normaliza para remover barra final e salvar com/sem www
            let uri = obj.page_profile_uri.replace(/\/$/, '');
            profileUriToId[uri] = obj.page_id;
            if (uri.includes('www.facebook.com/')) {
              profileUriToId[uri.replace('www.facebook.com/', 'facebook.com/')] = obj.page_id;
            } else if (uri.includes('facebook.com/')) {
              profileUriToId[uri.replace('facebook.com/', 'www.facebook.com/')] = obj.page_id;
            }
          }
          Object.values(obj).forEach(findProfile);
        }
        findProfile(data);
      } catch (e) { }
    });

    // Para cada card
    document.querySelectorAll('.xh8yej3').forEach(card => {
      // Já existe o botão? Não duplica
      if (card.querySelector('.clonup-ver-anuncios-btn')) return;
      // Busca o link da página
      const pageLink = card.querySelector('a[href*="facebook.com/"]');
      if (!pageLink) return;
      // Normaliza o link para buscar no mapa
      const normalizedLink = pageLink.href.replace(/\/$/, '');
      let pageId = profileUriToId[normalizedLink];
      let tried = [normalizedLink];
      // Tenta também sem www ou com www
      if (!pageId && normalizedLink.includes('www.facebook.com/')) {
        const altLink = normalizedLink.replace('www.facebook.com/', 'facebook.com/');
        pageId = profileUriToId[altLink];
        tried.push(altLink);
      }
      if (!pageId && normalizedLink.includes('facebook.com/')) {
        const altLink = normalizedLink.replace('facebook.com/', 'www.facebook.com/');
        pageId = profileUriToId[altLink];
        tried.push(altLink);
      }
      let idSource = 'script';
      if (!pageId) {
        // Tenta pegar do texto "Identificação da biblioteca: NNNNNNNNNNNNNNN"
        const spanId = Array.from(card.querySelectorAll('span')).find(
          s => /Identificação da biblioteca: (\d{10,})/.test(s.textContent)
        );
        if (spanId) {
          const match = spanId.textContent.match(/Identificação da biblioteca: (\d{10,})/);
          if (match) {
            pageId = match[1];
            idSource = 'span';
          }
        }
      }
      console.log('Card link:', pageLink.href, '| Tentativas:', tried, '| page_id encontrado:', pageId, '| Fonte:', idSource);
      if (!pageId) return;
      // Procura o bloco do botão "Ver detalhes do anúncio" ou "Ver resumo" de forma flexível
      let detalhesBtnBlock = Array.from(card.querySelectorAll('div[role="none"]')).find(div => {
        const classes = div.className.split(' ');
        return ["x193iq5w", "xxymvpz", "xeuugli", "x78zum5", "x1iyjqo2", "xs83m0k"].every(c => classes.includes(c));
      });
      if (!detalhesBtnBlock) {
        // Procura por texto "Ver detalhes do anúncio" ou "Ver resumo"
        detalhesBtnBlock = Array.from(card.querySelectorAll('div')).find(div => {
          return /Ver detalhes do anúncio|Ver resumo|Watch More/i.test(div.textContent);
        });
      }
      if (!detalhesBtnBlock) return;
      // Cria o botão
      let verAnunciosUrl;
      if (idSource === 'span') {
        verAnunciosUrl = `https://www.facebook.com/ads/library/?id=${pageId}`;
      } else {
        verAnunciosUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=${pageId}`;
      }
      const verAnunciosBtn = document.createElement('a');
      verAnunciosBtn.textContent = 'Ver anúncios';
      verAnunciosBtn.href = verAnunciosUrl;
      verAnunciosBtn.target = '_blank';
      verAnunciosBtn.className = 'clonup-ver-anuncios-btn';
      verAnunciosBtn.style.cssText = 'display:block;background:#2563eb;color:#fff;padding:12px 0;border-radius:8px;margin:0px auto;margin-top:10px;font-weight:600;text-align:center;text-decoration:none;width:92%;font-size:1.1em;';
      // Adiciona logo abaixo do bloco de detalhes
      detalhesBtnBlock.parentNode.insertBefore(verAnunciosBtn, detalhesBtnBlock.nextSibling);
      // Busca o link da página de vendas
      const vendaLinkA = Array.from(card.querySelectorAll('a')).find(a => a.href.includes('l.facebook.com/l.php?u='));
      if (vendaLinkA) {
        const vendaLink = vendaLinkA.href;
        // Cria container para os dois botões
        const vendasBtns = document.createElement('div');
        vendasBtns.style.cssText = 'display:flex;margin:0px auto;gap:8px;margin-top:8px;justify-content:center;width:92%;';
        // Botão abrir
        const btnAbrir = document.createElement('a');
        btnAbrir.textContent = 'Abrir link PV';
        btnAbrir.href = vendaLink;
        btnAbrir.target = '_blank';
        btnAbrir.style.cssText = 'flex:1 1 0;width:46%;background:#10b981;color:#fff;padding:10px 0;border-radius:8px;font-weight:600;text-align:center;text-decoration:none;font-size:1em;';
        // Botão copiar
        const btnCopiar = document.createElement('button');
        btnCopiar.textContent = 'Copiar link PV';
        btnCopiar.style.cssText = 'flex:1 1 0;width:46%;background:#2563eb;color:#fff;padding:10px 0;border-radius:8px;font-weight:600;text-align:center;font-size:1em;border:none;cursor:pointer;';
        btnCopiar.onclick = () => {
          navigator.clipboard.writeText(vendaLink);
          showToast('Link copiado!');
        };
        vendasBtns.appendChild(btnAbrir);
        vendasBtns.appendChild(btnCopiar);
        // Adiciona logo abaixo do botão de ver anúncios
        verAnunciosBtn.parentNode.insertBefore(vendasBtns, verAnunciosBtn.nextSibling);
      }
    });
  }

  // Render
  function render() {
    // Remover o layout extra de view_all_page_id
    // if (window.location.href.includes('view_all_page_id=')) {
    //   renderClonupExtra();
    //   return;
    // }
    root.innerHTML = '';
    // Botão flutuante
    root.appendChild(createEl('button', {
      class: 'clonup-float-btn',
      onclick: () => { open = !open; render(); },
      title: 'Abrir Clonup'
    },
      autoLoadActive ? '⏳' : '🔎'
    ));

    // Destaca quantidade de anúncios sempre
    setTimeout(destacarQtdAnuncios, 100);
    setTimeout(addVerAnunciosButtons, 100);

    // Popup
    if (open) {
      const isFacebookLibrary = /facebook\.com\/ads\/library/.test(window.location.href);
      const popupChildren = [
        createEl('div', { class: 'clonup-popup-header' },
          createEl('span', { class: 'clonup-popup-title' }, 'Clonup'),
          createEl('button', {
            class: 'clonup-popup-close',
            onclick: () => { open = false; render(); }
          }, '×')
        )
      ];

      if (isFacebookLibrary) {
        // Facebook Ads Library: mostrar filtros, auto-load, exportar
        popupChildren.push(
          createEl('div', { class: 'clonup-popup-options' },
            createEl('label', { class: 'clonup-label' }, 'Qtd. anúncios:'),
            createEl('input', {
              type: 'number',
              min: 1,
              max: 100,
              value: qtdAnuncios,
              class: 'clonup-input',
              onchange: e => { qtdAnuncios = Number(e.target.value); render(); }
            }),
            createEl('button', {
              class: 'clonup-tab',
              onclick: filtrarCardsPorQuantidade
            }, 'Filtrar por quantidade'),
            createEl('label', { class: 'clonup-label-switch' },
              (() => {
                const label = document.createElement('label');
                label.className = 'clonup-switch';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = autoLoad;
                input.onchange = e => {
                  autoLoad = e.target.checked;
                  render();
                  if (autoLoad) {
                    tryAutoLoadFacebook();
                  } else if (autoLoadInterval) {
                    destacarQtdAnuncios();
                    addVerAnunciosButtons();

                    filtrarCardsPorQuantidade();
                    clearTimeout(autoLoadInterval);
                    autoLoadActive = false;
                    render();
                  }
                };
                const slider = document.createElement('span');
                slider.className = 'clonup-slider';
                label.appendChild(input);
                label.appendChild(slider);
                return label;
              })(),
              autoLoadActive ? 'Carregando...' : 'Load automático'
            )
          ),
          // createEl('div', { class: 'clonup-popup-actions', style: 'display:flex;gap:10px;margin:16px 0 8px 0;flex-wrap:wrap;' },
          //   createEl('button', {
          //     class: 'clonup-btn-importar',
          //     onclick: () => {
          //       if (!isLoggedIn()) {
          //         showLoginModal(() => render());
          //         return;
          //       }
          //       showExportModal();
          //     }
          //   }, 'Exportar para o Clonup')
          // )
        );
        // Tabs categoria e idioma e lista de palavras SEMPRE aparecem
        popupChildren.push(
          createEl('div', { class: 'clonup-popup-tabs' },
            ...Object.keys(palavrasChave).map(cat =>
              createEl('button', {
                class: 'clonup-tab' + (cat === categoria ? ' clonup-tab-active' : ''),
                onclick: () => { categoria = cat; idioma = Object.keys(palavrasChave[cat])[0]; render(); }
              }, cat)
            )
          ),
          createEl('div', { class: 'clonup-popup-tabs' },
            ...Object.keys(palavrasChave[categoria]).map(lang =>
              createEl('button', {
                class: 'clonup-tab' + (lang === idioma ? ' clonup-tab-active' : ''),
                onclick: () => { idioma = lang; render(); }
              }, lang)
            )
          ),
          createEl('ul', { class: 'clonup-list' },
            ...palavrasChave[categoria][idioma].map(palavra =>
              createEl('li', {},
                createEl('button', {
                  class: 'clonup-list-btn' + (copied === palavra ? ' clonup-list-btn-copied' : ''),
                  style: 'font-size:1.1em;padding:10px 12px;margin-bottom:6px;border:1px solid #e5e7eb;background:#f9fafb;',
                  onclick: () => handlePalavraClick(palavra)
                }, palavra, copied === palavra ? ' ✔️' : '')
              )
            )
          )
        );
      } else {
        // Fora do Facebook Ads Library: mostrar só extrair links e lista de links extraídos
        const actionsBlock = createEl('div', { class: 'clonup-popup-actions', style: 'display:flex;flex-direction:column;gap:10px;margin:16px 0 8px 0;flex-wrap:wrap;' },
          createEl('button', {
            class: 'clonup-btn-links',
            onclick: () => {
              // Revela elementos antes de buscar links
              let reveladosCount = 0;
              const elementosPotencialmenteEscondidos = document.querySelectorAll('*');
              elementosPotencialmenteEscondidos.forEach(el => {
                const style = window.getComputedStyle(el);
                let mudou = false;
                if (style.display === 'none') {
                  el.style.setProperty('display', 'block', 'important');
                  mudou = true;
                }
                if (style.visibility === 'hidden') {
                  el.style.setProperty('visibility', 'visible', 'important');
                  mudou = true;
                }
                if (style.opacity === '0') {
                  el.style.setProperty('opacity', '1', 'important');
                  mudou = true;
                }
                const commonHideClasses = ['hidden', 'hide', 'd-none', 'invisible', 'sr-only', 'elementor-hidden'];
                commonHideClasses.forEach(className => {
                  if (el.classList.contains(className)) {
                    el.classList.remove(className);
                    el.style.setProperty('display', el.style.display || 'block', 'important');
                    el.style.setProperty('visibility', el.style.visibility || 'visible', 'important');
                    mudou = true;
                  }
                });
                if (mudou) reveladosCount++;
              });
              // Buscar links
              const links = [];
              document.querySelectorAll('a,form').forEach(el => {
                let url = '';
                if (el.tagName === 'A') url = el.href;
                if (el.tagName === 'FORM') url = el.action;
                if (url) {
                  links.push(url);
                }
              });
              foundLinks = links;
              render();
              setTimeout(() => {
                if (links.length > 0) {
                  showToast(`${links.length} links encontrados!`);
                } else {
                  showToast('Nenhum link encontrado.');
                }
              }, 100);
            }
          }, 'Extrair links da página')
        );
        // Exibir links encontrados em lista igual à de palavras-chave, logo abaixo do botão
        console.log(foundLinks)
        if (foundLinks && foundLinks.length > 0) {
          actionsBlock.appendChild(
            createEl('ul', { class: 'clonup-list', style: 'margin: 10px 0 0 0; padding: 0; background: #f3f4f6; border-radius: 8px;' },
              ...foundLinks.map(url =>
                createEl('li', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:6px;' },
                  createEl('button', {
                    style: 'font-size:1em;padding:6px 10px;border:1px solid #e5e7eb;background:#2563eb;color:#fff;border-radius:6px;cursor:pointer;margin-top:5px;margin-left:5px;',
                    onclick: () => { navigator.clipboard.writeText(url); showToast('Link copiado!'); }
                  }, 'Copiar'),
                  createEl('span', { style: 'word-break:break-all;font-size:1em;' }, url)
                )
              )
            )
          );
        }
        popupChildren.push(actionsBlock);
      }

      const popup = createEl('div', { class: 'clonup-popup' }, ...popupChildren);
      root.appendChild(popup);
    }

    // Adiciona botões "Ver anúncios" nos cards se for Facebook Ads Library
  }

  // Destaca quantidade ao abrir o site
  setTimeout(addVerAnunciosButtons, 100);
  setTimeout(destacarQtdAnuncios, 100);
  render();

  // --- OBSERVADOR DE CARDS ---
  // Observa o container de cards e aplica botões/destaques automaticamente
  function setupCardsObserver() {
    const cardsContainer = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
    if (cardsContainer && !cardsContainer.__clonupObserved) {
      cardsContainer.__clonupObserved = true;
      const observer = new MutationObserver(() => {
        destacarQtdAnuncios();
        addVerAnunciosButtons();
      });
      observer.observe(cardsContainer, { childList: true, subtree: true });
    }
  }
  // Roda ao carregar
  setupCardsObserver();
  // E sempre que renderizar
  setInterval(setupCardsObserver, 2000);

  // Adicionar controle de exibição do widget via mensagem da extensão
  let widgetVisible = false;

  function showWidget() {
    if (!widgetVisible) {
      root.style.display = 'block';
      widgetVisible = true;
    }
  }

  function hideWidget() {
    if (widgetVisible) {
      root.style.display = 'none';
      widgetVisible = false;
    }
  }

  // Inicialmente, o widget fica oculto
  root.style.display = 'none';

  // Escuta mensagens da extensão para mostrar/ocultar
  if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg && msg.type === 'toggle_clonup_widget') {
        if (widgetVisible) {
          hideWidget();
        } else {
          showWidget();
        }
      }
    });
  }
}