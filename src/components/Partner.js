import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RenderContext from './RenderContext.js';
import { Color, Vector3 } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getPartnerGroup, getSymbolGroup, getDataGroup, addLabelText } from '../lib/nodes/utils';

const getLayout = (state) => state.layout;

function Partner(props) {
  const { person, parent, offsetY = 0, offsetZ = 0 } = props;

  const { text, foreground } = useSelector(getLayout);
 
  const { renderer } = useContext(RenderContext);

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
    const labelText = addLabelText(dataGroup, usedPerson.name, text);

    return () => {
      root.clear();
      renderer.removeObject(rootId);
      renderer.removeObject(symbolId);
      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, parent, foreground, text, offsetY, offsetZ]);

  return null;
};

export default Partner;
