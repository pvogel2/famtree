import runtimeReducer, { setPoint } from './_runtimeReducer';

const defaultConfig = { move: null };

it('should return the initial state', () => {
  expect(runtimeReducer(undefined, {})).toEqual(expect.objectContaining(defaultConfig));
});

it('should return the mousemove point', () => {
  const p = { x: 100, y: 100 };
  expect(runtimeReducer(defaultConfig, setPoint(p))).toEqual(expect.objectContaining({ move: { ...p }}));
});
