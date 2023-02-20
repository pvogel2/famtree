import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RenderContext from './RenderContext.js';
import MetaThumb from './MetaThumb.js';
import MetadataRelation from './relations/MetadataRelation';
import {getAssetsGroup } from './../lib/nodes/utils.js';
import { loadMetadata } from '../lib/Connect.js';
import { setMetadata } from '../store/selectedPersonReducer';



import { Vector3 } from 'three';


const getCurrentMetadata = (state) => state.selectedPerson.metadata;

function Metadata(props) {
  const {
    selectedPerson,
//    currentMeta,
  } = props;

  const { renderer } = useContext(RenderContext);
  const dispatch = useDispatch();
  const currentMeta = useSelector(getCurrentMetadata);
  const currentId = selectedPerson?.id;

  useEffect(() => {
    if (!currentId) return;

    async function loadCurrentMetadata() {
      const metadata = await loadMetadata(currentId);
      dispatch(setMetadata([...metadata]));
    };
    loadCurrentMetadata();

    return () => {
      dispatch(setMetadata([]));
    };
  },[currentId]);

  if (!currentId || !currentMeta.length) {
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
