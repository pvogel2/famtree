import { useEffect, useContext } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Vector3, Cylindrical } from 'three';
import RenderContext from './../RenderContext.js';
import LayoutContext from './../LayoutContext.js';

function getRelationLinesCyl(s, t, config = { foreground, highlight }) {
  const foreColor = new Color(config.foreground);
  const highColor = new Color(config.highlight);
  const material = new LineBasicMaterial({
    vertexColors: true,
  });    

  const sV3 = new Vector3().setFromCylindrical(s);
  sV3.z -= 5;
  
  const tV3 = new Vector3().setFromCylindrical(t);
  tV3.z -= 5;
  
  const geometry = new SphereGeometry( 0.25, 32, 16 ); 
  const smaterial = new MeshBasicMaterial( { color: 0xff0000 } ); 
  const ematerial = new MeshBasicMaterial( { color: 0x00ff00 } ); 
  const startSphere = new Mesh( geometry, smaterial );
  startSphere.position.copy(sV3);
  const group = new Group();
  group.add(startSphere);

  const v= new Vector3();

  const endSphere = new Mesh( geometry, ematerial );
  endSphere.position.copy(tV3);
  group.add(endSphere);

  const points = [];
  const colors = [];

  points.push(tV3.clone().add(new Vector3(0, -1.5, 0)));
  points.push(tV3.clone().add(new Vector3(0, -2, 0)));
  // colors.push(...foreColor.toArray());
  // colors.push(...foreColor.toArray());

  points.push(sV3.clone());
  points.push(sV3.clone().add(new Vector3(0, 2, 0)));
  // colors.push(...foreColor.toArray());
  // colors.push(...highColor.toArray());

  const lsGeometry = new BufferGeometry().setFromPoints( points );
  // lsGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
  group.add(new LineSegments( lsGeometry, material ));

  const cGroup = new Group();
  const groupRotation = new Euler();
  groupRotation.x = Math.PI * -0.5;
  groupRotation.z = Math.PI * -0.5;
  cGroup.rotation.copy(groupRotation);
  //cGroup.position.copy(sV3).negate();//.add(new Vector3(0, dy, 0));
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