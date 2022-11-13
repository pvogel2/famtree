import React, { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Color } from 'three';

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
    renderer.addAxes(10);
    const grid = renderer.addGrid(20, 20);
    grid.material.opacity = 0.1;
    grid.rotation.z = Math.PI * 0.5;
    renderer.start();
    setteled = true;
  }

  return (
    <>
    <Node person={ root }/>
    { (selectedPerson && currentMetadata.length ) &&  <Metadata selectedPerson={ selectedPerson } currentMeta={ currentMetadata }/> }
    </>
  );
};

export default PedegreeRenderer;
