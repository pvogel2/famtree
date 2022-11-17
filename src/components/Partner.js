import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RenderContext from './RenderContext.js';
import { Color, Vector3, Group } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getPersonMesh, addDataToMesh } from '../lib/nodes/utils';

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

    const meshOffset = new Vector3(0, offsetY, offsetZ);
    const rootId = `person${usedPerson.id}`;
    const meshId = `pNode${usedPerson.id}`;

    const partnerColor = new Color(foreground).multiplyScalar(0.75);

    const root = new Group();
    root.name = rootId;
    root.userData.refId = usedPerson.id;
    root.userData.type = 'partner';
    root.position.add(meshOffset);

    const m = getPersonMesh(person, { foreground: `#${partnerColor.getHexString()}` });
    m.name = 'symbols';

    renderer.addObject(rootId, root, false, parent);
    renderer.addObject(meshId, m, true, root);

    const dataGroup = addDataToMesh(root);
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
      renderer.removeObject(meshId);
      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, parent, foreground, text, offsetY, offsetZ]);

  return null;
};

export default Partner;
