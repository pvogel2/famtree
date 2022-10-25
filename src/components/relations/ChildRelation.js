import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, LineBasicMaterial, Color } from 'three';
import RenderContext from '../RenderContext.js';

function getRelationLines(s, t, config = { color: 0xffffff }) {
  const material = new LineBasicMaterial({
    color: new Color(config.color),
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

const getForeground = (state) => state.layout.foreground;

function ChildRelation(props) {
  const { sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);
  const foreground = useSelector(getForeground);

  useEffect(() => {
    if (!renderer || !parent) return;
    const target = new Vector3(targetX, targetY, targetZ);
    const source = new Vector3(sourceX, sourceY, sourceZ);

    const lines = getRelationLines(source, target, { color: foreground });
    parent.add(lines);
    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground]);

  return null;
};

export default ChildRelation;