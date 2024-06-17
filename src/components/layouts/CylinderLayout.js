import { Cylindrical, Vector3 } from 'three';


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


  static calcOffset(_x, y, z) {
    return new Cylindrical(RADIUS, y, z);
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

    if (this.rCount > 0 && length && this.childMinTheta <= this.rTarget.z) { // childMin is right side from relation target
      this.rTarget.theta = (this.childMinTheta + (childrenSize + NODE_DIST) * 0.5);
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
