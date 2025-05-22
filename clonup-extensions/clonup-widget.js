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
  function renderClonupExtra() {
    if (!window.location.href.includes('view_all_page_id=')) return;
    let extra = document.getElementById('clonup-extra-block');
    if (extra) extra.remove();
    extra = document.createElement('div');
    extra.id = 'clonup-extra-block';
    extra.style.position = 'fixed';
    extra.style.top = '24px';
    extra.style.right = '24px';
    extra.style.zIndex = '99999';
    extra.style.background = '#fff';
    extra.style.boxShadow = '0 2px 16px #0002';
    extra.style.borderRadius = '12px';
    extra.style.padding = '18px 22px';
    extra.style.display = 'flex';
    extra.style.flexDirection = 'column';
    extra.style.gap = '16px';
    extra.style.flexWrap = 'wrap';
    extra.style.alignItems = 'stretch';
    extra.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px;">
        <label class="clonup-label">Qtd. anúncios:</label>
        <input type="number" min="1" max="100" value="${qtdAnuncios}" class="clonup-input" id="clonup-qtd-input">
        <button class="clonup-tab" id="clonup-filtrar-btn">Filtrar por quantidade</button>
        <label class="clonup-label-switch">
          <span style="margin-right:4px;">Load automático</span>
          <label class="clonup-switch">
            <input type="checkbox" id="clonup-autoload-input" ${autoLoad ? 'checked' : ''}>
            <span class="clonup-slider"></span>
          </label>
          <span>${autoLoadActive ? 'Carregando...' : ''}</span>
        </label>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <button class="clonup-btn-importar">Exportar para o Clonup</button>
        <button class="clonup-btn-criativos">Baixar criativos</button>
        <button class="clonup-btn-clonar">Clonar site</button>
      </div>
    `;
    document.body.appendChild(extra);

    // Controles de filtro e auto-load
    extra.querySelector('#clonup-qtd-input').onchange = e => {
      qtdAnuncios = Number(e.target.value);
      filtrarCardsPorQuantidade();
    };
    extra.querySelector('#clonup-filtrar-btn').onclick = filtrarCardsPorQuantidade;
    extra.querySelector('#clonup-autoload-input').onchange = e => {
      autoLoad = e.target.checked;
      if (autoLoad) {
        tryAutoLoadFacebook();
      } else if (autoLoadInterval) {
        clearTimeout(autoLoadInterval);
        autoLoadActive = false;
      }
    };

    // Exportar para o Clonup
    extra.querySelector('.clonup-btn-importar').onclick = () => {
      if (!isLoggedIn()) {
        showLoginModal(() => renderClonupExtra());
        return;
      }
      showExportModal();
    };
    // Baixar criativos
    extra.querySelector('.clonup-btn-criativos').onclick = () => {
      showDownloadCreativesModal();
    };
    // Clonar site
    extra.querySelector('.clonup-btn-clonar').onclick = () => {
      if (!isLoggedIn()) {
        showLoginModal(() => renderClonupExtra());
        return;
      }
      showCloneModal();
    };
  }

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

  // --- Hook para renderizar bloco extra ao abrir popup ---
  setInterval(renderClonupExtra, 1000);

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
      autoLoadInterval = setTimeout(tryAutoLoadFacebook, 1500);
    }, 1200);
  }

  // Função para filtrar, destacar e mostrar apenas os cards com quantidade >= qtdAnuncios (ou 1 se for 1)
  function filtrarCardsPorQuantidade() {
    if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;
    const container = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll(':scope > .xh8yej3'));
    const minQtd = qtdAnuncios > 1 ? qtdAnuncios : 1;
    let count = 0;
    // Armazena cards que devem ser exibidos
    const cardsFiltrados = [];
    cards.forEach(card => {
      const strong = Array.from(card.querySelectorAll('strong')).find(s => /\d+\s+anúncios?/.test(s.textContent));
      if (!strong) {
        card.style.display = 'none';
        return;
      }
      const match = strong.textContent.match(/(\d+)/);
      const qtd = match ? parseInt(match[1], 10) : 0;
      if (qtd >= minQtd) {
        card.style.display = 'block';
        // Destaca
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
        cardsFiltrados.push({ card, qtd });
        count++;
      } else {
        card.style.display = 'none';
      }
    });
    // Ordena os cards visíveis do maior para o menor
    cardsFiltrados.sort((a, b) => b.qtd - a.qtd);
    cardsFiltrados.forEach(({ card }) => container.appendChild(card));
    showToast(`Exibindo ${count} cards com ${minQtd} anúncios ou mais.`);
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

  // Render
  function render() {
    // Se for página de view_all_page_id, só renderiza o bloco extra
    if (window.location.href.includes('view_all_page_id=')) {
      renderClonupExtra();
      return;
    }
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

    // Sempre renderiza bloco extra se for página de anúncios
    renderClonupExtra();

    // Popup
    if (open) {
      const popup = createEl('div', { class: 'clonup-popup' },
        createEl('div', { class: 'clonup-popup-header' },
          createEl('span', { class: 'clonup-popup-title' }, 'Palavras-chave Clonup'),
          createEl('button', {
            class: 'clonup-popup-close',
            onclick: () => { open = false; render(); }
          }, '×')
        ),
        // Opções extras
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
        // Botões de ação Clonup
        createEl('div', { class: 'clonup-popup-actions', style: 'display:flex;gap:10px;margin:16px 0 8px 0;flex-wrap:wrap;' },
          createEl('button', {
            class: 'clonup-btn-importar',
            onclick: () => {
              if (!isLoggedIn()) {
                showLoginModal(() => render());
                return;
              }
              showExportModal();
            }
          }, 'Exportar para o Clonup'),
          createEl('button', {
            class: 'clonup-btn-criativos',
            onclick: showDownloadCreativesModal
          }, 'Baixar criativos'),
          createEl('button', {
            class: 'clonup-btn-clonar',
            onclick: () => {
              if (!isLoggedIn()) {
                showLoginModal(() => render());
                return;
              }
              showCloneModal();
            }
          }, 'Clonar site')
        ),
        // Tabs categoria
        createEl('div', { class: 'clonup-popup-tabs' },
          ...Object.keys(palavrasChave).map(cat =>
            createEl('button', {
              class: 'clonup-tab' + (cat === categoria ? ' clonup-tab-active' : ''),
              onclick: () => { categoria = cat; idioma = Object.keys(palavrasChave[cat])[0]; render(); }
            }, cat)
          )
        ),
        // Tabs idioma
        createEl('div', { class: 'clonup-popup-tabs' },
          ...Object.keys(palavrasChave[categoria]).map(lang =>
            createEl('button', {
              class: 'clonup-tab' + (lang === idioma ? ' clonup-tab-active' : ''),
              onclick: () => { idioma = lang; render(); }
            }, lang)
          )
        ),
        // Lista de palavras
        createEl('ul', { class: 'clonup-list' },
          ...palavrasChave[categoria][idioma].map(palavra =>
            createEl('li', {},
              createEl('button', {
                class: 'clonup-list-btn' + (copied === palavra ? ' clonup-list-btn-copied' : ''),
                style: 'font-size:1.1em;padding:10px 12px;margin-bottom:6px;border:1px solid #e5e7eb;background:#f9fafb;',
                onclick: () => handlePalavraClick(palavra)
              }, palavra, copied === palavra ? ' ✔️' : ''))
          )
        )
      );
      root.appendChild(popup);
    }
  }

  // Destaca quantidade ao abrir o site
  setTimeout(destacarQtdAnuncios, 500);
  render();
}