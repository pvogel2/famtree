import { Vector3, Color, Line, LineBasicMaterial, BufferGeometry, BufferAttribute } from 'three';


const NODE_DIST = 6;
const NODE_SIZE = 6;
const GEN_DIST = 6;

const CAMERA_OFFSET = new Vector3(14, 0, 0);

export default class Layout {
  rTarget = new Vector3();
  cTarget = new Vector3();
  cSource = new Vector3();
  rCount = 0;
  currentCTarget = new Vector3();
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

  static getVector(x, y, z) {
    return new Vector3(x, y, z);
  }

  static setOffset(rg, offset) {
    rg.position.add(offset);
  }

  static getCameraPosition(target) {
    const cameraPosition = target.clone();
    cameraPosition.add(CAMERA_OFFSET);

    return cameraPosition;
  }

  static getChildLines(s, t, config = { foreground, highlight }) {
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
  
  static getPartnerLines(s, t, config = { foreground, highstart, highend }) {
    const foreColor = new Color(config.foreground);
    const startColor = new Color(config.highstart);
    const endColor = new Color(config.highend);
  
    const material = new LineBasicMaterial({
      vertexColors: true,
    });
    const points = [];
    const colors = [];
  
    const start = new Vector3();

    points.push(start.clone().add(new Vector3(0, 1.2, 0)));
    points.push(s.clone());
    points.push(t.clone().add(s));
    points.push(t.clone().add(new Vector3(0, 1.2, 0)));
  
    colors.push(...startColor.toArray());
    colors.push(...foreColor.toArray());
    colors.push(...foreColor.toArray());
    colors.push(...endColor.toArray());
  
    const geometry = new BufferGeometry().setFromPoints( points );
    geometry.setAttribute( 'color', new BufferAttribute( new Float32Array(colors), 3 ) );
    return new Line( geometry, material );
  }
  
  updateNodeSize(children, sizes) {
    this.setChildrenGroupSize(children, sizes);

    const oldTotalSize = this.nodeSize;
    if (this.nodeSize < this.childrenSize) {
      this.nodeSize = this.childrenSize;
    }

    if (this.nodeSize < oldTotalSize + NODE_SIZE) { // minimum if relation existent
      this.nodeSize += NODE_SIZE;
    }
  }

  updateRelationTarget() {
    this.rTarget.add(new Vector3(0, 0, -NODE_DIST));
    const length = this.childrenLength;
    const childrenSize = this.childrenSize;

    if (this.rCount > 0 && length && this.childMinZ <= this.rTarget.z) { // childMin is right side from relation target
      this.rTarget.setZ(this.childMinZ - childrenSize * 0.5);
    }
    this.childMinZ = this.rTarget.z - childrenSize * 0.5;
  }

  setChildSource() {
    const v = new Vector3(0, GEN_DIST / 3  - this.rCount * 0.2, this.rTarget.z + NODE_DIST * 0.5);
    this.cSource.set(v.x, v.y, v.z);
  }

  setCurrentChildTarget() {
    const childrenSize = this.childrenSize;
    this.currentCTarget = this.cSource.clone();
    this.currentCTarget.setY(GEN_DIST);
    this.currentCTarget.add(new Vector3(0, 0, childrenSize * 0.5));
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

    const relationDistance = relationsLength ? relationsLength * NODE_SIZE * 0.5 : 0;

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
