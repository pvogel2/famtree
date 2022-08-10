import personsReducer, { addPerson, setPersons, updatePerson, updatePersons } from './personsReducer';
import U, { getDefaultPerson } from '../lib/tests/utils';

test('should return the initial state', () => {
  const person = getDefaultPerson();
  expect(personsReducer(undefined, {})).toEqual([expect.objectContaining(person.serialize())]);
});

test('should return the set list of persons', () => {
  const previeousState = [];
  expect(personsReducer(previeousState, setPersons([1,2,3]))).toEqual([1,2,3]);
});

test('adds new person to persons', () => {
  const person = U.getPerson();
  const previeousState = [];
  expect(personsReducer(previeousState, addPerson(person.serialize()))).toEqual([expect.objectContaining(person.serialize())]);
});

test('should change the data of a stored person', () => {
  const person = U.getPerson();
  const previeousState = [person];
  const updatedPerson = U.clonePerson(person);
  personsReducer(previeousState, updatePerson(updatedPerson));
});

test('should change the data of multiple stored persons', () => {
  const personA = U.getPerson();
  const personB = U.getPerson();
  const previeousState = [personA, personB];
  const updatedPersonA = U.clonePerson(personA);
  const updatedPersonB = U.clonePerson(personB);
  personsReducer(previeousState, updatePersons([updatedPersonA, updatedPersonB]));
});

