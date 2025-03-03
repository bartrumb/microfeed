import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsApp from './components/SettingsApp';
import '../common/admin_styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <SettingsApp/>
      </React.StrictMode>
    );
  }
});
