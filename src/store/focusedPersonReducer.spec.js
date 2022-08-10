import focusedPersonReducer, { setPerson, clearPerson } from './focusedPersonReducer';
import U from '../lib/tests/utils';

test('should return the initial state', () => {
  expect(focusedPersonReducer(undefined, {})).toEqual(null);
});

test('should return the focused person', () => {
  const person = U.getPerson();
  const previeousState = null;
  expect(focusedPersonReducer(previeousState, setPerson(person.serialize()))).toEqual(expect.objectContaining(person.serialize()));
});

test('should return the cleared state', () => {
  const previeousState = U.getPerson().serialize();
  expect(focusedPersonReducer(previeousState, clearPerson())).toBe(null);
});

