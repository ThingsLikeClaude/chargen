import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChargenProvider } from './context/ChargenContext';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChargenProvider>
      <App />
    </ChargenProvider>
  </StrictMode>,
);
