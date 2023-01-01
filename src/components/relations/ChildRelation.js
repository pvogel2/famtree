import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, BufferAttribute, LineBasicMaterial, Color } from 'three';
import RenderContext from '../RenderContext.js';
// import { getMesh } from '../../lib/nodes/utils';

function getRelationLines(s, t, config = { foreground, highlight }) {
  const foreColor = new Color(config.foreground);
  const highColor = new Color(config.highlight);
  const material = new LineBasicMaterial({
    vertexColors: true,
  });    

  const points = [];
  const colors= [];

  const dy = t.y - s.y;
  const dz = t.z - s.z;

  points.push(s.clone());
  colors.push(...foreColor.toArray());
  if (dz !== 0) {
    points.push(s.clone().add(new Vector3(0, dy * 0.5, 0)));
    points.push(t.clone().sub(new Vector3(0, dy * 0.5, 0)));
    colors.push(...foreColor.toArray());
    colors.push(...foreColor.toArray());
  } else {
    points.push(t.clone().sub(new Vector3(0, dy * 0.5, 0)));
    colors.push(...foreColor.toArray());
  }
  points.push(t.clone().sub(new Vector3(0, 1.2, 0)));
  colors.push(...highColor.toArray());

  const geometry = new BufferGeometry().setFromPoints( points );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  return new Line( geometry, material );
}

const getForeground = (state) => state.layout.foreground;

function ChildRelation(props) {
  const foreground = useSelector(getForeground);
  const { highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;
    const target = new Vector3(targetX, targetY, targetZ);
    const source = new Vector3(sourceX, sourceY, sourceZ);

    const lines = getRelationLines(source, target, { foreground, highlight });
    parent.add(lines);
    /* const relationNode = getMesh({ foreground: '#00ff00'});
    const sourceNode = getMesh({ foreground: '#006600'});
    sourceNode.position.set(sourceX, sourceY, sourceZ);
    relationNode.position.x += 1.5;
    parent.add(relationNode);
    parent.add(sourceNode);
    */


    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight]);

  return null;
};

export default ChildRelation;