import { Vector3 } from 'three';
import getLayoutBase from './layoutBase';

const NODE_DIST = 6;
const NODE_SIZE = 6;
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
  getCurrentChildTarget: (vCurrent, childSize, relationDistance) => {
    const target = vCurrent.clone();
    target.add(new Vector3(0, 0, -0.5 * childSize)); // shift right half child size
    target.add(new Vector3(0, 0, relationDistance)); // shift left offset if relations defined
    return target;
  },
  updateCurrentChildTarget(vCurrent, childSize) {
    vCurrent.add(new Vector3(0, 0, -childSize)); // shift right to end of current childSize (prepare for next child)
  },
});
  return m;
};
