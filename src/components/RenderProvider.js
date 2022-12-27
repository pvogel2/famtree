import React, { useRef, useEffect, useState } from 'react';
import { AmbientLight } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Renderer } from '../lib/Renderer.js';
import RenderContext from './RenderContext.js';

const gltfLoader = new GLTFLoader();

function RenderProvider(props) {
  const { instanceId = 'famtree_instance0' } = props;
  const [renderer, setRenderer] = useState(null);
  const renderTarget = useRef(null);
  const rendererId = `${instanceId}renderer`;

  useEffect(() => {
    if (renderer || !rendererId) return;

    const newRenderer = new Renderer({
      fov: 45,
      cameraNear: 0.01,
      cameraFar: 5000,
      control: true,
      parentSelector: `#${rendererId}`,
    });

    newRenderer.setupLightsDone = true;

    const ambientLight = new AmbientLight( 0xFFFFFF, 1 );
    newRenderer.three.scene.add( ambientLight );

    newRenderer.three.gammaOutput = true;
    newRenderer.three.gammaFactor = 2.2;

    setRenderer(newRenderer);
  }, [renderer, rendererId]);

  const style = {left: 0, top: 0, bottom: 0, right: 0, position: 'absolute'};

  return (<RenderContext.Provider value={ { renderer, renderTarget, gltfLoader } }>
      <div style={ style } id={ rendererId } ref={ renderTarget }></div>
      { props.children }
    </RenderContext.Provider>
  );
}

export default RenderProvider;

