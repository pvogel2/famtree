import { useEffect, useContext } from '@wordpress/element';
import { Mesh, Group, TorusGeometry, MeshBasicMaterial } from 'three';
import RenderContext from './../RenderContext.js';

const NODE_SIZE = 6;

function getRelationSymbol() {
  const material = new MeshBasicMaterial( { color: 0xe5b80b } );

  const geometry = new TorusGeometry(0.3, 0.05, 8, 24);
  const group = new Group();

  const ring1 = new Mesh( geometry, material );
  const ring2 = new Mesh( geometry, material );
  ring1.position.set(0, 0, 0.25);
  ring2.position.set(0, 0, -0.25);
  ring1.rotateX(Math.PI * 0.5);
  ring2.rotateY(Math.PI * 0.5);
  group.add(ring1);
  group.add(ring2);
 return group;
}

function RelationSymbol(props) {
  const { type, end, parent, targetX, targetY, targetZ } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const symbol = getRelationSymbol();
    parent.add(symbol);
    renderer.registerEventCallback('render', (data) => {
        symbol.rotation.z = (symbol.rotation.z + 0.005) % (2 * Math.PI);
    });
    symbol.position.set(targetX, targetY, targetZ + 0.5 * NODE_SIZE);
    return () => {
      parent.remove(symbol);
    };
  }, [renderer, parent, type, end, targetX, targetY, targetZ]);

  return null;
};

export default RelationSymbol;
