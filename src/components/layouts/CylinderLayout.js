import { Cylindrical, Vector3, Color, Line, Group, LineSegments, EllipseCurve, LineBasicMaterial, BufferGeometry, BufferAttribute } from 'three';

const NODE_DIST = Math.PI * 0.25; // radian
const NODE_SIZE = Math.PI * 0.25; // radian
const GEN_DIST = 6;
const RADIUS = 5;

export default class Layout {
  rTarget = new Cylindrical(RADIUS, 0, 0);
  cTarget = new Cylindrical(RADIUS, 0, 0);
  cSource = new Cylindrical(RADIUS, 0, 0);
  offset = new Cylindrical(RADIUS, 0, 0);
  rCount = 0;
  currentCTarget = new Cylindrical(RADIUS, 0, 0);
  childMinTheta = 0;
  nodeSize = NODE_SIZE;
  childrenSize = 0;
  childrenLength = 0;

  constructor(root) {
    if (root) {
      const v2 = new Vector3();
      root.getWorldPosition(v2);
      const v = new Cylindrical().setFromVector3(v2);
      this.offset = new Cylindrical(RADIUS, v.theta, 0);
    }
  }

  static getChildSize(id, szs) {
    const s = szs[id];
    if (!s) {
      return NODE_SIZE;
    }
    return s;
  }

  static setOffset(rg, offset) {
    const vOffset = new Vector3().setFromCylindrical(offset);
    const lg = rg.children[0];

    lg.rotateY(-Math.PI * 0.5 + offset.theta);

    const v2 = new Vector3();
    rg.parent.getWorldPosition(v2);

    vOffset.x -= v2.x;
    vOffset.z -= v2.z;

    rg.position.copy(vOffset);
  }

  static calcOffset(_x, y, z) {
    return new Cylindrical(RADIUS, y, z);
  }

  static getCameraPosition(target) {
    const cameraPosition = target.clone();
    const positionCyl = new Cylindrical().setFromVector3(cameraPosition);
    positionCyl.radius = 19;
    return new Vector3().setFromCylindrical(positionCyl);
  }

  static getChildLines(s, t, config = { foreground, highlight, offset }) {
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
  
    points.push(start.clone());
    points.push(start.clone().add(new Vector3(0, GEN_DIST - 2 - s.y, 0)));
  
    points.push(end.clone().add(new Vector3(0, 4, 0)));
    points.push(end.clone().add(new Vector3(0, 4.5, 0)));
  
    const lsGeometry = new BufferGeometry().setFromPoints( points );
    lsGeometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
    group.add(new LineSegments( lsGeometry, material ));
  
    const cGroup = new Group();
    cGroup.position.sub(vOffset).add(new Vector3(0, 4, 0));
    cGroup.rotateX(Math.PI * -0.5);
    const startCyl = s.theta;
    const endCyl = t.theta;
    const curve = new EllipseCurve(
      0,  0,             // ax, aY
      RADIUS, RADIUS,    // xRadius, yRadius
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

  static getPartnerLines(s, t, config = { foreground, highstart, highend, offset: new Cylindrical() }) {
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
  
    const vOffset = new Vector3().setFromCylindrical(new Cylindrical(config.offset.radius, config.offset.theta, 0));
    const start = (new Vector3().setFromCylindrical(new Cylindrical(s.radius, s.theta, 0))).sub(vOffset);
    const end = (new Vector3().setFromCylindrical(new Cylindrical(t.radius, t.theta, 0))).sub(vOffset);
  
    const offsetBase = 1.2;
    const offsetUp = config.offset.y;
    points.push(new Vector3().copy(start).add(new Vector3(0, offsetBase, 0)));
    points.push(new Vector3().copy(start).add(new Vector3(0, offsetUp, 0)));
  
    points.push(new Vector3().copy(end).add(new Vector3(0, offsetUp, 0)));
    points.push(new Vector3().copy(end).add(new Vector3(0, offsetBase, 0)));
  
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
      RADIUS, RADIUS,              // xRadius, yRadius
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
  
  setChildrenGroupSize(cs, szs) {
    this.childrenSize = cs.reduce((total, c) => {
      return total += Layout.getChildSize(c.id, szs);
    }, 0);

    this.childrenLength = cs.length;
  }

  updateNodeSize(children, sizes) {
    this.setChildrenGroupSize(children, sizes);

    const oldTotalSize = this.nodeSize;
    if (this.nodeSize < this.childrenSize) {
      this.nodeSize = this.childrenSize;
    }
  
    if (this.nodeSize < (oldTotalSize + NODE_SIZE)) { // minimum if relation existent
      this.nodeSize += NODE_SIZE;
    }
  }

  updateRelationTarget() {
    this.rTarget.theta += NODE_DIST;
    const length = this.childrenLength;
    const childrenSize = this.childrenSize;

    if (this.rCount > 0 && length && this.childMinTheta >= this.rTarget.theta) { // childMin is right side from relation target
      this.rTarget.theta = (this.childMinTheta + (childrenSize) * 0.5);
    }

    this.childMinTheta = this.rTarget.theta + childrenSize * 0.5;
  }

  setChildSource() {
    const v = new Cylindrical(RADIUS, this.rTarget.theta - NODE_DIST * 0.5, GEN_DIST / 3  - this.rCount * 0.2);
    this.cSource.copy(v);
  }

  setCurrentChildTarget() {
    const childrenSize = this.childrenSize;

    this.currentCTarget = this.cSource.clone();
    this.currentCTarget.y = GEN_DIST;
    this.currentCTarget.theta -= childrenSize * 0.5;
  }

  setRelation(children, sizes) {
    this.setChildrenGroupSize(children, sizes);
    this.updateRelationTarget();
    this.setChildSource();
    this.setCurrentChildTarget();
    this.rCount++;
  };

  setChild(child, sizes) {
    const childSize = Layout.getChildSize(child.id, sizes);
    const relationsLength = child.relations.length;

    const relationDistance = relationsLength ? relationsLength * 0.5 * NODE_SIZE : 0;

    this.cTarget = this.currentCTarget.clone();
    this.cTarget.theta += (0.5 * childSize); // shift right half child size
    this.cTarget.theta -= relationDistance; // shift left offset if relations defined

    this.currentCTarget.theta += childSize; // shift right to end of current childSize (prepare for next child)
  }

  getPartnerOffset() {
    return {
      offsetX: RADIUS,
      offsetY: this.rTarget.theta + this.offset.theta,
      offsetZ: this.rTarget.y,
    };
  }

  getPartnerRelationOffset() {
    return {
      offsetX: RADIUS,
      offsetY: this.offset.theta,
      offsetZ: this.cSource.y,
    };
  }

  getPartnerRelationTarget() {
    return {
      targetX: RADIUS,
      targetY: this.rTarget.theta + this.offset.theta,
      targetZ: this.rTarget.y,
    };
  }

  getChildRelationTarget() {
    return {
      targetX: RADIUS,
      targetY: this.cTarget.theta + this.offset.theta,
      targetZ: this.cTarget.y,
    };
  }

  getChildRelationSource() {
    return {
      sourceX: RADIUS,
      sourceY: this.cSource.theta + this.offset.theta,
      sourceZ: this.cSource.y,
    };
  }

  getPartnerChildOffset() {
    return {
      offsetX: RADIUS,
      offsetY: this.cTarget.theta + this.offset.theta,
      offsetZ: this.cTarget.y,
    };
  }
}
