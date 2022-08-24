import { useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RenderContext from './RenderContext.js';
import { Color, Vector3 } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getMesh, addDataToMesh } from '../lib/nodes/utils';

const getForeground = (state) => state.layout.foreground;

function Partner(props) {
  const { person, parent, offset } = props;

  const foreground = useSelector(getForeground);

  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);
    const meshId = `partner${usedPerson.id}`;

    const partnerColor = new Color(foreground).multiplyScalar(0.75);
    const m = getMesh({ foreground: `#${partnerColor.getHexString()}` });

    m.name = meshId;
    m.userData.id = usedPerson.id;

    if (offset) {
      m.position.add(offset);
    }

    renderer.addObject(meshId, m, true, parent);

    const dataGroup = addDataToMesh(m);
    const text = new ThreeText({
      text: usedPerson.name,
      position: new Vector3(1, -1, 0),
      rotation: new Vector3(0, Math.PI * 0.5, 0),
      scale: 0.4,
      color: foreground,
    });

    text.attach(null, dataGroup);
    text.textMesh.geometry.center();

    return () => {
      m.clear();
      renderer.removeObject(meshId);
      text.remove(null, dataGroup);
    };
  }, [renderer, person, offset, parent, foreground]);

  return null;
};

export default Partner;
