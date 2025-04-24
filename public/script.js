// AntiClone Protection Script
(function (w, d, l) {
  const _0x4f = ['https://offertrack.vercel.app', 'https://gakbtbjbywiphvspibbv.supabase.co'];
  const v = _0x4f[0];
  const a = _0x4f[1];
  let _savedId = null;
  let _isProcessing = false;

  function _v(s) {
    try {
      const u = new URL(s);
      return _0x4f.some(x => u.origin === x);
    } catch (e) {
      return false;
    }
  }

  // Função para extrair o ID do script atual
  function _gid(scriptElement) {
    try {
      // Tenta pegar o ID da URL primeiro
      const url = new URL(scriptElement.src);
      const urlId = url.searchParams.get('id');
      if (urlId) {
        _savedId = urlId;
        return urlId;
      }

      // Se não encontrar na URL, procura no localStorage
      if (_savedId) return _savedId;

      // Procura por um elemento com data-ac-id
      const idElement = d.querySelector('[data-ac-id]');
      if (idElement) {
        _savedId = idElement.getAttribute('data-ac-id');
        return _savedId;
      }

      return null;
    } catch (e) {
      return _savedId;
    }
  }

  // Função para reescrever o script para URL completa
  function _rs() {
    if (_isProcessing) return;
    _isProcessing = true;

    try {
      const scripts = d.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src.includes('script.js') && !_v(script.src)) {
          const id = _gid(script);
          if (id) {
            // Adiciona um elemento oculto com o ID se ainda não existir
            if (!d.querySelector('[data-ac-id]')) {
              const idHolder = d.createElement('div');
              idHolder.style.display = 'none';
              idHolder.setAttribute('data-ac-id', id);
              d.body?.appendChild(idHolder);
            }

            // Só reescreve se o script não estiver no domínio correto
            if (!script.src.startsWith(v)) {
              const newScript = d.createElement('script');
              newScript.src = `${v}/script.js?id=${id}`;
              script.parentNode.replaceChild(newScript, script);
            }
            break;
          }
        }
      }
    } catch (e) {
      console.warn('AC: Rewrite failed', e);
    } finally {
      _isProcessing = false;
    }
  }

  async function _i() {
    try {
      const s = d.getElementsByTagName('script');
      let e = null;
      for (let i = 0; i < s.length; i++) {
        if (s[i].src.includes('script.js')) {
          e = s[i];
          break;
        }
      }
      if (!e) {
        console.warn('AC: Script not found');
        return;
      }

      const i = _gid(e);
      if (!i) {
        console.warn('AC: Missing ID');
        return;
      }

      // Tenta reescrever o script para URL completa (uma vez)
      if (!_v(e.src)) {
        _rs();
      }

      const c = l.href;
      const r = await fetch(`${a}/functions/v1/anticlone-verify?id=${i}&url=${encodeURIComponent(c)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0'
        }
      });

      const data = await r.json();
      if (data.isClone && data.action?.type && data.action?.data) {
        const h = () => Math.random().toString(36).substring(7);
        switch (data.action.type) {
          case 'redirect':
            l.href = data.action.data || c;
            break;
          case 'replace_links':
            const rl = () => {
              const links = d.getElementsByTagName('a');
              for (let i = 0; i < links.length; i++) {
                const k = h();
                links[i].href = `${data.action.data}?_=${k}`;
              }
            };
            rl();
            new MutationObserver(() => rl()).observe(d.body, { childList: true, subtree: true });
            break;
          case 'replace_images':
            const ri = () => {
              const imgs = d.getElementsByTagName('img');
              for (let i = 0; i < imgs.length; i++) {
                const k = h();
                imgs[i].src = `${data.action.data}?_=${k}`;
              }
            };
            ri();
            new MutationObserver(() => ri()).observe(d.body, { childList: true, subtree: true });
            break;
        }
      }
    } catch (e) {
      console.error('AntiClone error:', e);
    }
  }

  // Observador para garantir que o script permaneça
  let _lastCheck = 0;
  const o = new MutationObserver(() => {
    const now = Date.now();
    if (now - _lastCheck > 1000) { // Limita a verificação a uma vez por segundo
      _lastCheck = now;
      _rs();
    }
  });

  o.observe(d.documentElement, { childList: true, subtree: true });

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _i);
  } else {
    _i();
  }
})(window, document, location); 