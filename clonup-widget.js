// Função para filtrar cards de anúncio por quantidade
function filtrarCardsPorQuantidade() {
  // Só executa na biblioteca de anúncios do Facebook
  if (!/facebook\.com\/ads\/library/.test(window.location.href)) return;
  // Container dos cards
  const container = document.querySelector('.xrvj5dj.x18m771g.x1p5oq8j.xbxaen2.x18d9i69.x1u72gb5.xtqikln.x1na6gtj.x1jr1mh3.xm39877.x7sq92a.xxy4fzi');
  if (!container) return alert('Container de anúncios não encontrado!');
  // Todos os cards
  const cards = Array.from(container.querySelectorAll('.xh8yej3.card-ad'));
  let count = 0;
  cards.forEach(card => {
    const strong = card.querySelector('strong.totalads');
    if (!strong) {
      card.style.display = 'none';
      return;
    }
    // Extrai o número de anúncios do texto, ex: '2 anúncios'
    const match = strong.textContent.match(/(\d+)/);
    const qtd = match ? parseInt(match[1], 10) : 0;
    if (qtd <= qtdAnuncios) {
      card.style.display = 'block';
      count++;
    } else {
      card.style.display = 'none';
    }
  });
  alert(`Exibindo ${count} anúncios com até ${qtdAnuncios} anúncios.`);
}

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