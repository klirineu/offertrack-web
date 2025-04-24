// AntiClone Protection Script
(function (w, d, l) {
  const _0x4f = ['https://offertrack.vercel.app', 'https://gakbtbjbywiphvspibbv.supabase.co'];
  const v = _0x4f[0];
  const a = _0x4f[1];

  function _v(s) {
    try {
      const u = new URL(s);
      return _0x4f.some(x => u.origin === x);
    } catch {
      return false;
    }
  }

  // Verifica se o script está sendo executado do domínio correto
  if (!_v(d.currentScript?.src)) {
    return;
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

      // Pega o ID do atributo data-id
      const i = e.dataset.id;
      if (!i) {
        console.warn('AC: Missing ID');
        return;
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

  const o = new MutationObserver(() => {
    const s = d.currentScript?.src;
    if (s && _v(s)) {
      const e = d.querySelector(`script[src*="${s}"]`);
      if (!e) {
        const n = d.createElement('script');
        n.src = s;
        // Mantém o data-id ao recriar o script
        if (d.currentScript?.dataset.id) {
          n.dataset.id = d.currentScript.dataset.id;
        }
        n.setAttribute('data-ac', '1');
        const f = d.getElementsByTagName('script')[0];
        f.parentNode.insertBefore(n, f);
      }
    }
  });

  o.observe(d.documentElement, { childList: true, subtree: true });

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _i);
  } else {
    _i();
  }
})(window, document, location); 