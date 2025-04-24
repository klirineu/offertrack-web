// AntiClone Protection Script v3
(function (w, d, l) {
  const _h = l.hostname;
  const _p = l.protocol;
  const _b = 'offertrack.vercel.app';

  // Função para verificar origem
  function _v(u) {
    try {
      return new URL(u).hostname === _b;
    } catch {
      return false;
    }
  }

  // Função para obter ID do script
  function _gid() {
    try {
      const s = d.currentScript || d.querySelector('script[src*="script.js"]');
      if (!s) return null;

      const url = new URL(s.src);
      return url.searchParams.get('id');
    } catch {
      return null;
    }
  }

  // Função principal
  async function _i() {
    try {
      const i = _gid();
      if (!i) return;

      // Usa o domínio principal para verificação
      const r = await fetch(`${_p}//${_b}/api/verify?id=${i}&url=${encodeURIComponent(l.href)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!r.ok) return;

      const d = await r.json();
      if (!d.isClone || !d.action) return;

      const { type, data } = d.action;
      const _r = () => Math.random().toString(36).slice(7);

      switch (type) {
        case 'redirect':
          l.href = data;
          break;

        case 'replace_links':
          const _ul = () => {
            const a = d.getElementsByTagName('a');
            for (let i = 0; i < a.length; i++) {
              a[i].href = `${data}?_=${_r()}`;
            }
          };
          _ul();
          new MutationObserver(_ul).observe(d.body, { childList: true, subtree: true });
          break;

        case 'replace_images':
          const _ui = () => {
            const m = d.getElementsByTagName('img');
            for (let i = 0; i < m.length; i++) {
              m[i].src = `${data}?_=${_r()}`;
            }
          };
          _ui();
          new MutationObserver(_ui).observe(d.body, { childList: true, subtree: true });
          break;
      }
    } catch (e) {
      console.warn('AC:', e);
    }
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _i);
  } else {
    _i();
  }
})(window, document, location); 