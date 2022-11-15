import { Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, TextureLoader } from 'three';
import { useContext } from 'react';

import RenderContext from './RenderContext.js';
import pdfImage from './../assets/images/pdf.jpg';
import videoImage from './../assets/images/video.jpg';
import textImage from './../assets/images/txt.jpg';
import unknownImage from './../assets/images/file.jpg';

const textureLoader = new TextureLoader();
// const imageLoader = new ImageLoader();

function MetaThumb(props) {
  const {
    parent,
    metadata,
    position,
  } = props;

  const { renderer } = useContext(RenderContext);
  const options = { color: '#ffffff', side: DoubleSide };

  if (metadata.mimetype.startsWith('image')) {
    options.map = textureLoader.load(metadata.thumbnail);
  } else if (metadata.mimetype === 'application/pdf') {
    options.map = textureLoader.load(pdfImage);
  } else if (metadata.mimetype.includes('text')) {
    options.map = textureLoader.load(textImage);
  } else if (metadata.mimetype.startsWith('video')) {
    options.map = textureLoader.load(videoImage);
  } else {
    options.map = textureLoader.load(unknownImage);
  }

  const g = new PlaneGeometry(1, 1);
  const m = new MeshBasicMaterial(options);
  const p = new Mesh(g, m);
  const metadataId = `metadata${metadata.id}`; 
  if (position) {
    p.position.copy(position);
  }
  p.rotateY(Math.PI * 0.5);

  p.userData.name = metadataId;
  p.userData.id = metadata.id;
  p.userData.type = 'metaimage';

  renderer.addObject(metadataId, p, true, parent);

  return null;
}

export default MetaThumb;
