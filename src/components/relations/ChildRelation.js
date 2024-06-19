import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical } from 'three';
import RenderContext from './../RenderContext.js';
import LayoutContext from './../LayoutContext.js';

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
  const { foreground } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
    }
  });

  const { highlight = foreground, sourceX = 0, sourceY = 0, sourceZ = 0, targetX = 0, targetY = 0, targetZ = 0, parent } = props;
  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);

  useEffect(() => {
    if (!renderer || !parent) return;

    const source = Layout.getVector(sourceX, sourceY, sourceZ);
    const target = Layout.getVector(targetX, targetY, targetZ);
    const lines = Layout.getChildLines(source, target, { foreground, highlight, parent });
    parent.add(lines);

    return () => {
      parent.remove(lines);
    };
  }, [renderer, sourceX, sourceY, sourceZ, targetX, targetY, targetZ, parent, foreground, highlight, Layout]);

  return null;
};

export default ChildRelation;