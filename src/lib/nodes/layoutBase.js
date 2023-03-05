import { Euler } from 'three';
// layout interface
export default () => ({
  debugRenderer: null,
  name: 'base',
  getChildRotation: () => new Euler(),
  setRelationRotation: () => new Euler(),
  setRelationMinDist: (v) => {},
  getChildSource: (idx, vTarget) => vTarget.clone(),
  getInitialChildTarget: (vSource, childrenSize) => vSource.clone(),
  getCurrentChildTarget: (vCurrent, childSize, relationDistance) => vCurrent.clone(),
  updateCurrentChildTarget(vCurrent, childSize) {},
});
