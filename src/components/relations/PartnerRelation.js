import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import RenderContext from './../RenderContext.js';
import LayoutContext from './../LayoutContext.js';

function getRelationLinesCyl(s, t, config = { foreground, highstart, highend, offset: new Cylindrical() }) {
  const foreColor = new Color(config.foreground);
  const startColor = new Color(config.highstart);
  const endColor = new Color(config.highend);

  const material = new LineBasicMaterial({
    vertexColors: true,
  });
  const points = [];
  const colors = [];
 
  colors.push(...startColor.toArray());
  colors.push(...foreColor.toArray());

  colors.push(...foreColor.toArray());
  colors.push(...endColor.toArray());

  // colors.push(...foreColor.toArray());
  // colors.push(...foreColor.toArray());

  const group = new Group();

  const vOffset = new Vector3().setFromCylindrical(new Cylindrical(config.offset.radius, config.offset.theta, 0));
  const start = (new Vector3().setFromCylindrical(new Cylindrical(s.radius, s.theta, 0))).sub(vOffset);
  const end = (new Vector3().setFromCylindrical(new Cylindrical(t.radius, t.theta, 0))).sub(vOffset);

  const offsetBase = 1.2;
  const offsetUp = config.offset.y;
  points.push(new Vector3().copy(start).add(new Vector3(0, offsetBase, 0)));
  points.push(new Vector3().copy(start).add(new Vector3(0, offsetUp, 0)));

  points.push(new Vector3().copy(end).add(new Vector3(0, offsetUp, 0)));
  points.push(new Vector3().copy(end).add(new Vector3(0, offsetBase, 0)));

  // points.push(new Vector3().copy(start).add(new Vector3(0, offsetUp, 0)));
  // points.push(new Vector3().copy(end).add(new Vector3(0, offsetUp, 0)));

  const lGeometry = new BufferGeometry().setFromPoints( points );
  lGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  group.add(new LineSegments( lGeometry, material ));

  const cGroup = new Group();
  cGroup.position.sub(vOffset).add(new Vector3(0, offsetUp, 0));
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
  const cGeometry = new BufferGeometry().setFromPoints( cPoints );

  cGroup.add(new Line( cGeometry, material ));
  group.add(cGroup);

  return group;
}

function PartnerRelation(props) {
  const { foreground, treeLayout } = useSelect((select) => {
    const store = select('famtree/runtime');
    return {
      foreground: store.getForeground(),
    }
  });

  const { highstart = foreground, highend = foreground, targetX = 0, targetY = 0, targetZ = 0, parent, offsetX = 0, offsetY = 0, offsetZ = 0 } = props;
  const { renderer } = useContext(RenderContext);
  const Layout = useContext(LayoutContext);


  useEffect(() => {
    if (!renderer || !parent) return;

    const offset = Layout.getVector(offsetX, offsetY, offsetZ);
    const target = Layout.getVector(targetX, targetY, targetZ);
    const lines = Layout.getPartnerLines(offset, target, { foreground, highstart, highend });

    parent.add(lines);

    return () => {
      parent.remove(lines);
    };
  }, [renderer, parent, targetX, targetY, targetZ, offsetX, offsetY, offsetZ, foreground, highstart, highend, Layout]);
      
  return null;
};

export default PartnerRelation;