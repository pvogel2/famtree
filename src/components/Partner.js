import { useContext, useEffect } from 'react';
import RenderContext from './RenderContext.js';
import { Color, Vector3 } from 'three';

import Person from '../lib/Person';

import ThreeText from '../lib/three/Text';
import { getMesh, addDataToMesh } from '../lib/nodes/utils';

const partnerColor = new Color(0.5, 0.5, 0.5);

function Partner(props) {
  const { person, parent, offset } = props;

  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !person?.id) return;

    const usedPerson = new Person(person);
    const meshId = `partner${usedPerson.id}`;

    const m = getMesh();
    m.name = meshId;
    m.userData.id = usedPerson.id;
    m.material.color.copy(partnerColor);

    if (offset) {
      m.position.add(offset);
    }

    renderer.addObject(meshId, m, true, parent);

    const dataGroup = addDataToMesh(m);
    const text = new ThreeText({
      text: usedPerson.name,
      position: new Vector3(1, -1, 0),
      rotation: new Vector3(0, Math.PI * 0.5, 0),
      scale: 0.4
    });

    text.attach(null, dataGroup);
    text.textMesh.geometry.center();

    return () => {
      m.clear();
      renderer.removeObject(meshId);
      text.remove(null, dataGroup);
    };
  }, [renderer, person, offset, parent]);

  return null;
};

export default Partner;
