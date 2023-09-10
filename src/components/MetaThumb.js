import { Mesh, PlaneGeometry, MeshBasicMaterial, DoubleSide, TextureLoader, Vector3 } from 'three';
import { useEffect, useContext } from '@wordpress/element';

import RenderContext from './RenderContext.js';
import pdfImage from './../assets/images/pdf.jpg';
import videoImage from './../assets/images/video.jpg';
import textImage from './../assets/images/txt.jpg';
import unknownImage from './../assets/images/file.jpg';
import Transition from './../lib/Transition';

const textureLoader = new TextureLoader();
const DEFAULT_OPACITY = 0.75;

function MetaThumb(props) {
  const {
    parent,
    metadata,
    size = 1,
    position,
  } = props;

  const { renderer } = useContext(RenderContext);
  const options = { color: '#ffffff', side: DoubleSide };

  const g = new PlaneGeometry(size, size);
  const m = new MeshBasicMaterial(options);
  m.setValues({ transparent: true, opacity: DEFAULT_OPACITY });

  const p = new Mesh(g, m);
  p.scale.set(0, 0, 0);

  const metadataId = `metadata${metadata.id}`; 

  if (position) {
    p.position.copy(position);
  }
  p.rotateY(Math.PI * 0.5);

  p.userData.name = metadataId;
  p.userData.refId = metadata.id;
  p.userData.type = 'metaimage';
  p.scale.set(0, 0, 0);

  const onLoad = (texture) => {
    m.setValues({ map: texture });
    m.needsUpdate = true;

    const startScale = new Vector3();
    const endScale = new Vector3(1, 1, 1);
    const appearTransition = new Transition({
      duration: 0.15,
      curve: 'easeOutQuad',
      callback: (current) => {
        p.scale.lerpVectors(startScale, endScale, current);
      },
      onFinish: () => {
        renderer.unregisterEventCallback('render', appearTransition.update);
      },
  });
    renderer.registerEventCallback('render', appearTransition.update);
    appearTransition.forward();
  };

  if (metadata.mimetype.startsWith('image')) {
    textureLoader.load(metadata.thumbnail, onLoad);
  } else if (metadata.mimetype === 'application/pdf') {
     textureLoader.load(pdfImage, onLoad);
  } else if (metadata.mimetype.includes('text')) {
    textureLoader.load(textImage, onLoad);
  } else if (metadata.mimetype.startsWith('video')) {
    textureLoader.load(videoImage, onLoad);
  } else {
    textureLoader.load(unknownImage, onLoad);
  }

  useEffect(()=> {
    renderer.addObject(metadataId, p, true, parent);

    return () => {
      const op = m.opacity;
      const fadeTransition = new Transition({
        duration: 0.15,
        callback: (current) => {
          m.opacity = op * (1 - current);
        },
        onFinish: () => {
          renderer.removeObject(metadataId);
          renderer.unregisterEventCallback('render', fadeTransition.update);
        },
      });

      renderer.registerEventCallback('render', fadeTransition.update);
      fadeTransition.forward();
    };
  }, [metadataId]);

  return null;
}

export default MetaThumb;
