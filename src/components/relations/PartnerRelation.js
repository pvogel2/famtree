import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Line, BufferGeometry, BufferAttribute, LineBasicMaterial, Color } from 'three';
import RenderContext from './../RenderContext.js';

function getRelationLines(s, t, config = { foreground, highstart, highend, offset: new Vector3() }) {
  const foreColor = new Color(config.foreground);
  const startColor = new Color(config.highstart);
  const endColor = new Color(config.highend);

  const material = new LineBasicMaterial({
    vertexColors: true,
  });

  const points = [];
  const colors = [];

  points.push(s.clone().add(new Vector3(0, 1.2, 0)));
  points.push(s.clone().add(config.offset));
  points.push(t.clone().add(config.offset));
  points.push(t.clone().add(new Vector3(0, 1.2, 0)));

  colors.push(...startColor.toArray());
  colors.push(...foreColor.toArray());
  colors.push(...foreColor.toArray());
  colors.push(...endColor.toArray());

  const geometry = new BufferGeometry().setFromPoints( points );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  return new Line( geometry, material );
}

function PartnerRelation(props) {
  const { foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
    }
  });

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