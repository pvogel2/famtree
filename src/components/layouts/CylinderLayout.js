import { Vector3, Cylindrical } from 'three';


const NODE_DIST = 1.75; // radian
const NODE_SIZE = 0.5; // radian
const GEN_DIST = 4;
const RADIUS = 5;

export default class Layout {
  rTarget = new Cylindrical(RADIUS, NODE_DIST, 0);
  cTarget = new Cylindrical(RADIUS, NODE_DIST, 0);
  cSource = new Cylindrical(RADIUS, NODE_DIST, 0);
  rCount = 0;
  currentCTarget = new Cylindrical(RADIUS, NODE_DIST, 0);
  childMinZ = 0;
  nodeSize = NODE_SIZE;
  childrenSize = 0;
  childrenLength = 0;

  static getChildSize(id, szs) {
    const s = szs[id];
    if (!s) {
      return NODE_SIZE;
    }
    return s;
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
    this.rTarget.theta += -NODE_DIST;
    const length = this.childrenLength;
    const childrenSize = this.childrenSize;

    if (this.rCount > 0 && length && this.childMinZ <= this.rTarget.z) { // childMin is right side from relation target
      this.rTarget.theta = (this.childMinZ - (childrenSize + NODE_DIST) * 0.5);
    }
    this.childMinZ = this.rTarget.theta - childrenSize * 0.5;
  }

  setChildSource() {
    const v = new Cylindrical(RADIUS, this.rTarget.theta + NODE_DIST * 0.5, GEN_DIST / 3  - this.rCount * 0.2);
    this.cSource.copy(v);
  }

  setCurrentChildTarget() {
    const childrenSize = this.childrenSize;

    this.currentCTarget = this.cSource.clone();
    this.currentCTarget.y = GEN_DIST;
    this.currentCTarget.theta += childrenSize * 0.5;
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
    this.cTarget.thata += (-0.5 * childSize); // shift right half child size
    this.cTarget.thata += relationDistance; // shift left offset if relations defined

    this.currentCTarget.thata += -childSize; // shift right to end of current childSize (prepare for next child)
  }

  getPartnerOffset() {
    return {
      offsetX: this.rTarget.radius,
      offsetY: this.rTarget.y,
      offsetZ: this.rTarget.theta,
    };
  }

  getPartnerRelationOffset() {
    return {
      offsetX: 0,
      offsetY: this.cSource.y,
      offsetZ: 0,
    };
  }

  getPartnerRelationTarget() {
    return {
      targetX: this.rTarget.radius,
      targetY: this.rTarget.y,
      targetZ: this.rTarget.theta,
    };
  }

  getChildRelationTarget() {
    return {
      targetX: this.cTarget.radius,
      targetY: this.cTarget.y,
      targetZ: this.cTarget.theta,
    };
  }

  getChildRelationSource() {
    return {
      sourceX: this.cSource.radius,
      sourceY: this.cSource.y,
      sourceZ: this.cSource.theta,
    };
  }

  getPartnerChildOffset() {
    return {
      offsetX: 0,
      offsetY: this.cTarget.y,
      offsetZ: this.cTarget.theta,
    };
  }
}
