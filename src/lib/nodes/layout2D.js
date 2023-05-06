import { Vector3 } from 'three';
import getLayoutBase from './layoutBase';

const NODE_DIST = 6;
const NODE_SIZE = 6;
const NODE_OFF = 1.2;
const GEN_DIST = 6;

export default (renderer) => {
  const m = Object.assign(getLayoutBase(), {
    name: '2D',
    setRelationMinDist: (v) => v.add(new Vector3(0, 0, -NODE_DIST)),
    getChildSource: (idx, vTarget) => new Vector3(0, GEN_DIST / 3  - idx * 0.2, vTarget.z + NODE_DIST * 0.5),
    getInitialChildTarget: (vSource, childrenSize) => {
      const target = vSource.clone();
      target.setY(GEN_DIST);
       target.add(new Vector3(0, 0, childrenSize * 0.5));
      return target;
    },

    getCurrentChildTarget: (vCurrent, childSize, nRelation) => {
      const relationDistance = nRelation * 0.5 * NODE_SIZE;
      const target = vCurrent.clone();
      target.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
      target.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
      return target;
    },

    updateCurrentChildTarget(vCurrent, childSize) {
      vCurrent.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)
    },

    getRelationLines(source, target, offset, colors) {
      const ps = [];
      const cs = [];
      const { startColor, foreColor, endColor } = colors;

      ps.push(source.clone().add(new Vector3(0, NODE_OFF, 0)));
      ps.push(source.clone().add(offset));
      ps.push(target.clone().add(offset));
      ps.push(target.clone().add(new Vector3(0, NODE_OFF, 0)));

      cs.push(...startColor.toArray());
      cs.push(...foreColor.toArray());
      cs.push(...foreColor.toArray());
      cs.push(...endColor.toArray());

      return { points: ps, colors: cs };
    },

    getChildLines(source, maxSize, target, nRelations, colors) {
      const ps = [];
      const cs= [];
    
      const { foreColor, highColor } = colors;
  
      const dy = target.y - source.y;
      const dz = target.z - source.z;
    
      ps.push(source.clone());
      cs.push(...foreColor.toArray());
  
      if (dz !== 0) {
        ps.push(source.clone().add(new Vector3(0, dy * 0.5, 0)));
        ps.push(target.clone().sub(new Vector3(0, dy * 0.5, 0)));
        cs.push(...foreColor.toArray());
        cs.push(...foreColor.toArray());
      } else {
        ps.push(target.clone().sub(new Vector3(0, dy * 0.5, 0)));
        cs.push(...foreColor.toArray());
      }

      ps.push(target.clone());
      cs.push(...highColor.toArray());
  
      return { points: ps, colors: cs };
    },
  });

  return m;
};
