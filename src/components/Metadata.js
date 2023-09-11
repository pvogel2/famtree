import { useContext, useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Vector3 } from 'three';
import RenderContext from './RenderContext.js';
import MetaThumb from './MetaThumb.js';
import MetadataRelation from './relations/MetadataRelation';
import {getAssetsGroup } from './../lib/nodes/utils.js';
import { loadMetadata } from '../lib/Connect.js';


function Metadata() {
  const { renderer } = useContext(RenderContext);

  const { selectedPerson, currentMeta } = useSelect((select) => {
    const store = select( 'famtree/families' );
    return {
      selectedPerson: store.getSelected(),
      currentMeta: store.getMetadata(),
    };
  });

  const currentId = selectedPerson?.id;
  const { setMetadata } = useDispatch('famtree/families');
     
  useEffect(() => {
    if (!currentId) return;

    async function loadCurrentMetadata() {
      const metadata = await loadMetadata(currentId);
      setMetadata(metadata);
    };
    loadCurrentMetadata();

    return () => {
      setMetadata();
    };
  },[currentId, setMetadata]);

  if (!currentId || !currentMeta?.length) {
    return null;
  }

  const maxCols = 2;
  const rows = Math.ceil(currentMeta.length / maxCols);
  const rowsOffset = 0.5 * (rows - 1);

  const node = renderer.getObject(`person${currentId}`);

  const assetsGroup = getAssetsGroup(node.obj);

  const thumbSize = 1;
  const offsetZ = -1.7;

  const cols = Math.min(maxCols, currentMeta.length);
  const width = cols * thumbSize + Math.max(cols - 1, 0) * 0.1;
  const height = rows * thumbSize + Math.max(rows - 1, 0) * 0.1;

  const metaImages = currentMeta.map((md, idx) => {
    const row = Math.floor(idx / maxCols);
    const col = idx % maxCols;
    return (
    <MetaThumb
      key={ md.id }
      size={ thumbSize }
      position={ new Vector3(0.5, (rowsOffset - row) * 1.1, offsetZ - thumbSize * 0.5 - col * 1.1) }
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
