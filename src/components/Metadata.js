import { useState, useEffect, useContext } from 'react';

import RenderContext from './RenderContext.js';
import MetaThumb from './MetaThumb.js';
import { getMesh, addDataToMesh } from './../lib/nodes/utils.js';
import { Vector3 } from 'three';

function Metadata(props) {
  const {
    selectedPerson,
    currentMeta,
  } = props;

  const [currentMesh, setCurrentMesh] = useState(null);

  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    let mesh = null;
    let dataGroup = null;

    if (renderer && selectedPerson) {
      let node = renderer.getObject(`node${selectedPerson.id}`);
      if (!node) {
        node = renderer.getObject(`partner${selectedPerson.id}`);
      }

      if (node) {
        mesh = getMesh({ foreground : '#ff0000', opacity: 0.3 });
        mesh.scale.set(1.3, 1.3, 1.3);
        dataGroup = addDataToMesh(node.obj);
        dataGroup.add(mesh);
        setCurrentMesh(mesh);
      }
    }

    return () => {
      if (mesh) {
        mesh.clear();
        dataGroup.remove(mesh);
      }
      // TODO: find better place
      currentMeta.forEach((m) => {
        renderer.removeObject(`metadata${m.id}`);
      });

      setCurrentMesh(null);
    };
  }, [selectedPerson, renderer, currentMeta]);

  if (!selectedPerson || !currentMesh || !currentMeta.length) {
    return null;
  }

  const rowsOffset = 0.5 * Math.floor(currentMeta.length / 3);
  const metaImages = currentMeta.map((md, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    return (
    <MetaThumb
      key={ md.id }
      position={ new Vector3(0.5, (rowsOffset - row) * 1.1, -1 - col * 1.1) }
      parent={ currentMesh }
      metadata={ md }
    />);
  });

  return metaImages;
};

export default Metadata;
