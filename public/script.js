// AntiClone Protection Script
(async function () {
  try {
    // Get script URL and extract site ID
    const scriptElement = document.currentScript;
    const scriptUrl = new URL(scriptElement.src);
    const id = scriptUrl.searchParams.get('id');

    if (!id) {
      console.error('AntiClone: Missing site ID');
      return;
    }

    // Get current URL
    const currentUrl = window.location.href;

    // Call verification endpoint
    const response = await fetch(`https://gakbtbjbywiphvspibbv.supabase.co/functions/v1/anticlone-verify?id=${id}&url=${encodeURIComponent(currentUrl)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // If this is a clone, apply the configured action
    if (data.isClone && data.action) {
      switch (data.action.type) {
        case 'redirect':
          // Redirect to original site
          window.location.href = data.action.data.data;
          break;

        case 'replace_links':
          // Replace all links with the configured URL
          document.querySelectorAll('a').forEach(link => {
            link.href = data.action.data.data;
          });

          // Watch for new links being added
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  node.querySelectorAll('a').forEach(link => {
                    link.href = data.action.data.data;
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
            img.src = data.action.data.data;
          });

          // Watch for new images being added
          const imgObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  node.querySelectorAll('img').forEach(img => {
                    img.src = data.action.data.data;
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