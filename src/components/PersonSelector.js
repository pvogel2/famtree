import { useContext, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { selectNode, deselectNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';
import LayoutContext from './LayoutContext.js';

function PersonSelector() {
  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);

  const selectedPerson = useSelect((select) => select('famtree/families').getSelected(), []);

  const { foreground, selection } = useSelect(
    (select) => {
      const store = select( 'famtree/runtime' );
      return {
        foreground: store.getForeground(),
        selection: store.getSelection(),
      };
    }, []);
    
  useEffect(() => {
    const rootGroup = selectedPerson && renderer.getObject(`person${selectedPerson.id}`);

    if (rootGroup) {
      selectNode(rootGroup.obj, { color: selection, renderer, layout: Layout });
    }
    return () => {
      if (rootGroup) {
        deselectNode(rootGroup.obj, { foreground, renderer });
      }
    }
  }, [renderer, selectedPerson, foreground, selection, Layout]);

  return null;
}

export default PersonSelector;