// AntiClone Protection Script v5
!function (w, d, l, o, t) {
  if (w._ac) return;
  o = w._ac = function () {
    (o.queue = o.queue || []).push([].slice.call(arguments))
  };
  o.push = o; o.loaded = !0; o.v = '1.0'; o.queue = [];

  // Configuração inicial
  const _b = 'offertrack.vercel.app';
  const _k = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0';

  // Função para obter ID do script
  function _gid() {
    const s = d.currentScript || d.querySelector('script[src*="anticlone.js"]');
    return s && s.dataset.id;
  }

  // Função para aplicar ações
  function _aa(a) {
    if (!a || !a.t || !a.d) return;
    const r = () => Math.random().toString(36).slice(7);
    switch (a.t) {
      case 'r': l.href = a.d; break;
      case 'l':
        const u = () => {
          const x = d.getElementsByTagName('a');
          for (let i = 0; i < x.length; i++)x[i].href = `${a.d}?_=${r()}`;
        };
        u(); new MutationObserver(u).observe(d.body, { childList: !0, subtree: !0 });
        break;
      case 'i':
        const m = () => {
          const x = d.getElementsByTagName('img');
          for (let i = 0; i < x.length; i++)x[i].src = `${a.d}?_=${r()}`;
        };
        m(); new MutationObserver(m).observe(d.body, { childList: !0, subtree: !0 });
        break;
    }
  }

  // Função para verificar clone
  function _vc(i) {
    fetch(`https://gakbtbjbywiphvspibbv.supabase.co/rest/v1/anticlone_sites?id=ilike.${i}%&select=id,action_type,action_data`, {
      headers: { 'apikey': _k }
    })
      .then(r => r.json())
      .then(s => {
        if (!s || !s[0]) return;
        const e = s[0];
        fetch('https://gakbtbjbywiphvspibbv.supabase.co/rest/v1/detected_clones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': _k,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            anticlone_site_id: e.id,
            clone_url: l.href,
            last_access: new Date().toISOString(),
            access_count: 1
          })
        }).catch(console.warn);

        _aa({
          t: e.action_type[0],
          d: e.action_data
        });
      })
      .catch(console.warn);
  }

  // Inicialização
  const i = _gid();
  if (i) _vc(i);

  // Expõe função global
  w.AntiClone = o;
}(window, document, location); 