// Pega os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const url = params.get('url');
const callback = params.get('callback');

// Verifica se temos todos os parâmetros necessários
if (!id || !url || !callback) {
  console.error('Missing parameters');
  return;
}

// Faz a verificação no Supabase
fetch(`https://gakbtbjbywiphvspibbv.supabase.co/rest/v1/anticlone_sites?id=ilike.${id}%&select=id,action_type,action_data`, {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0'
  }
})
  .then(r => r.json())
  .then(sites => {
    if (!sites || !sites[0]) {
      window[callback]({ isClone: false });
      return;
    }

    const site = sites[0];

    // Registra o clone
    fetch('https://gakbtbjbywiphvspibbv.supabase.co/rest/v1/detected_clones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        anticlone_site_id: site.id,
        clone_url: url,
        last_access: new Date().toISOString(),
        access_count: 1
      })
    }).catch(console.error);

    // Retorna a resposta
    window[callback]({
      isClone: true,
      action: {
        type: site.action_type,
        data: site.action_data
      }
    });
  })
  .catch(error => {
    console.error('Verify error:', error);
    window[callback]({ isClone: false });
  }); 