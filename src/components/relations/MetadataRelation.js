import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, LineSegments, BufferGeometry, LineBasicMaterial, Color } from 'three';
import RenderContext from '../RenderContext.js';

function getRelationLines(s, t, config = { foreground, highlight }) {
  const highColor = new Color(config.highlight);
  const material = new LineBasicMaterial({
    color: highColor,
  });    

  const points = [];
  const frame = 0.2;

  const t0 = new Vector3(t.x, t.y + frame, t.z + frame);
  const t1 = new Vector3(t.x, -t.y - frame, t.z + frame);
  points.push(s.clone());
  points.push(s.clone().add(new Vector3(0, 0, -0.3)));

  points.push(s.clone().add(new Vector3(0, 0, -0.3)));
  points.push(s.clone().add(new Vector3(t.x, 0, -0.3)));

  points.push(t0.clone());
  points.push(t1.clone());

  points.push(t0.clone());
  points.push(t0.clone().add(new Vector3(0, 0, -frame * 2)));

  points.push(t1.clone());
  points.push(t1.clone().add(new Vector3(0, 0, -frame * 2)));

  const geometry = new BufferGeometry().setFromPoints( points );
  return new LineSegments( geometry, material );
}

const getLayout = (state) => state.layout;

function MetaRelation(props) {
  const { sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { foreground, selection } = useSelector(getLayout);
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;
    const target = new Vector3(targetX, targetY, targetZ);
    const source = new Vector3(sourceX, sourceY, sourceZ);

    const lines = getRelationLines(source, target, { foreground, highlight: selection });
    parent.add(lines);

    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, selection]);

  return null;
};

export default MetaRelation;