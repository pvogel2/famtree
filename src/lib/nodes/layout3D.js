import { Vector3, Euler, ArrowHelper } from 'three';
import getLayoutBase from './layoutBase';

const NODE_DIST = 6;
const NODE_SIZE = 6;
const GEN_DIST = 6;

export default (renderer) => {
  const m = Object.assign(getLayoutBase(), {
  name: '3D',
  setRelationRotation: (vTarget, idx = 0, max = 1, partner, vMain, vSource) => {
    const initialAng = Math.PI; // initial layout in -z direction
    const offAng = Math.PI * 0.5 - idx * 2 * Math.PI / max;
    return new Euler(0, offAng, 0);
  },
  setRelationMinDist: (vTarget, idx = 0, max = 1, partner, vMain, vSource) => {
    const initialAng = Math.PI; // initial layout in -z direction
    const offAng = initialAng - Math.PI;

    const n = vMain.clone().sub(vSource).setY(0).normalize();

    const ang = offAng + idx * 2 * Math.PI / max;
    const d = new Vector3(Math.sin(ang) * NODE_DIST, 0, -Math.cos(ang) * NODE_DIST);

    vTarget.set(d.x, d.y, d.z);
  },
  getChildSource: (idx, vTarget) => {
    const n = vTarget.clone().setY(0).normalize();
    const cSource = new Vector3(vTarget.x - n.x * NODE_DIST * 0.5, GEN_DIST / 3, vTarget.z - n.z * NODE_DIST * 0.5);
    return cSource;
  },

  getInitialChildTarget: (cSource, childrenSize) => {
    // const n = vSource.clone().setY(0).normalize();
    const target = cSource.clone();
    target.setY(GEN_DIST);
    // target.add(new Vector3(n.x * NODE_DIST * 0.5, 0, n.z * NODE_DIST * 0.5));
    return target;
  },

  getCurrentChildTarget: (vCurrent, childSize, relationDistance, idx, max, vSource, child, maxChildSize) => {
    const vMain = vSource.clone().setY(0).normalize();
    const offAng = new Vector3(vMain.x, 0, vMain.z).angleTo(new Vector3(0, 0, -1)) * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1);

    const ang = offAng + idx * 2 * Math.PI / max;

    const n = (new Vector3(Math.sin(ang), 0, Math.cos(ang))).normalize();
    let offset = 0.5 * childSize;

    /* if (renderer) {
      const arrowHelper0 = new ArrowHelper(vSource, new Vector3(), 3, 0x0000ff );
      renderer.addObject(`dbg_a0_${child.id}`, arrowHelper0);

      const arrowHelper1 = new ArrowHelper(vMain, new Vector3(), 2, 0xff0000 );
      renderer.addObject(`dbg_a1_${child.id}`, arrowHelper1);

      const arrowHelper2 = new ArrowHelper(n, new Vector3(), 4, 0x00ff00 );
      renderer.addObject(`dbg_a2_${child.id}`, arrowHelper2);
    } */

    const childrenCenter = new Vector3(0.5 * maxChildSize * vMain.x, GEN_DIST - vSource.y, 0.5 * maxChildSize * vMain.z);
    const childOffset = new Vector3(n.x * offset, 0, n.z * offset);

    // console.log(idx,  childrenCenter, childOffset);

    return vSource.clone().add(childrenCenter).add(childOffset);
  },
  getChildRotation: (vCurrent, childSize, relationDistance, idx, max, vSource, child, maxChildSize) => {
    const vMain = vSource.clone().setY(0).normalize();
    const offAng = new Vector3(vMain.x, 0, vMain.z).angleTo(new Vector3(0, 0, -1)) * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1) - Math.PI * (max === 1 ? -0.5 : 0.5); //  * ((vMain.x > 0 && vMain.z > 0) ? -1 : 1);
    const ang = offAng + idx * 2 * Math.PI / max;
    // console.log(idx, max, ang);
    return new Euler(0, ang, 0);
  },
  updateCurrentChildTarget(vCurrent, childSize) {},
  });

  return m;
};
