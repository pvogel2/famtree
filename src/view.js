import { createRoot } from '@wordpress/element';

import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.famtree-block-container');
  nodes.forEach((root, idx) => {
    const instanceId = `famtree${idx}`;
    root.setAttribute('id', instanceId);

    console.log(root.dataset);
    createRoot(root).render(<App
      founder={ parseInt(root.dataset.founder) }
      founderFAB={ root.dataset.founderFab === '1' }
      background={ root.dataset.backgroundColor }
      text={ root.dataset.textColor }
      foreground={ root.dataset.foregroundColor }
      highlight={ root.dataset.highlightColor }
      selection={ root.dataset.selectionColor }
      instanceId= { instanceId }
      treeLayout={ root.dataset.treeLayout }

    />);
  });
});
