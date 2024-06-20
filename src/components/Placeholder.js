import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import ClassicLayout from './layouts/ClassicLayout';
import CylinderLayout from './layouts/CylinderLayout';
import RenderContext from './RenderContext.js';
import { createTreeNode } from '../lib/nodes/utils';


function getLayout(id) {
  return id !== 'classic' ? CylinderLayout : ClassicLayout;
}

function Placeholder(config) {
  const {
    parent,
  } = config;

  const { renderer } = useContext(RenderContext);

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
    const Layout = getLayout(treeLayout);
    const offset = Layout.calcOffset(0, 0, 0);

    const { clean, root } = createTreeNode(null, { renderer, parent, type: 'placeholder', offset, colors, layout: Layout });

    renderer.registerEventCallback('render', () => {
      root.rotation.y -= 0.02;
    });

    return clean;
  }, [renderer, foreground, text, treeLayout]);

  return null;
}

export default Placeholder;
