import { Cylindrical, Vector3, Color, Line, Group, LineSegments, EllipseCurve, LineBasicMaterial, BufferGeometry, BufferAttribute } from 'three';
import NodeLayout from './NodeLayout';

const GEN_DIST = 6;
const CHILD_LINE_BASE = 4;
const BASE_RADIUS = 5;

const NODE_DIST_BASE = Math.PI * 0.25; // radian
const NODE_SIZE_BASE = Math.PI * 0.25; // radian
const THETA_OFFSET_BASE = Math.PI * -0.5;

class Layout {
    radius;
    nodeDist;
    nodeSize;
    thetaOffset;
    bending;

    constructor(bending = 1) {
      this.radius = BASE_RADIUS * bending;
      this.nodeDistance = NODE_DIST_BASE / bending;;
      this.nodeSize = NODE_SIZE_BASE / bending;;
      this.thetaOffset = THETA_OFFSET_BASE;
      this.bending = bending;
    }

    getEllipticCurve(start, end, color) {
      const material = new LineBasicMaterial({ color });
      const curve = new EllipseCurve(
        0,  0,          // ax, aY
        this.radius, this.radius, // xRadius, yRadius
        start,  end,    // aStartAngle, aEndAngle
        start > end,    // aClockwise
        this.thetaOffset,   // aRotation
      );
    
      const nPoints = Math.max(1, Math.abs(Math.ceil((end - start) / 0.25))) * 8;
    
      const points = curve.getPoints(nPoints);
      const geometry = new BufferGeometry().setFromPoints( points );
      return new Line( geometry, material );
    }

    getNodeLayout(root) {
      return new NodeLayout(root, {
        radius: this.radius,
        nodeDist: this.nodeDistance,
        genDist: GEN_DIST,
        nodeBaseSize: this.nodeSize,
      });
    }

  setOffset(rg, offset) {
    const vOffset = new Vector3().setFromCylindrical(offset);
    const lg = rg.children[0];

    lg.rotateY(-Math.PI * 0.5 + offset.theta);

    const v2 = new Vector3();
    rg.parent.getWorldPosition(v2);

    vOffset.x -= v2.x;
    vOffset.z -= v2.z;

    rg.position.copy(vOffset);
  }

  getVector(_x, y, z) {
    return new Cylindrical(this.radius, y, z);
  }

  getCameraPosition(target) {
    const cameraPosition = target.clone();
    const positionCyl = new Cylindrical().setFromVector3(cameraPosition);
    positionCyl.radius = this.radius + 9 + 5 * this.bending; // formaly this.radius + 14
    return new Vector3().setFromCylindrical(positionCyl);
  }

  getChildLines(s, t, config = { foreground, highlight, parent }) {
    const { foreground, highlight, parent} = config;

    const foreColor = new Color(foreground);
    const highColor = new Color(highlight);
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
  
    const v = new Vector3();
    parent.getWorldPosition(v);
    const offset = new Cylindrical().setFromVector3(v);

    const vOffset = new Vector3().setFromCylindrical(new Cylindrical(this.radius, offset.theta, 0));
    const start = (new Vector3().setFromCylindrical(new Cylindrical(this.radius, s.theta, s.y))).sub(vOffset);
    const end = (new Vector3().setFromCylindrical(new Cylindrical(this.radius, t.theta, 0))).sub(vOffset);
  
    points.push(start.clone());
    points.push(start.clone().add(new Vector3(0, CHILD_LINE_BASE - s.y, 0)));
    points.push(end.clone().add(new Vector3(0, CHILD_LINE_BASE, 0)));
    points.push(end.clone().add(new Vector3(0, CHILD_LINE_BASE + 0.5, 0)));
  
    const geometry = new BufferGeometry().setFromPoints( points );
    geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
    group.add(new LineSegments( geometry, material ));
  
    const cGroup = new Group();
    cGroup.position.sub(vOffset).add(new Vector3(0, CHILD_LINE_BASE, 0));
    cGroup.rotateX(this.thetaOffset);

    cGroup.add(this.getEllipticCurve(s.theta, t.theta, foreColor));
    group.add(cGroup);

    return group;
  }

  getPartnerLines(s, t, config = { foreground, highstart, highend }) {
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
  
    const group = new Group();

    const offset = new Vector3().setFromCylindrical(new Cylindrical(this.radius, s.theta, 0));
    const start = new Vector3();
    const end = (new Vector3().setFromCylindrical(new Cylindrical(this.radius, t.theta, 0))).sub(offset);

    const offsetBase = 1.2;

    points.push(start.clone().add(new Vector3(0, offsetBase, 0)));
    points.push(start.clone().add(new Vector3(0, s.y, 0)));
    points.push(end.clone().add(new Vector3(0, s.y, 0)));
    points.push(end.clone().add(new Vector3(0, offsetBase, 0)));
  
    const geometry = new BufferGeometry().setFromPoints( points );
    geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
    group.add(new LineSegments( geometry, material ));
  
    const cGroup = new Group();
    cGroup.position.sub(offset).add(new Vector3(0, s.y, 0));
    cGroup.rotateX(this.thetaOffset);

    cGroup.add(this.getEllipticCurve(s.theta, t.theta, foreColor));
    group.add(cGroup);
  
    return group;
  }
}

export function getCylindricalLayout(config = {}) {
  const { bending } = config;
  return new Layout(bending);
}
