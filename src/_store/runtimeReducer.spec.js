import runtimeReducer, { setPoint } from './runtimeReducer';

const defaultConfig = { move: null };

it('should return the initial state', () => {
  expect(runtimeReducer(undefined, {})).toEqual(expect.objectContaining(defaultConfig));
});

test('should return the mousemove point', () => {
  const p = { x: 100, y: 100 };
  expect(runtimeReducer(defaultConfig, setPoint(p))).toEqual(expect.objectContaining(p));
});
