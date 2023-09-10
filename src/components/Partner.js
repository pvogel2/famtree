import { useContext, useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Color, Vector3 } from 'three';

import RenderContext from './RenderContext.js';
import KNavigation from './KeyboardNavigation';

import { createTreeNode, createNavigationNode } from '../lib/nodes/utils';


function Partner(props) {
  const { person, parent, offsetY = 0, offsetZ = 0, parentId, toChildId, toLeftId, toRightId } = props;

  const { text, foreground } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
    };
  });

  const selectedPerson = useSelect((select) => select('famtree/families').getSelected());

  const isSelected = selectedPerson && selectedPerson?.id === person?.id;
 
  const { renderer } = useContext(RenderContext);

  const navi = useMemo(() => ({
    parent: { refId: parentId },
    child: { refId: toChildId },
    left: { refId: toLeftId },
    right: { refId: toRightId },
  }), [parentId, toChildId, toLeftId, toRightId]);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const partnerColor = new Color(foreground).multiplyScalar(0.75);

    const type = 'partner';

    const offset = new Vector3(0, offsetY, offsetZ);
    const colors = { foreground: `#${partnerColor.getHexString()}`, text };

    const { root, clean: partnerClean } = createTreeNode(person, { renderer, parent, type }, { offset, colors });

    const { clean: naviClean } = createNavigationNode(person, { renderer, parent: root, navi });

    return () => {
      partnerClean();
      naviClean();
    };
  }, [renderer, person, parent, foreground, text, offsetY, offsetZ, navi]);

  return ( 
    isSelected
      ? <KNavigation upId={ toChildId } downId={ parentId } leftId={ toLeftId } rightId={ toRightId } />
      : null
  );
}

export default Partner;
