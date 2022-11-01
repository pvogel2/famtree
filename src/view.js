import React from "react";
import ReactDOM from "react-dom";

import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('testtest');
  ReactDOM.render(<App
    founder={ parseInt(root.dataset.founder) }
    founderFAB={ root.dataset.founderFab === 'true' }
    background={ root.dataset.backgroundColor }
    text={ root.dataset.text }
    foreground={ root.dataset.foregroundColor }
    highlight={ root.dataset.highlightColor }
  />, root);
});
