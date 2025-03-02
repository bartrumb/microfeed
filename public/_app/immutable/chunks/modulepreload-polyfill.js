/*
 * Polyfill for modulepreload
 * Adapted from https://github.com/guybedford/es-module-shims
 */
(function() {
  let nonce;
  try {
    nonce = document.querySelector('meta[property="csp-nonce"]').getAttribute('content');
  } catch(e) {
    nonce = '';
  }

  const preloadMap = new Map();
  const preloadLinks = document.querySelectorAll('link[rel=modulepreload]');
  
  function preload(url) {
    if (preloadMap.has(url)) {
      return preloadMap.get(url);
    }

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = url;
    if (nonce) {
      link.setAttribute('nonce', nonce);
    }

    const promise = new Promise((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = reject;
    });

    document.head.appendChild(link);
    preloadMap.set(url, promise);
    return promise;
  }

  // Preload all modulepreload links found in the document
  preloadLinks.forEach(link => {
    preload(link.href);
  });

  // Export for potential manual usage
  window.__viteModulePreload = preload;
})();