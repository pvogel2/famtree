import { Vector3 } from 'three';


const NODE_DIST = 6;
const NODE_SIZE = 6;
const GEN_DIST = 6;

export default class Layout {
  rTarget = new Vector3();
  cTarget = new Vector3();
  cSource = new Vector3();
  currentCTarget = new Vector3();
  childMinZ = 0;
  nodeSize = NODE_SIZE;
  childrenGroupSize = 0;
  childrenGroupLength = 0;

  static getChildSize(id, szs) {
    const s = szs[id];
    if (!s) {
      return NODE_SIZE;
    }
    return s;
  }
  
    setChildrenGroupSize(cs, szs) {
    this.childrenGroupSize = cs.reduce((total, c) => {
      return total += Layout.getChildSize(c.id, szs);
    }, 0);
    this.childrenGroupLength = cs.lnegth;
  }

  updateNodeSize(children, sizes) {
    this.setChildrenGroupSize(children, sizes);

    const oldTotalSize = this.nodeSize;
    if (this.nodeSize < this.childrenGroupSize) {
      this.nodeSize = this.childrenGroupSize;
    }

    if (this.nodeSize < (oldTotalSize + NODE_SIZE)) { // minimum if relation existent
      this.nodeSize += NODE_SIZE;
    }
  }

  updateRelationTarget(idx) {
    this.rTarget.add(new Vector3(0, 0,  -NODE_DIST));
    const length = this.childrenGroupLength;
    const childrenSize = this.childrenGroupSize;

    if (idx > 0 && length && this.childMinZ <= this.rTarget.z) { // childMin is right side from relation target
      this.rTarget.setZ(this.childMinZ - (childrenSize + NODE_DIST) * 0.5);
    }
    this.childMinZ = this.rTarget.z - childrenSize * 0.5;
  }

  setChildSource(idx) {
    const v = new Vector3(0, GEN_DIST / 3  - idx * 0.2, this.rTarget.z + NODE_DIST * 0.5);
    this.cSource.set(v.x, v.y, v.z);
  }

  setCurrentChildTarget() {
    const childrenSize = this.childrenGroupSize;

    this.currentCTarget = this.cSource.clone();
    this.currentCTarget.setY(GEN_DIST);
    this.currentCTarget.add(new Vector3(0, 0, childrenSize * 0.5));
  }

  setRelation(children, sizes, idx) {
    this.setChildrenGroupSize(children, sizes);
    this.updateRelationTarget(idx);
    this.setChildSource(idx);
    this.setCurrentChildTarget();
  };

  setChild(child, sizes) {
    const childSize = Layout.getChildSize(child.id, sizes);
    const relationsLength = child.relations.length;

    const relationDistance = relationsLength ? relationsLength * 0.5 * NODE_SIZE : 0;

    this.cTarget = this.currentCTarget.clone();
    this.cTarget.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
    this.cTarget.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined

    this.currentCTarget.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)
  }

  getPartnerOffset() {
    return {
      offsetX: this.rTarget.x,
      offsetY: this.rTarget.y,
      offsetZ: this.rTarget.z,
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
      targetX: this.rTarget.x,
      targetY: this.rTarget.y,
      targetZ: this.rTarget.z,
    };
  }

  getChildRelationTarget() {
    return {
      targetX: this.cTarget.x,
      targetY: this.cTarget.y,
      targetZ: this.cTarget.z,
    };
  }

  getChildRelationSource() {
    return {
      sourceX: this.cSource.x,
      sourceY: this.cSource.y,
      sourceZ: this.cSource.z,
    };
  }

  getPartnerChildOffset() {
    return {
      offsetX: 0,
      offsetY: this.cTarget.y,
      offsetZ: this.cTarget.z,
    };
  }
}
