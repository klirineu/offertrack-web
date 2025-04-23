// AntiClone Protection Script
(async function () {
  try {
    // Get script URL and extract site ID
    const scriptElement = document.currentScript;
    if (!scriptElement) {
      console.error('AntiClone: Could not find script element');
      return;
    }

    console.log('Script src:', scriptElement.src); // Debug log
    const scriptUrl = new URL(scriptElement.src);
    const id = scriptUrl.searchParams.get('id');

    console.log('Extracted ID:', id); // Debug log

    if (!id) {
      console.error('AntiClone: Missing site ID');
      return;
    }

    // Get current URL
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl); // Debug log

    // Call verification endpoint using Supabase Edge Function
    const response = await fetch(`https://gakbtbjbywiphvspibbv.supabase.co/functions/v1/anticlone-verify?id=${id}&url=${encodeURIComponent(currentUrl)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha2J0YmpieXdpcGh2c3BpYmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MjQ4MjAsImV4cCI6MjA2MTAwMDgyMH0.v1d06JVtNPoJ687yVQKV-UD5X9jHKqHYao-GCc-NNo0'
      }
    });

    const data = await response.json();
    console.log('Response data:', data); // Debug log

    // Só executa ações se houver uma ação configurada e válida
    if (data.action && data.action.type && data.action.data) {
      switch (data.action.type) {
        case 'redirect':
          // Redirect to original site
          window.location.href = data.action.data;
          break;

        case 'replace_links':
          // Replace all links with the configured URL
          document.querySelectorAll('a').forEach(link => {
            link.href = data.action.data;
          });

          // Watch for new links being added
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  node.querySelectorAll('a').forEach(link => {
                    link.href = data.action.data;
                  });
                }
              });
            });
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          break;

        case 'replace_images':
          // Replace all images with the configured URL
          document.querySelectorAll('img').forEach(img => {
            img.src = data.action.data;
          });

          // Watch for new images being added
          const imgObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  node.querySelectorAll('img').forEach(img => {
                    img.src = data.action.data;
                  });
                }
              });
            });
          });

          imgObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
          break;
      }
    }
  } catch (error) {
    console.error('AntiClone:', error);
  }
})(); 