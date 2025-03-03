import React from 'react';
import ReactDOM from 'react-dom/client';
import AllItemsApp from './components/AllItemsApp';

// Import module patching in development/preview mode
if (process.env.NODE_ENV !== 'production') {
  import('../common/module-patch.js')
    .then(() => console.info('Module patching initialized'))
    .catch(err => console.warn('Failed to initialize module patching:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <AllItemsApp/>
      </React.StrictMode>
    );
  }
});
