import { useRef, useEffect, useState } from '@wordpress/element';
import { AmbientLight, DirectionalLight } from 'three';
import { Renderer } from '../lib/Renderer.js';
import RenderContext from './RenderContext.js';

function RenderProvider(props) {
  const { instanceId = 'famtree0' } = props;
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
    newRenderer.addAxes(3);

    const ambientLight = new AmbientLight( 0xFFFFFF, 1 );
    const directionalLight = new DirectionalLight(0xFFFFFF, 2);
    directionalLight.position.set(10, 10, 0);
    directionalLight.rotation.set(0, 0, 0.5 * Math.PI);
    newRenderer.three.scene.add( ambientLight );
    newRenderer.three.scene.add( directionalLight );

    setRenderer(newRenderer);
  }, [renderer, rendererId]);

  const style = {left: 0, top: 0, bottom: 0, right: 0, position: 'absolute'};

  return (<RenderContext.Provider value={ { renderer, renderTarget } }>
      <div style={ style } id={ rendererId } ref={ renderTarget }></div>
      { props.children }
    </RenderContext.Provider>
  );
}

export default RenderProvider;

