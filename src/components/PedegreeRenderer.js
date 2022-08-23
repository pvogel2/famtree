import React, { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Color } from 'three';

import RenderContext from './RenderContext.js';
import Node from './Node';

let setteled = false;

function PedegreeRenderer(props) {
  const { renderer } = useContext(RenderContext);
  const { background = '#000000' } = props;

  const root = useSelector((state) => {
    const configured = state.persons.find((p) => p.root);
    if (configured) {
      return configured;
    }
    return state.persons[0];
  });

  useEffect(() => {
    if (renderer) {
      renderer.three.renderer.setClearColor( new Color(background), 0.5);
    }
  }, [renderer, background]);

  if (!renderer) {
    return null;
  }

  if (!setteled) {
    // renderer.addAxes(10);
    const grid = renderer.addGrid(20, 20);
    grid.rotation.z = Math.PI * 0.5;
    renderer.start();
    setteled = true;
  }

  return (
  <>
    <Node person={ root }/>
  </>
  );
};

export default PedegreeRenderer;
