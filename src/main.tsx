import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './styles/index.css';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Root container #app not found. Check index.html');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);