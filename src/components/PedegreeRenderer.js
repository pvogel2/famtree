import React, { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Color, Vector2 } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import RenderContext from './RenderContext.js';
import Node from './Node';
import Metadata from './Metadata';

let setteled = false;

const getBackground = (state) => state.layout.background;
const getSelectedPerson = (state) => state.selectedPerson.person;
const getCurrentMetadata = (state) => state.selectedPerson.metadata;


function PedegreeRenderer() {
  const { renderer } = useContext(RenderContext);

  const root = useSelector((state) => {
    const fId = state.founder;

    return state.persons.find((p) => p.id === fId);
  });

  const selectedPerson = useSelector(getSelectedPerson);
  const currentMetadata = useSelector(getCurrentMetadata);
  const background = useSelector(getBackground);

  useEffect(() => {
    if (renderer) {
      renderer.three.renderer.setClearColor( new Color(background), 1);
    }
  }, [renderer, background]);

  if (!renderer) {
    return null;
  }

  if (!setteled) {
    const grid = renderer.addGrid(20, 20);
    grid.material.opacity = 0.1;
    grid.rotation.z = Math.PI * 0.5;
    renderer.start();
    setteled = true;

    const renderScene = new RenderPass( renderer.three.scene, renderer.three.camera );
    const bloomPass = new UnrealBloomPass( new Vector2( renderer.width, renderer.height ), 1.5, 0.4, 0.85 );

    bloomPass.threshold = 0; // params.bloomThreshold;
    bloomPass.strength = 1; // params.bloomStrength;
    bloomPass.radius = 3; // params.bloomRadius;

    const composer = new EffectComposer( renderer.three.renderer );
    composer.addPass( renderScene );
    composer.addPass( bloomPass );
    renderer.setComposer(composer);
  }

  return (
    <>
    <Node person={ root }/>
    { (selectedPerson && currentMetadata.length ) &&  <Metadata selectedPerson={ selectedPerson } currentMeta={ currentMetadata }/> }
    </>
  );
};

export default PedegreeRenderer;
