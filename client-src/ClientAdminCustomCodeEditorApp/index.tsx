import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomCodeEditorApp from "./components/CustomCodeEditorApp";
import '../common/admin_styles.css';
import { OnboardingResult } from '../../common-src/types/FeedContent';

document.addEventListener('DOMContentLoaded', (): void => {
  const $rootDom: HTMLElement | null = document.getElementById('client-side-root');
  if ($rootDom) {
    const root = ReactDOM.createRoot($rootDom);
    root.render(
      <React.StrictMode>
        <CustomCodeEditorApp 
          onboardingResult={(window as any).__INITIAL_DATA__.onboardingResult as OnboardingResult}/>
      </React.StrictMode>
    );
  }
});
