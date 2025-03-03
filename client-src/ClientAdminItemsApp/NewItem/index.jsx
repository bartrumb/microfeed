import React from 'react';
import ReactDOM from 'react-dom/client';
import EditItemApp from '../components/EditItemApp';

class NewItemApp extends React.Component {
  render() {
    return <EditItemApp {...this.props} />;
  }
}

export default NewItemApp;

if (typeof window !== 'undefined') {
  const $rootDom = document.getElementById('client-side-root');
  ReactDOM.createRoot($rootDom).render(<NewItemApp />);
}