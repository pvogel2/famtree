import { Cylindrical, Vector3 } from 'three';


export default class NodeLayout {
    constructor(root, dimensions) {
      const v2 = new Vector3();
      root.getWorldPosition(v2);
      const v = new Cylindrical().setFromVector3(v2);

      this.radius = dimensions.radius;
      this.nodeDist = dimensions.nodeDist;
      this.nodeSize = dimensions.nodeBaseSize;
      this.nodeBaseSize = dimensions.nodeBaseSize;
      this.genDist = dimensions.genDist;

      this.offset = new Cylindrical(this.radius, v.theta, 0);
  
      this.rTarget = new Cylindrical(this.radius, 0, 0);
      this.cTarget = new Cylindrical(this.radius, 0, 0);
      this.cSource = new Cylindrical(this.radius, 0, 0);
      this.currentCTarget = new Cylindrical(this.radius, 0, 0);

      this.rCount = 0;
      this.childrenSize = 0;
      this.childMinTheta = 0;
    }

    getChildSize(id, szs) {
      const s = szs[id];
      if (!s) {
        return this.nodeSize;
      }
      return s;
    }
  
    setChild(child, sizes) {
      const childSize = this.getChildSize(child.id, sizes);
      const relationsLength = child.relations.length;
  
      const relationDistance = relationsLength ? relationsLength * 0.5 * this.nodeSize : 0;
  
      this.cTarget = this.currentCTarget.clone();
      this.cTarget.theta += (0.5 * childSize); // shift right half child size
      this.cTarget.theta -= relationDistance; // shift left offset if relations defined
  
      this.currentCTarget.theta += childSize; // shift right to end of current childSize (prepare for next child)
    }
  
    setChildrenGroupSize(cs, szs) {
      this.childrenSize = cs.reduce((total, c) => {
        return total += this.getChildSize(c.id, szs);
      }, 0);
  
      this.childrenLength = cs.length;
    }

    updateNodeSize(children, sizes) {
      this.setChildrenGroupSize(children, sizes);
  
      const oldTotalSize = this.nodeSize;
      if (this.nodeSize < this.childrenSize) {
        this.nodeSize = this.childrenSize;
      }
    
      if (this.nodeSize < oldTotalSize + this.nodeBaseSize) { // minimum if relation existent
        this.nodeSize += this.nodeBaseSize;
      }
    }
    
    updateRelationTarget() {
      this.rTarget.theta += this.nodeDist;
      const length = this.childrenLength;
      const childrenSize = this.childrenSize;
  
      if (this.rCount > 0 && length && this.childMinTheta >= this.rTarget.theta) { // childMin is right side from relation target
        this.rTarget.theta = (this.childMinTheta + (childrenSize) * 0.5);
      }
  
      this.childMinTheta = this.rTarget.theta + childrenSize * 0.5;
    }
  
    setChildSource() {
      const v = new Cylindrical(this.radius, this.rTarget.theta - this.nodeDist * 0.5, this.genDist / 3  - this.rCount * 0.2);
      this.cSource.copy(v);
    }
  
    setCurrentChildTarget() {
      const childrenSize = this.childrenSize;
  
      this.currentCTarget = this.cSource.clone();
      this.currentCTarget.y = this.genDist;
      this.currentCTarget.theta -= childrenSize * 0.5;
    }
  
    setRelation(children, sizes) {
      this.setChildrenGroupSize(children, sizes);
      this.updateRelationTarget();
      this.setChildSource();
      this.setCurrentChildTarget();
      this.rCount++;
    }

    getPartnerOffset() {
        return {
          offsetX: this.radius,
          offsetY: this.rTarget.theta + this.offset.theta,
          offsetZ: this.rTarget.y,
        };
      }    
      getPartnerRelationOffset() {
        return {
          offsetX: this.radius,
          offsetY: this.offset.theta,
          offsetZ: this.cSource.y,
        };
      }
    
      getPartnerRelationTarget() {
        return {
          targetX: this.radius,
          targetY: this.rTarget.theta + this.offset.theta,
          targetZ: this.rTarget.y,
        };
      }
    
      getChildRelationTarget() {
        return {
          targetX: this.radius,
          targetY: this.cTarget.theta + this.offset.theta,
          targetZ: this.cTarget.y,
        };
      }
    
      getChildRelationSource() {
        return {
          sourceX: this.radius,
          sourceY: this.cSource.theta + this.offset.theta,
          sourceZ: this.cSource.y,
        };
      }
    
      getPartnerChildOffset() {
        return {
          offsetX: this.radius,
          offsetY: this.cTarget.theta + this.offset.theta,
          offsetZ: this.cTarget.y,
        };
      }
  }
  