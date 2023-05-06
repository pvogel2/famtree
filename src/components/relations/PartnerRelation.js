import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, BufferAttribute, LineBasicMaterial, Color } from 'three';
import RenderContext from './../RenderContext.js';
import getModule from './../../lib/nodes/layout3D';

const renderModule = getModule();

function getRelationLines(s, t, config = { foreground, highstart, highend, offset: new Vector3() }) {
  const foreColor = new Color(config.foreground);
  const startColor = new Color(config.highstart);
  const endColor = new Color(config.highend);

  const material = new LineBasicMaterial({
    vertexColors: true,
  });

  const { points, colors } = renderModule.getRelationLines(s, t, config.offset, { startColor, foreColor, endColor});

  const geometry = new BufferGeometry().setFromPoints( points );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  return new Line( geometry, material );
}

const getForeground = (state) => state.layout.foreground;

function PartnerRelation(props) {
  const foreground = useSelector(getForeground);
  const { highstart = foreground, highend = foreground, targetX = 0, targetY = 0, targetZ = 0, parent, offsetX = 0, offsetY = 0, offsetZ = 0 } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;
    const s = new Vector3();
    const target = new Vector3(targetX, targetY, targetZ);
    const offset = new Vector3(offsetX, offsetY, offsetZ);

    const lines = getRelationLines(s, target, { foreground, highstart, highend, offset });
    parent.add(lines);
    return () => {
      parent.remove(lines);
    };
  }, [renderer, parent, targetX, targetY, targetZ, offsetX, offsetY, offsetZ, foreground, highstart, highend]);

  return null;
};

export default PartnerRelation;