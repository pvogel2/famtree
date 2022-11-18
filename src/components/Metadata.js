import { useContext } from 'react';

import RenderContext from './RenderContext.js';
import MetaThumb from './MetaThumb.js';
import MetadataRelation from './relations/MetadataRelation';
import {getAssetsGroup } from './../lib/nodes/utils.js';

import { Vector3 } from 'three';

function Metadata(props) {
  const {
    selectedPerson,
    currentMeta,
  } = props;

  const { renderer } = useContext(RenderContext);


  if (!selectedPerson || !currentMeta.length) {
    return null;
  }

  const rowsOffset = 0.5 * Math.floor(currentMeta.length / 3);
  const node = renderer.getObject(`person${selectedPerson.id}`);
  const assetsGroup = getAssetsGroup(node.obj);

  const thumbSize = 1;
  const offsetZ = -1.7;

  const rows = Math.ceil(currentMeta.length / 3);
  const cols = Math.min(3, currentMeta.length);
  const width = cols * thumbSize + Math.max(cols - 1, 0) * 0.1;
  const height = rows * thumbSize + Math.max(rows - 1, 0) * 0.1;

  const metaImages = currentMeta.map((md, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    return (
    <MetaThumb
      key={ md.id }
      size={ thumbSize }
      position={ new Vector3(1, (rowsOffset - row) * 1.1, offsetZ - thumbSize * 0.5 - col * 1.1) }
      parent={ assetsGroup }
      metadata={ md }
    />);
  });

  return (
    <>
      { metaImages }
      <MetadataRelation
        parent={ assetsGroup }
        width={ width }
        height={ height }
      />
    </>
  );
};

export default Metadata;
