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
  getRelationLines(source, target, offset, colors) {
    const ps = [];
    const cs = [];
    const { startColor, endColor } = colors;
  
    ps.push(source.clone());
    ps.push(target.clone());
  
    cs.push(...startColor.toArray());
    cs.push(...endColor.toArray());

    return { points: ps, colors: cs };
  },

  getChildLines(source, maxSize, target, colors) {
    const ps = [];
    const cs= [];
  
    const { foreColor, highColor } = colors;

    ps.push(source.clone());
    cs.push(...foreColor.toArray());

    ps.push(target.clone());
    cs.push(...highColor.toArray());

    return { points: ps, colors: cs };
  },
});
