import React from 'react';
import ReactDOM from 'react-dom/client';
import AllItemsApp from './components/AllItemsApp';
import '../common/admin_styles.css';

document.addEventListener('DOMContentLoaded', (): void => {
  const $rootDom: HTMLElement | null = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <AllItemsApp/>
      </React.StrictMode>
    );
  }
});
