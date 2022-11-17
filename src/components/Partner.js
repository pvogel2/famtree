import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RenderContext from './RenderContext.js';
import { Color, Vector3, Group } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getPartnerGroup, getSymbolGroup, getDataGroup } from '../lib/nodes/utils';

const getForeground = (state) => state.layout.foreground;

const getText = (state) => state.layout.text;

function Partner(props) {
  const { person, parent, offsetY = 0, offsetZ = 0 } = props;

  const foreground = useSelector(getForeground);
  const text = useSelector(getText);

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
    const labelText = new ThreeText({
      text: usedPerson.name,
      position: new Vector3(1, -1, 0),
      rotation: new Vector3(0, Math.PI * 0.5, 0),
      scale: 0.4,
      color: text,
    });

    labelText.attach(null, dataGroup);
    labelText.textMesh.geometry.center();

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
