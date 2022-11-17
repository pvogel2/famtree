import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectNode, deselectNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';

const getLayout = (state) => state.layout;
const getSelectedPerson = (state) => state.selectedPerson.person;

function PersonSelector() {
  const { renderer } = useContext(RenderContext);

  const selectedPerson = useSelector(getSelectedPerson);
  const { foreground, selection } = useSelector(getLayout);
  
  useEffect(() => {
    const rootGroup = selectedPerson && renderer.getObject(`person${selectedPerson.id}`);
    if (rootGroup) {
      selectNode(rootGroup.obj, { color: selection, renderer });
    }
    return () => {
      if (rootGroup) {
        deselectNode(rootGroup.obj, { foreground });
      }
    }
  }, [renderer, selectedPerson, foreground]);
  return null;
}

export default PersonSelector;