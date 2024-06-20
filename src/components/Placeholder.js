import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import RenderContext from './RenderContext.js';
import LayoutContext from './LayoutContext.js';
import { createTreeNode } from '../lib/nodes/utils';

function Placeholder(config) {
  const {
    parent,
  } = config;

  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);

  const { text, foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
    };
  });
    
  // render visual node
  useEffect(() => {
    if (!renderer) return;

    const colors = { foreground, text };
    const offset = Layout.getVector(0, 0, 0);

    const { clean, root } = createTreeNode(null, { renderer, parent, type: 'placeholder', offset, colors, layout: Layout });

    renderer.registerEventCallback('render', () => {
      root.rotation.y -= 0.02;
    });

    return clean;
  }, [renderer, foreground, text, Layout]);

  return null;
}

export default Placeholder;
