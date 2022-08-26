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
  const { person, parent, offset } = props;

  const foreground = useSelector(getForeground);
  const text = useSelector(getText);

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
  }, [renderer, person, offset, parent, foreground, text]);

  return null;
};

export default Partner;
