import { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { Vector3, Line, BufferGeometry, BufferAttribute, LineBasicMaterial, Color } from 'three';
import RenderContext from '../RenderContext.js';
import getModule from './../../lib/nodes/layout3D';
import { getMesh } from './../../lib/nodes/utils';

const renderModule = getModule();

function getRelationLines(s, c, t, nRelations, config = { foreground, highlight }) {
  const foreColor = new Color(config.foreground);
  const highColor = new Color(config.highlight);
  const material = new LineBasicMaterial({
    vertexColors: true,
  });    

  const { points, colors } = renderModule.getChildLines(s, c, t, nRelations, { highColor, foreColor });

  const geometry = new BufferGeometry().setFromPoints( points );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  return new Line( geometry, material );
}

const getForeground = (state) => state.layout.foreground;

function ChildRelation(props) {
  const foreground = useSelector(getForeground);
  const { nRelations = 1, highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent, maxSize = 0 } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;
    const target = new Vector3(targetX, targetY, targetZ);
    const source = new Vector3(sourceX, sourceY, sourceZ);

    const lines = getRelationLines(source, maxSize, target, nRelations, { foreground, highlight });
    const sMesh = getMesh({ radius: 0.2 });
    const tMesh = getMesh({ radius: 0.2 });
    parent.add(lines);
    parent.add(sMesh);
    parent.add(tMesh);
    sMesh.position.set(sourceX, sourceY, sourceZ);
    tMesh.position.set(targetX, targetY, targetZ);
    /* const relationNode = getMesh({ foreground: '#00ff00'});
    const sourceNode = getMesh({ foreground: '#006600'});
    sourceNode.position.set(sourceX, sourceY, sourceZ);
    relationNode.position.x += 1.5;
    parent.add(relationNode);
    parent.add(sourceNode);
    */


    return () => {
      parent.remove(sMesh);
      parent.remove(tMesh);
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight, maxSize]);

  return null;
};

export default ChildRelation;