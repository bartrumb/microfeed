import React from 'react';
import ReactDOM from 'react-dom/client';
import EditItemApp from '../components/EditItemApp';

class NewItemApp extends React.Component<Record<string, unknown>> {
  render(): React.ReactNode {
    return <EditItemApp {...this.props} />;
  }
}

export default NewItemApp;

if (typeof window !== 'undefined') {
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <NewItemApp />
      </React.StrictMode>
    );
  }
}