import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RenderContext from './RenderContext.js';
import { Color, Vector3 } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getMesh, addDataToMesh } from '../lib/nodes/utils';

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
    const meshId = `partner${usedPerson.id}`;

    const partnerColor = new Color(foreground).multiplyScalar(0.75);
    const m = getMesh({ foreground: `#${partnerColor.getHexString()}` });

    m.name = meshId;
    m.userData.id = usedPerson.id;
    m.userData.type = 'partner';

    m.position.add(meshOffset);

    renderer.addObject(meshId, m, true, parent);

    const dataGroup = addDataToMesh(m);
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
      m.clear();
      renderer.removeObject(meshId);
      labelText.remove(null, dataGroup);
    };
  }, [renderer, person, parent, foreground, text, offsetY, offsetZ]);

  return null;
};

export default Partner;
