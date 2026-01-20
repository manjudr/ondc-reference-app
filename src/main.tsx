import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { ConfigProvider } from './config/ConfigProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
