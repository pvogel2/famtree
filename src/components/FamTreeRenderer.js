import { useEffect, useContext } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { Color, Vector3 } from 'three';

import RenderContext from './RenderContext.js';
import Node from './Node';
import Metadata from './Metadata';


function FamTreeRenderer() {
  const { renderer } = useContext(RenderContext);

  const { setSelected } = useDispatch('famtree/families');

  const { founderId, selected } = useSelect((select) => {
    const store = select( 'famtree/families' );
    return {
      founderId: store.getFounder(),
      selected: store.getSelected(),
    };
  });

  const root = useSelect(
    (select) => {
      return select( 'famtree/families' ).getPersons().find((p) => p.id === founderId);
    },
    [founderId]
  );

  const { background } = useSelect(
    (select) => {
      const state = select( 'famtree/runtime' );
      return {
        background: state.getBackground(),
      };
    }, [],
  );

  useEffect(() => {
    setSelected();

    if (root && renderer) {
      renderer.transition(new Vector3(), 1, new Vector3(30, 30, 30));
    }
  }, [renderer, root, setSelected]);

  useEffect(() => {
    if (renderer) {
      renderer.three.renderer.setClearColor( new Color(background), 1);
    }
  }, [renderer, background]);

  if (!renderer) {
    return null;
  }

  if (!renderer.running ) {
    // const grid = renderer.addGrid(20, 20);
    // grid.material.opacity = 0.1;
    // grid.rotation.z = Math.PI * 0.5;
    renderer.start();
  }
  return (
    <>
    <Node person={ root } />
    { (selected ) &&  <Metadata selectedPerson={ selected } /> }
    </>
  );
};

export default FamTreeRenderer;
