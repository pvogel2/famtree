import { useContext, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import ClassicLayout from './layouts/ClassicLayout';
import CylinderLayout from './layouts/CylinderLayout';
import { selectNode, deselectNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';

function getLayout(id) {
  return id !== 'classic' ? CylinderLayout : ClassicLayout;
}

function PersonSelector() {
  const { renderer } = useContext(RenderContext);

  const selectedPerson = useSelect((select) => select('famtree/families').getSelected(), []);

  const { foreground, selection, treeLayout } = useSelect(
    (select) => {
      const store = select( 'famtree/runtime' );
      return {
        foreground: store.getForeground(),
        selection: store.getSelection(),
        treeLayout: store.getTreeLayout(),
      };
    }, []);
    
  useEffect(() => {
    const rootGroup = selectedPerson && renderer.getObject(`person${selectedPerson.id}`);

    const Layout = getLayout(treeLayout);

    if (rootGroup) {
      selectNode(rootGroup.obj, { color: selection, renderer, layout: Layout });
    }
    return () => {
      if (rootGroup) {
        deselectNode(rootGroup.obj, { foreground, renderer });
      }
    }
  }, [renderer, selectedPerson, foreground, selection, treeLayout]);

  return null;
}

export default PersonSelector;