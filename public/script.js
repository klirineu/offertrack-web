// AntiClone Protection Script v5
(function (w, d, l) {
  const _b = 'offertrack.vercel.app';
  const _p = l.protocol;

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

  // Função para aplicar ações
  function _aa(action) {
    if (!action || !action.type || !action.data) return;

    const _r = () => Math.random().toString(36).slice(7);

    switch (action.type) {
      case 'redirect':
        l.href = action.data;
        break;

      case 'replace_links':
        const _ul = () => {
          const a = d.getElementsByTagName('a');
          for (let i = 0; i < a.length; i++) {
            a[i].href = `${action.data}?_=${_r()}`;
          }
        };
        _ul();
        new MutationObserver(_ul).observe(d.body, { childList: true, subtree: true });
        break;

      case 'replace_images':
        const _ui = () => {
          const m = d.getElementsByTagName('img');
          for (let i = 0; i < m.length; i++) {
            m[i].src = `${action.data}?_=${_r()}`;
          }
        };
        _ui();
        new MutationObserver(_ui).observe(d.body, { childList: true, subtree: true });
        break;
    }
  }

  // Função para verificar clone usando JSONP
  function _vc(id, url) {
    const cb = '_ac_' + Math.random().toString(36).slice(2);
    w[cb] = function (response) {
      if (response && response.isClone) {
        _aa(response.action);
      }
      delete w[cb];
      const script = d.getElementById(cb);
      if (script) script.remove();
    };

    const script = d.createElement('script');
    script.id = cb;
    script.src = `${_p}//${_b}/api/verify.js?id=${id}&url=${encodeURIComponent(url)}&callback=${cb}`;
    d.head.appendChild(script);
  }

  // Função principal
  function _i() {
    try {
      const i = _gid();
      if (!i) return;

      _vc(i, l.href);
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