import React from "react";
import ReactDOM from "react-dom";

import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.pedigree-block-container');
  nodes.forEach((root, idx) => {
    root.setAttribute('id', `test${idx}`);
    ReactDOM.render(<App
      founder={ parseInt(root.dataset.founder) }
      founderFAB={ root.dataset.founderFab === 'true' }
      background={ root.dataset.backgroundColor }
      text={ root.dataset.textColor }
      foreground={ root.dataset.foregroundColor }
      highlight={ root.dataset.highlightColor }
      selection={ root.dataset.selectionColor }
      idx={ idx }
    />, root);
  });
});
