import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical, Euler, EllipseCurve, LineSegments,
  SphereGeometry, Mesh, MeshBasicMaterial,
  Group, Line, BufferGeometry, BufferAttribute, LineBasicMaterial, Color } from 'three';
import RenderContext from '../RenderContext.js';

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
  points.push(t.clone().sub(new Vector3(0, 1.5, 0)));
  colors.push(...highColor.toArray());

  const geometry = new BufferGeometry().setFromPoints( points );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  return new Line( geometry, material );
}

function getRelationLinesCyl(s, t, config = { foreground, highlight, offset }) {
  const foreColor = new Color(config.foreground);
  const highColor = new Color(config.highlight);
  const material = new LineBasicMaterial({
    vertexColors: true,
  });    

  const sV3 = new Vector3().setFromCylindrical(s);
  sV3.z -= 5;
  
  const tV3 = new Vector3().setFromCylindrical(t);
  tV3.z -= 5;

  const group = new Group();
  /* const geometry = new SphereGeometry( 0.25, 32, 16 ); 
  const smaterial = new MeshBasicMaterial( { color: 0xff0000 } ); 
  const ematerial = new MeshBasicMaterial( { color: 0x00ff00 } ); 
  const startSphere = new Mesh( geometry, smaterial );
  startSphere.position.copy(sV3);
  
  group.add(startSphere);

  const endSphere = new Mesh( geometry, ematerial );
  endSphere.position.copy(tV3);
  group.add(endSphere); */

  const points = [];
  const colors = [];

  // points.push(tV3.clone().add(new Vector3(0, -1.5, 0)));
  // points.push(tV3.clone().add(new Vector3(0, -2, 0)));
  // colors.push(...foreColor.toArray());
  // colors.push(...foreColor.toArray());

  // points.push(sV3.clone());
  // points.push(sV3.clone().add(new Vector3(0, 2, 0)));
  // colors.push(...foreColor.toArray());
  // colors.push(...highColor.toArray());
  console.log(config.offset);
  const vOffset = new Vector3().setFromCylindrical(new Cylindrical(config.offset.radius, config.offset.theta, 0));
  const start = (new Vector3().setFromCylindrical(new Cylindrical(s.radius, s.theta, 0))).sub(vOffset);
  const end = (new Vector3().setFromCylindrical(new Cylindrical(t.radius, t.theta, 0))).sub(vOffset);

  points.push(start.clone());
  points.push(end.clone());

  const lsGeometry = new BufferGeometry().setFromPoints( points );
  // lsGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  group.add(new LineSegments( lsGeometry, material ));

  /* const cGroup = new Group();
  const groupRotation = new Euler();
  groupRotation.x = Math.PI * -0.5;
  groupRotation.z = Math.PI * -0.5;
  cGroup.rotation.copy(groupRotation);
  cGroup.position.copy(sV3).negate();//.add(new Vector3(0, dy, 0));
  cGroup.position.y = 4;
  cGroup.position.z = -5;

  const curve = new EllipseCurve(
    0,  0,            // ax, aY
    5, 5,           // xRadius, yRadius
    s.theta,  t.theta,  // aStartAngle, aEndAngle
    s.theta > t.theta,            // aClockwise
    0               // aRotation
  );
  const nPoints = Math.abs(Math.ceil((t.theta - s.theta) / 0.25)) * 8;

  // const cPoints = curve.getPoints(nPoints);
  const lGeometry = new BufferGeometry().setFromPoints( cPoints );

  cGroup.add(new Line( lGeometry, material ));
  group.add(cGroup); */
  return group;
}

function ChildRelation(props) {
  const { foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
      treeLayout: store.getTreeLayout(),
    }
  });

  const { highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    let lines;
    if (treeLayout === 'rounded') {
      const v2 = new Vector3();
      parent.getWorldPosition(v2);  
      const source = new Cylindrical().setFromVector3(v2);

      const offset = new Cylindrical(sourceX, sourceY, sourceZ);
      const target = new Cylindrical(targetX, targetY, targetZ);
      lines = getRelationLinesCyl(source, target, { foreground, highlight, offset });
      parent.add(lines);
    } else {
      const target = new Vector3(targetX, targetY, targetZ);
      const source = new Vector3(sourceX, sourceY, sourceZ);

      lines = getRelationLines(source, target, { foreground, highlight });
      parent.add(lines);
    }

    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight, treeLayout]);

  return null;
};

export default ChildRelation;