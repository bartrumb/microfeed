/*
 * Polyfill for modulepreload
 * Adapted from https://github.com/guybedford/es-module-shims
 */

interface Window {
  __viteModulePreload?: (url: string) => Promise<void>;
}

(() => {
  let nonce: string;
  try {
    const metaElement = document.querySelector('meta[property="csp-nonce"]');
    nonce = metaElement?.getAttribute('content') || '';
  } catch(e) {
    nonce = '';
  }

  const preloadMap = new Map<string, Promise<void>>();
  const preloadLinks = document.querySelectorAll<HTMLLinkElement>('link[rel=modulepreload]');
  
  function preload(url: string): Promise<void> {
    if (preloadMap.has(url)) {
      return preloadMap.get(url)!;
    }

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = url;
    if (nonce) {
      link.setAttribute('nonce', nonce);
    }

    const promise = new Promise<void>((resolve, reject) => {
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
  (window as Window).__viteModulePreload = preload;
})();