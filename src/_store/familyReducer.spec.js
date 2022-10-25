import familyReducer, { setFamily } from './familyReducer';

it('should return the initial state', () => {
  expect(familyReducer(undefined, {})).toEqual('default');
});

it('should set the current family', () => {
  const previeousState = '';
  expect(familyReducer(previeousState, setFamily('book'))).toEqual('book');
});
