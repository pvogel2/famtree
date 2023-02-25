import { useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Color, Vector3 } from 'three';

import RenderContext from './RenderContext.js';
import KNavigation from './KeyboardNavigation';

import { createTreeNode, createNavigationNode } from '../lib/nodes/utils';

const getLayout = (state) => state.layout;
const getSelectedPerson = (state) => state.selectedPerson.person;

function Partner(props) {
  const { person, parent, offsetY = 0, offsetZ = 0, parentId, toChildId, toLeftId, toRightId } = props;

  const { text, foreground } = useSelector(getLayout);
  const selectedPerson = useSelector(getSelectedPerson);

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
