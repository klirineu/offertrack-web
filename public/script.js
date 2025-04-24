// AntiClone Protection Script
(function (w, d, l) {
  const _0x4f = ['https://offertrack.vercel.app', 'https://gakbtbjbywiphvspibbv.supabase.co'];
  const v = _0x4f[0];
  const a = _0x4f[1];
  let _savedId = null;
  let _isProcessing = false;

  // ID fixo para clones (será substituído dinamicamente)
  const _cloneId = '{{CLONE_ID}}';

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
      // Primeiro verifica se temos um ID de clone embutido
      if (_cloneId !== '{{CLONE_ID}}') {
        return _cloneId;
      }

      // Tenta pegar o ID da URL
      const url = new URL(scriptElement.src);
      const urlId = url.searchParams.get('id');
      if (urlId) {
        _savedId = urlId;
        return urlId;
      }

      // Se não encontrar na URL, usa o ID salvo
      if (_savedId) return _savedId;

      return null;
    } catch (e) {
      return _savedId || (_cloneId !== '{{CLONE_ID}}' ? _cloneId : null);
    }
  }

  // Função para modificar o script local com o ID
  async function _embedId(id) {
    try {
      const scripts = d.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script.src.includes('script.js')) {
          const response = await fetch(script.src);
          if (response.ok) {
            let content = await response.text();

            // Substitui o placeholder pelo ID real
            content = content.replace('{{CLONE_ID}}', id);

            // Cria um novo script com o conteúdo modificado
            const newScript = d.createElement('script');
            const blob = new Blob([content], { type: 'application/javascript' });
            newScript.src = URL.createObjectURL(blob);

            // Substitui o script antigo
            script.parentNode.replaceChild(newScript, script);
            break;
          }
        }
      }
    } catch (e) {
      console.warn('AC: Embed failed', e);
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
        // Se for um clone e o ID ainda não estiver embutido, tenta embutir
        if (_cloneId === '{{CLONE_ID}}' && !_v(e.src)) {
          await _embedId(i);
        }

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

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', _i);
  } else {
    _i();
  }
})(window, document, location); 