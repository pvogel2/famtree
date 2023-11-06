import Person from '../../public/js/Person';
import PersonList from './PersonList';


describe('PersonList', () => {
    const p1 = { id: 1 };
    const p2 = { id: 2 };
    const p3 = { id: 3 };
    const p4 = { id: 4 };
    let IsolatedPersonList;
  
  beforeEach(async () => {
    jest.clearAllMocks();

    await jest.isolateModulesAsync(async () => {
      IsolatedPersonList = (await import('./PersonList.js')).default;
    });
  });

  describe('add', () => {
    it('adds person to list', () => {
        IsolatedPersonList.add(p1);

      const person = IsolatedPersonList.find(1);

      expect(person.id).toBe(p1.id);
    });
  });

  describe('find', () => {
    it('returns person if found', () => {
      IsolatedPersonList.add(p1);
      IsolatedPersonList.add(p2);

      const person = IsolatedPersonList.find(1);

      expect(person.id).toBe(p1.id);
    });

    it('returns independent instances', () => {
      IsolatedPersonList.add(p1);
      const personA = IsolatedPersonList.find(1);
      const personB = IsolatedPersonList.find(1);

      expect(personA).not.toBe(personB);
    });
  
    it('null otherwise', () => {
        PersonList.add(p1);
        PersonList.add(p2);
  
        const person = PersonList.find(3);
  
        expect(person).toBe(null);
    });
  });

  describe('filter', () => {
    it('returns array of persons containing matches for id', () => {
      IsolatedPersonList.add(p1);
      IsolatedPersonList.add(p2);

      const persons = IsolatedPersonList.filter((p) => p.id === 1);

      expect(persons).toHaveLength(1);
      expect(persons[0].id).toBe(1);
    });

    it('returns array of persons containing matches for lastName', () => {
      IsolatedPersonList.add({ ...p1, lastName: 'Swimmer' });
      IsolatedPersonList.add({ ...p2, lastName: 'Runner' });

      const persons = IsolatedPersonList.filter((p) => p.lastName === 'Runner');

      expect(persons).toHaveLength(1);
      expect(persons[0].id).toBe(2);
    });

    it('returns empty array for filter not set', () => {
      IsolatedPersonList.add(p1);
      IsolatedPersonList.add(p2);

      const persons = IsolatedPersonList.filter();

      expect(persons).toHaveLength(0);
    });

    it('returns all matches', () => {
      IsolatedPersonList.add({ ...p1, firstName: 'David', lastName: 'Swimmer' });
      IsolatedPersonList.add({ ...p2, lastName: 'Runner' });
      IsolatedPersonList.add({ ...p3, lastName: 'Raicer' });
      IsolatedPersonList.add({ ...p4, lastName: 'Jumper' });

      const persons = IsolatedPersonList.filter((p) => p.lastName.startsWith('R') || p.firstName === 'David');

      expect(persons).toHaveLength(3);
      expect(persons).toEqual([
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ id: 2 }),
        expect.objectContaining({ id: 3 }),
      ]);
    });
  });

  describe('remove', () => {
    it('removes person from list', () => {
      IsolatedPersonList.add(p1);

      IsolatedPersonList.remove(p1.id);
      const persons = IsolatedPersonList.filter((p) => !!p);

      expect(persons).toHaveLength(0);
    });

    it('does nothing for unkown person', () => {
      IsolatedPersonList.add(p1);

      IsolatedPersonList.remove(p2.id);
      const persons = IsolatedPersonList.filter((p) => !!p);

      expect(persons).toHaveLength(1);
    });
  });

  describe('allways returns instances of Person', () => {
    beforeAll(() => {
      PersonList.add(p1);
      PersonList.add(p2);
    });

    it('for find', () => {
      const person = PersonList.find(1);

      expect(person).toBeInstanceOf(Person);
    });

    it('for filter', () => {
      const persons = PersonList.filter((p) => p.id < 3);

      expect(persons[0]).toBeInstanceOf(Person);
      expect(persons[1]).toBeInstanceOf(Person);
    });
  });
});
