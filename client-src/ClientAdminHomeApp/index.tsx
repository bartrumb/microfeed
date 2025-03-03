import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminHomeApp from './components/AdminHomeApp';
import '../common/admin_styles.css';

document.addEventListener('DOMContentLoaded', (): void => {
  const $rootDom: HTMLElement | null = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <AdminHomeApp/>
      </React.StrictMode>
    );
  }
});
