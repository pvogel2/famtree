import familyReducer, { setFounder } from './familyReducer';

it('should return the initial state', () => {
  expect(familyReducer(undefined, {})).toEqual(null);
});

it('should set the current founder', () => {
  const previeousState = '';
  const founderId = '2';
  expect(familyReducer(previeousState, setFounder('2'))).toEqual(parseInt(founderId));
});
