import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectNode, deselectNode } from '../lib/nodes/utils';

import RenderContext from './RenderContext.js';

const getForeground = (state) => state.layout.foreground;
const getSelectedPerson = (state) => state.selectedPerson.person;

function PersonSelector() {
  const { renderer } = useContext(RenderContext);

  const selectedPerson = useSelector(getSelectedPerson);
  const foreground = useSelector(getForeground);
  
  useEffect(() => {
    const rootGroup = selectedPerson && renderer.getObject(`person${selectedPerson.id}`);
    if (rootGroup) {
      selectNode(rootGroup.obj, { highlight: '#ffffff', renderer });
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