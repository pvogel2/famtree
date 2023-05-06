import { Vector3, Euler, ArrowHelper } from 'three';
import getLayoutBase from './layoutBase';

const NODE_DIST = 6;
const NODE_OFF = 1.2;
const NODE_SIZE = 6;
const GEN_DIST = 6;

export default (renderer) => {
  const m = Object.assign(getLayoutBase(), {
    name: '3D',
    setRelationRotation: (vTarget, idx = 0, max = 1, partner, vMain, vSource) => {
      const offAng = Math.PI * 0.5 - idx * 2 * Math.PI / max;
      return new Euler(0, offAng, 0);
    },

    setRelationMinDist: (vTarget, idx = 0, max = 1, partner, vMain, vSource) => {
      const initialAng = Math.PI; // initial layout in -z direction
      const offAng = initialAng - Math.PI;

      const ang = offAng + idx * 2 * Math.PI / max;
      const d = new Vector3(Math.sin(ang) * NODE_DIST, 0, -Math.cos(ang) * NODE_DIST);

      vTarget.set(d.x, d.y, d.z);
    },

    getChildSource: (idx, vTarget, maxChildSize) => {
      const n = vTarget.clone().setY(0).normalize();
      // const offset = NODE_SIZE - 0.5 * maxChildSize;
      // const cSource = new Vector3(vTarget.x - n.x * offset, GEN_DIST / 3, vTarget.z - n.z * offset);
      const offset = NODE_SIZE * 0.5; // offset from relation target
      const cSource = new Vector3(vTarget.x - n.x * offset, GEN_DIST / 3, vTarget.z - n.z * offset);

      // console.log('childSource:', cSource);

      return cSource;
    },

    getInitialChildTarget: (cSource, childrenSize) => {
      // const n = vSource.clone().setY(0).normalize();
      const target = cSource.clone();
      target.setY(GEN_DIST);
      // target.add(new Vector3(n.x * NODE_DIST * 0.5, 0, n.z * NODE_DIST * 0.5));
      return target;
    },

    getCurrentChildTarget: (vCurrent, childSize, nRelations, idx, max, vSource, child, maxChildSize) => {
      const vMain = vSource.clone().setY(0).normalize();
      const offAng = new Vector3(vMain.x, 0, vMain.z).angleTo(new Vector3(0, 0, -1)) * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1);

      const ang = offAng + idx * 2 * Math.PI / max;

      const n = (new Vector3(Math.sin(ang), 0, Math.cos(ang))).normalize();
      let offset = max > 1 ? (0.5 * childSize) : 0;

      /* if (renderer) {
        const arrowHelper0 = new ArrowHelper(vSource, new Vector3(), 3, 0x0000ff );
        renderer.addObject(`dbg_a0_${child.id}`, arrowHelper0);

        const arrowHelper1 = new ArrowHelper(vMain, new Vector3(), 2, 0xff0000 );
        renderer.addObject(`dbg_a1_${child.id}`, arrowHelper1);

        const arrowHelper2 = new ArrowHelper(n, new Vector3(), 4, 0x00ff00 );
        renderer.addObject(`dbg_a2_${child.id}`, arrowHelper2);
      } */

      const centerOffset = nRelations > 1 ? maxChildSize - NODE_SIZE * 0.5 : 0; // offset from relation target (maxSize minus left border size)

      const childrenCenter = new Vector3(vMain.x * centerOffset, 0, vMain.z * centerOffset);

      const childOffset = new Vector3(n.x * offset, GEN_DIST - vSource.y, n.z * offset);

      return vSource.clone().add(childrenCenter).add(childOffset);
    },
  
    getChildRotation: (vCurrent, childSize, nRelations, idx, max, vSource, child, maxChildSize) => {
      const vMain = vSource.clone().setY(0).normalize();
      const offAng = new Vector3(vMain.x, 0, vMain.z).angleTo(new Vector3(0, 0, -1)) * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1) - Math.PI * (max === 1 ? -0.5 : 0.5); //  * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1);
      const ang = offAng + idx * 2 * Math.PI / max;
      return new Euler(0, ang, 0);
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
      const main = source.clone().setY(0).normalize();
      const center = nRelations > 1 ?  maxSize - NODE_SIZE * 0.5 : 0; // offset from relation target (maxSize minus left border size)
      const childrenCenter = new Vector3(main.x * center, 0, main.z * center);


      const ps = [];
      const cs= [];
    
      const { foreColor, highColor } = colors;
  
      const dy = target.y - source.y;
      const dz = target.z - source.z;
    
      ps.push(source.clone());
      cs.push(...foreColor.toArray());
  
      if (dz !== 0) {
        ps.push(source.clone().add(new Vector3(0, dy * 0.25, 0)));
        ps.push(source.clone().add(new Vector3(childrenCenter.x, dy * 0.25, childrenCenter.z)));
        ps.push(source.clone().add(new Vector3(childrenCenter.x, dy * 0.5, childrenCenter.z)));
        ps.push(target.clone().sub(new Vector3(0, dy * 0.5, 0)));
        cs.push(...foreColor.toArray());
        cs.push(...foreColor.toArray());
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
