import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3 } from 'three';
import RenderContext from './RenderContext.js';
import { createTreeNode } from '../lib/nodes/utils';


function Placeholder(config) {
  const {
    parent,
  } = config;

  const { renderer } = useContext(RenderContext);

  const { text, foreground } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
    };
  });
    
  // render visual node
  useEffect(() => {
    if (!renderer) return;

    const offset = new Vector3(0, 0, 0);
    const colors = { foreground, text };
    const { clean, root } = createTreeNode(null, { renderer, parent, type: 'placeholder' }, { offset, colors });

    renderer.registerEventCallback('render', () => {
      root.rotation.y -= 0.02;
    });

    return clean;
  }, [renderer, foreground, text]);

  return null;
}

export default Placeholder;
