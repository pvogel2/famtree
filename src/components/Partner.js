import { useContext, useEffect, useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Color, Vector3, Cylindrical } from 'three';

import RenderContext from './RenderContext.js';
import KNavigation from './KeyboardNavigation';

import { createTreeNode, createNavigationNode } from '../lib/nodes/utils';


function Partner(props) {
  const {
    person,
    parent,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0,
    parentId,
    toChildId,
    toLeftId,
    toRightId,
  } = props;

  const { text, foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      text: store.getText(),
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
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

    const offset = treeLayout === 'rounded' ? new Cylindrical(offsetX, offsetY, offsetZ) : new Vector3(offsetX, offsetY, offsetZ);

    const colors = { foreground: `#${partnerColor.getHexString()}`, text };

    const { root, clean: partnerClean } = createTreeNode(person, { renderer, parent, type }, { offset, colors });

    const { clean: naviClean } = createNavigationNode(person, { renderer, parent: root, navi });

    return () => {
      partnerClean();
      naviClean();
    };
  }, [renderer, person, parent, foreground, text, offsetX, offsetY, offsetZ, navi, treeLayout]);

  return ( 
    isSelected
      ? <KNavigation upId={ toChildId } downId={ parentId } leftId={ toLeftId } rightId={ toRightId } />
      : null
  );
}

export default Partner;
