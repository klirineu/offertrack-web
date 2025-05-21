// == Clonup Floating Widget ==
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
  let qtdAnuncios = 10;
  let autoLoad = false;
  let autoLoadInterval = null;

  // Função para rolar e carregar anúncios na biblioteca do Facebook
  function tryAutoLoadFacebook() {
    if (!autoLoad) return;
    if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;
    let loaded = document.querySelectorAll('[data-testid="ad"]:not([data-testid="ad-preview-ad"]), .adlib-AdPreviewGrid-Grid > div').length;
    if (loaded < qtdAnuncios) {
      window.scrollTo(0, document.body.scrollHeight);
      autoLoadInterval = setTimeout(tryAutoLoadFacebook, 1200);
    } else {
      if (autoLoadInterval) clearTimeout(autoLoadInterval);
    }
  }

  // Render
  function render() {
    root.innerHTML = '';
    // Botão flutuante
    root.appendChild(createEl('button', {
      class: 'clonup-float-btn',
      onclick: () => { open = !open; render(); },
      title: 'Abrir Clonup'
    }, '🔎'));

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
          createEl('label', { class: 'clonup-label-switch' },
            createEl('input', {
              type: 'checkbox',
              checked: autoLoad,
              onchange: e => {
                autoLoad = e.target.checked;
                render();
                if (autoLoad) {
                  tryAutoLoadFacebook();
                } else if (autoLoadInterval) {
                  clearTimeout(autoLoadInterval);
                }
              }
            }),
            'Load automático'
          )
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
                onclick: () => {
                  navigator.clipboard.writeText(palavra);
                  copied = palavra;
                  render();
                  setTimeout(() => { copied = null; render(); }, 1200);
                  // Tenta inserir no input de busca
                  const input = document.querySelector('input[type="search"], input[placeholder*="pesquisar" i], input[placeholder*="search" i]');
                  if (input) {
                    input.value = palavra;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                    input.focus();
                  }
                }
              }, palavra, copied === palavra ? ' ✔️' : ''))
          )
        )
      );
      root.appendChild(popup);
    }
  }

  render();
} 