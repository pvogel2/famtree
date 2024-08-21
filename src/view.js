import { createRoot } from '@wordpress/element';

import App from './App';

window.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.famtree-block-container');
  nodes.forEach((root, idx) => {
    console.log(root.dataset);
    const instanceId = `famtree${idx}`;
    root.setAttribute('id', instanceId);

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
      roundedBending={ root.dataset.roundedBending }

    />);
  });
});
