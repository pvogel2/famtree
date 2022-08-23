import React from "react";
import ReactDOM from "react-dom";

import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('testtest');
  ReactDOM.render(<App
    family={ root.dataset.family }
    familyFAB={ root.dataset.familyFab === 'true' }
    background={ root.dataset.backgroundColor }
  />, root);
});
