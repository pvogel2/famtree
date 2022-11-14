import { Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, TextureLoader, ImageLoader } from 'three';
import { useContext } from 'react';

import RenderContext from './RenderContext.js';
import pdfImage from './../assets/images/pdf.jpg';

const textureLoader = new TextureLoader();
// const imageLoader = new ImageLoader();

function MetaThumb(props) {
  const {
    parent,
    metadata,
    idx,
  } = props;

  const { renderer } = useContext(RenderContext);
  const options = { color: '#ff7711', side: DoubleSide };

  if (metadata.mimetype.startsWith('image')) {
    const texture = textureLoader.load(metadata.thumbnail);
    options.map = texture;
    options.color = '#ffffff';
  }
  // imageLoader.load(metadata.original, (image) => { console.log(image.width, image.height);});
  if (metadata.mimetype === 'application/pdf' || metadata.mimetype.includes('text')) {
    const texture = textureLoader.load(pdfImage);
    options.map = texture;
    options.color = '#ffffff';
  }

  const g = new PlaneGeometry(1, 1);
  const m = new MeshBasicMaterial(options);
  const p = new Mesh(g, m);
  const metadataId = `metadata${metadata.id}`; 
  p.position.set(0.5, 0, -1 - idx * 1.1);
  p.rotateY(Math.PI * 0.5);

  p.userData.name = metadataId;
  p.userData.id = metadata.id;
  p.userData.type = 'metaimage';
  // parent.add(p);

  renderer.addObject(metadataId, p, true, parent);

  return null;
}

export default MetaThumb;
