import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, LineBasicMaterial, Color } from 'three';
import RenderContext from './../RenderContext.js';

function getRelationLines(s, t, config = { color: 0xffffff }) {
  const material = new LineBasicMaterial({
    color: new Color(config.color),
  });

  const points = [];
  points.push(s.clone());
  points.push(s.clone().add(new Vector3(0, 2, 0)));
  points.push(t.clone().add(new Vector3(0, 2, 0)));
  points.push(t.clone());

  const geometry = new BufferGeometry().setFromPoints( points );
  return new Line( geometry, material );
}

const getForeground = (state) => state.layout.foreground;

function PartnerRelation(props) {
  const { source, target, parent } = props;
  const { renderer } = useContext(RenderContext);
  const foreground = useSelector(getForeground);

  useEffect(() => {
    if (!renderer || !target || !parent) return;
    const s = source ? source.clone() : new Vector3();

    const lines = getRelationLines(s, target, { color: foreground });
    parent.add(lines);
    return () => {
      parent.remove(lines);
    };
  }, [renderer, source, target, parent, foreground]);

  return null;
};

export default PartnerRelation;