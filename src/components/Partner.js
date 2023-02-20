import { useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Color, Vector3 } from 'three';

import RenderContext from './RenderContext.js';
import KNavigation from './KeyboardNavigation';
import Person from '../lib/Person';

import { isValidId, getPartnerGroup, getSymbolGroup, getDataGroup, getNavigationGroup, addLabelText3D, getNaviArrowMesh } from '../lib/nodes/utils';

const getLayout = (state) => state.layout;
const getSelectedPerson = (state) => state.selectedPerson.person;

function Partner(props) {
  const { person, parent, offsetY = 0, offsetZ = 0, parentId, toChildId, toLeftId, toRightId } = props;

  const { text, foreground } = useSelector(getLayout);
  const selectedPerson = useSelector(getSelectedPerson);

  const isSelected = selectedPerson && selectedPerson?.id === person?.id;
 
  const { renderer } = useContext(RenderContext);

  const arrOff = 0.2;
  const naviOff = 0.9;
  const navi = useMemo(() => ({
    parent: { pos: [0, -arrOff, 0], refId: parentId, rot: Math.PI * -0.5 },
    child: { pos: [0, arrOff, 0], refId: toChildId, rot: Math.PI * 0.5 },
    left: { pos: [0, 0, arrOff], refId: toLeftId, rot: Math.PI },
    right: { pos: [0, 0, -arrOff], refId: toRightId },
  }), [parentId, toChildId, toLeftId, toRightId]);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);

    const rootOffset = new Vector3(0, offsetY, offsetZ);
    const rootId = `person${usedPerson.id}`;

    const partnerColor = new Color(foreground).multiplyScalar(0.75);

    const root = getPartnerGroup(usedPerson);
    root.position.add(rootOffset);

    const symbolGroup = getSymbolGroup(person, { foreground: `#${partnerColor.getHexString()}` });
    const symbolId = `symbol${usedPerson.id}`;

    renderer.addObject(rootId, root, false, parent);
    renderer.addObject(symbolId, symbolGroup, true, root);

    const dataGroup = getDataGroup(root);
    const labelText = addLabelText3D(dataGroup, `${usedPerson.name}`, text);

    const naviGroup = getNavigationGroup(root);
    naviGroup.position.set(arrOff, naviOff, -naviOff);
    naviGroup.visible = false;

    Object.entries(navi).forEach(([target, props]) => {
      const { refId, pos, rot } = props;

      if (isValidId(refId)) {
        const nodeId = `${target}Navi${usedPerson.id}`;
        const naviMesh = getNaviArrowMesh({ rot });
        naviMesh.position.set(pos[0], pos[1], pos[2]);
        naviMesh.userData.refId = refId;

        renderer.addObject(nodeId, naviMesh, true, naviGroup);
      }
    });

    return () => {
      root.clear();
      renderer.removeObject(rootId);
      renderer.removeObject(symbolId);

      Object.entries(navi).forEach(([target, props]) => {
        const { refId } = props;
  
        if (isValidId(refId)) {
          const nodeId = `${target}Navi${usedPerson.id}`;
          renderer.removeObject(nodeId);
        }
      });

      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, parent, foreground, text, offsetY, offsetZ, navi]);

  return ( 
    isSelected
      ? <KNavigation upId={ toChildId } downId={ parentId } leftId={ toLeftId } rightId={ toRightId } />
      : null
  );
}

export default Partner;
