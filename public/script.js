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
    const s = d.currentScript || d.querySelector('script[src*="script.js"]');
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

  // Função para carregar script JSONP
  function _ls(u, c) {
    const s = d.createElement('script');
    const n = '_ac_cb_' + Math.random().toString(36).slice(2);
    w[n] = function (r) {
      c(r);
      d.head.removeChild(s);
      delete w[n];
    };
    s.src = u + '&callback=' + n;
    d.head.appendChild(s);
  }

  // Função para verificar clone
  function _vc(i) {
    _ls(`${l.protocol}//${_b}/api/verify?id=${i}&url=${encodeURIComponent(l.href)}`, function (r) {
      if (!r || !r.isClone) return;
      _aa({
        t: r.action.type[0],
        d: r.action.data
      });
    });
  }

  // Inicialização
  const i = _gid();
  if (i) _vc(i);

  // Expõe função global
  w.AntiClone = o;
}(window, document, location); 