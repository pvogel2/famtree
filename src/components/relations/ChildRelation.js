import { useEffect, useContext } from 'react';
import { Vector3, Line, BufferGeometry, LineBasicMaterial } from 'three';
import RenderContext from '../RenderContext.js';

function getRelationLines(s, t) {
  const material = new LineBasicMaterial({
    color: 0xff9999,
  });    

  const points = [];
  const dy = t.y - s.y;
  const dz = t.z - s.z;
  points.push(s.clone());
  if (dz !== 0) {
    points.push(s.clone().add(new Vector3(0, dy * 0.5, 0)));
    points.push(t.clone().sub(new Vector3(0, dy * 0.5, 0)));
  }
  points.push(t.clone());

  const geometry = new BufferGeometry().setFromPoints( points );
  return new Line( geometry, material );
}

function ChildRelation(props) {
  const { source, target, parent } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !target || !parent) return;
    const s = source ? source.clone() : new Vector3();

    const lines = getRelationLines(s, target);
    parent.add(lines);
    return () => {
      parent.remove(lines);
    };
  }, [renderer, source, target, parent]);

  return null;
};

export default ChildRelation;