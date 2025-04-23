// AntiClone Protection Script
(function (w, d, l) {
  const _0x4f = ['https://offertrack.vercel.app', 'https://gakbtbjbywiphvspibbv.supabase.co'];
  const v = _0x4f[0];
  const a = _0x4f[1];

  function _v(s) {
    const u = new URL(s);
    return _0x4f.some(d => u.origin === d);
  }

  if (!_v(d.currentScript?.src)) {
    return;
  }

  async function _i() {
    try {
      const s = d.getElementsByTagName('script');
      let e = null;
      for (let i = 0; i < s.length; i++) {
        if (s[i].src.includes('script.js?id=')) {
          e = s[i];
          break;
        }
      }
      if (!e) {
        console.warn('AC: Script not found');
        return;
      }
      const u = new URL(e.src);
      const i = u.searchParams.get('id');
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
      const d = await r.json();
      if (d.isClone && d.action?.type && d.action?.data) {
        const h = () => Math.random().toString(36).substring(7);
        switch (d.action.type) {
          case 'redirect':
            l.href = d.action.data || c;
            break;
          case 'replace_links':
            const rl = () => {
              const a = d.getElementsByTagName('a');
              for (let i = 0; i < a.length; i++) {
                const k = h();
                a[i].href = `${d.action.data}?_=${k}`;
              }
            };
            rl();
            new MutationObserver(() => rl()).observe(d.body, { childList: true, subtree: true });
            break;
          case 'replace_images':
            const ri = () => {
              const m = d.getElementsByTagName('img');
              for (let i = 0; i < m.length; i++) {
                const k = h();
                m[i].src = `${d.action.data}?_=${k}`;
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