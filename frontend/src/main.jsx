import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
if (localStorage.getItem('barberflow-theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

if (localStorage.getItem('barberflow-theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
