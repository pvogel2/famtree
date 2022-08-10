import { useEffect, useContext } from 'react';
import { Vector3, Line, BufferGeometry, LineBasicMaterial } from 'three';
import RenderContext from './../RenderContext.js';

function getRelationLines(s, t) {
  const material = new LineBasicMaterial({
    color: 0x9999ff,
  });

  const points = [];
  points.push(s.clone());
  points.push(s.clone().add(new Vector3(0, 2, 0)));
  points.push(t.clone().add(new Vector3(0, 2, 0)));
  points.push(t.clone());

  const geometry = new BufferGeometry().setFromPoints( points );
  return new Line( geometry, material );
}

function PartnerRelation(props) {
  const { source, target, parent } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !target || !parent) return;
    const s = source ? source.clone() : new Vector3();

    const lines = getRelationLines(s, target);
    parent.add(lines);
  }, [renderer, source, target, parent]);

  return null;
};

export default PartnerRelation;