import React, { useContext } from 'react';
import { useSelector } from 'react-redux';

import RenderContext from './RenderContext.js';
import Node from './Node';

let setteled = false;

function PedegreeRenderer() {
  const { renderer } = useContext(RenderContext);

  const root = useSelector((state) => {
    const configured = state.persons.find((p) => p.root);
    if (configured) {
      return configured;
    }
    return state.persons[0];
  });

  if (!renderer) {
    return null;
  }

  if (!setteled) {
    renderer.addAxes(10);
    const grid = renderer.addGrid(20, 20);
    grid.rotation.z = Math.PI * 0.5;
    renderer.start();
  }

  setteled = true;

  return (
  <>
    <Node person={ root }/>
  </>
  );
};

export default PedegreeRenderer;
