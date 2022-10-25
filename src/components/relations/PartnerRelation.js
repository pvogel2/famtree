import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, LineBasicMaterial, Color } from 'three';
import RenderContext from './../RenderContext.js';

function getRelationLines(s, t, config = { color: 0xffffff, offset: new Vector3() }) {
  const material = new LineBasicMaterial({
    color: new Color(config.color),
  });

  const points = [];
  points.push(s.clone());
  points.push(s.clone().add(new Vector3(0, 2, 0)).add(config.offset));
  points.push(t.clone().add(new Vector3(0, 2, 0)).add(config.offset));
  points.push(t.clone());

  const geometry = new BufferGeometry().setFromPoints( points );
  return new Line( geometry, material );
}

const getForeground = (state) => state.layout.foreground;

function PartnerRelation(props) {
  const { source, targetX = 0, targetY = 0, targetZ = 0, parent, offsetX = 0, offsetY = 0, offsetZ = 0 } = props;
  const { renderer } = useContext(RenderContext);
  const foreground = useSelector(getForeground);

  useEffect(() => {
    if (!renderer || !parent) return;
    const s = source ? source.clone() : new Vector3();
    const target = new Vector3(targetX, targetY, targetZ);
    const offset = new Vector3(offsetX, offsetY, offsetZ);

    const lines = getRelationLines(s, target, { color: foreground, offset });
    parent.add(lines);
    return () => {
      parent.remove(lines);
    };
  }, [renderer, source, parent, targetX, targetY, targetZ, offsetX, offsetY, offsetZ, foreground]);

  return null;
};

export default PartnerRelation;