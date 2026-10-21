import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Tailwind v4 entry: theme tokens + shared component classes
import './styles/index.css'; // legacy CSS variables
import './styles/App.css'; // legacy layout helpers

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
