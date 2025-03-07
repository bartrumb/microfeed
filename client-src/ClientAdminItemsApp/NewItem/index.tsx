import React from 'react';
import ReactDOM from 'react-dom/client';
import EditItemApp from '../components/EditItemApp';

interface NewItemAppProps {
  // Empty props interface since we're just passing through props
}

class NewItemApp extends React.Component<NewItemAppProps> {
  render(): React.ReactNode {
    return <EditItemApp {...this.props} />;
  }
}

export default NewItemApp;

// Only run in browser environment
if (typeof window !== 'undefined') {
  const $rootDom = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <NewItemApp />
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found');
  }
}