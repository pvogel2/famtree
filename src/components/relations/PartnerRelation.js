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

  const tCyl = s.clone();
  tCyl.theta += t.theta;
  tCyl.y += t.y;
  const sV3 = new Vector3().setFromCylindrical(s);

  colors.push(...startColor.toArray());
  colors.push(...foreColor.toArray());
  colors.push(...foreColor.toArray());
  colors.push(...endColor.toArray());

  const curveGroup = new Group();

  const groupRotation = new Euler();
  groupRotation.x = Math.PI * -0.5;
  groupRotation.z = Math.PI * -0.5;
  curveGroup.rotation.copy(groupRotation);
  curveGroup.position.copy(sV3).negate().add(new Vector3(0, 0 + config.offset.y, 0));

  const curve = new EllipseCurve(
    sV3.x,  sV3.y,            // ax, aY
    5, 5,           // xRadius, yRadius
    s.theta,  tCyl.theta,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0               // aRotation
  );

  const nPoints = Math.ceil((tCyl.theta - s.theta) / 0.25) * 8;
  const cPoints = curve.getPoints(nPoints);
  const geometry = new BufferGeometry().setFromPoints( cPoints );
  geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  curveGroup.add(new Line( geometry, material ));config.offset.y

  const start = curve.getPoint(0);
  const end = curve.getPoint(1);

  const offsetBase = 1.2 - config.offset.y;
  const offsetUp = config.offset.y - 1.2;
  points.push(new Vector3(start.x, start.y, offsetBase));
  points.push(new Vector3(start.x, start.y, offsetBase).add(new Vector3(0, 0, offsetUp)));
  points.push(new Vector3(end.x, end.y, offsetBase).add(new Vector3(0, 0, offsetUp)));
  points.push(new Vector3(end.x, end.y, offsetBase));

  const lGeometry = new BufferGeometry().setFromPoints( points );
  lGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  curveGroup.add(new LineSegments( lGeometry, material ));

  return curveGroup;
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