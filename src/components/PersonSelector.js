import { useContext, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { selectNode, deselectNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';

function PersonSelector() {
  const { renderer } = useContext(RenderContext);

  const selectedPerson = useSelect((select) => select('famtree/families').getSelected(), []);

  const { foreground, selection } = useSelect(
    (select) => {
      const state = select( 'famtree/runtime' );
      return {
        foreground: state.getForeground(),
        selection: state.getSelection(),
      };
    }, []);
    
  useEffect(() => {
    const rootGroup = selectedPerson && renderer.getObject(`person${selectedPerson.id}`);

    if (rootGroup) {
      selectNode(rootGroup.obj, { color: selection, renderer });
    }
    return () => {
      if (rootGroup) {
        deselectNode(rootGroup.obj, { foreground, renderer });
      }
    }
  }, [renderer, selectedPerson, foreground, selection]);

  return null;
}

export default PersonSelector;