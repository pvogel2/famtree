import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical, Euler, EllipseCurve, LineSegments,
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

  const group = new Group();

  const points = [];
  const colors = [];

  colors.push(...foreColor.toArray());
  colors.push(...foreColor.toArray());

  colors.push(...foreColor.toArray());
  colors.push(...highColor.toArray());

  const vOffset = new Vector3().setFromCylindrical(new Cylindrical(config.offset.radius, config.offset.theta, 0));
  const start = (new Vector3().setFromCylindrical(new Cylindrical(s.radius, s.theta, s.y))).sub(vOffset);
  const end = (new Vector3().setFromCylindrical(new Cylindrical(t.radius, t.theta, 0))).sub(vOffset);

  points.push(start.clone()); // .add(new Vector3(0, s.y, 0)));
  points.push(start.clone().add(new Vector3(0, 6 - 2 - s.y, 0)));

  points.push(end.clone().add(new Vector3(0, 4, 0)));
  points.push(end.clone().add(new Vector3(0, 4.5, 0)));

  const lsGeometry = new BufferGeometry().setFromPoints( points );
  lsGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  group.add(new LineSegments( lsGeometry, material ));

  const cGroup = new Group();
  cGroup.position.sub(vOffset).add(new Vector3(0, 4, 0));
  cGroup.rotateX(Math.PI * -0.5);
  const startCyl = s.theta; //  - config.offset.theta;
  const endCyl = t.theta; //  - config.offset.theta;
  const curve = new EllipseCurve(
    0,  0,             // ax, aY
    5, 5,              // xRadius, yRadius
    startCyl,  endCyl, // aStartAngle, aEndAngle
    startCyl > endCyl, // aClockwise
    -Math.PI * 0.5     // aRotation
  );

  const nPoints = Math.abs(Math.ceil((endCyl - startCyl) / 0.25)) * 8;

  const cPoints = curve.getPoints(nPoints);
  const lGeometry = new BufferGeometry().setFromPoints( cPoints );

  cGroup.add(new Line( lGeometry, material ));
  group.add(cGroup);
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
      const offset = new Cylindrical().setFromVector3(v2);

      const source = new Cylindrical(sourceX, sourceY, sourceZ);
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