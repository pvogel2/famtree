import Person from './Person.js';

describe('Person class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws no error for no data', () => {
    expect(() => new Person()).not.toThrow();
  });

  it.each(['', 'x', null, undefined])('sets id to null for %o', (id) => {
    const p = new Person({ id });
    expect(p.id).toBe(null);
  });

  it.each([0, 1, '0', '1'])('treats id the right way for %o', (id) => {
    const p = new Person({ id });
    expect(p.id).toBe(parseInt(id));
  });

  describe.each(['firstName', 'surNames', 'lastName', 'birthName'])('Property %s', (part) => {
    it.each([
      { value: 'X', result: 'X' },
      { value: '  X', result: 'X' },
      { value: 'X  ', result: 'X' },
    ])(' returns correclty formatted value', ({ value, result }) => {
      const p = new Person({ id: 1, [part]: value });
      expect(p[part]).toBe(result);
    });
  });

  describe('name property', () => {
    it.each([
      { firstName: 'X', full: 'X' },
      { surNames: 'Y', full: 'Y' },
      { lastName: 'Z', full: 'Z' },
      { firstName: 'X ', full: 'X' },
      { surNames: '  Y', full: 'Y' },
      { lastName: 'Z ', full: 'Z' },
      { firstName: 'X', lastName: 'Z', full: 'X Z' },
      { firstName: 'X', surNames: 'Y', lastName: 'Z', full: 'X Y Z' },
    ])('name returns full name $name for partials', (names) => {
      const p = new Person({ id: 1, ...names });
      expect(p.name).toBe(names.full);
    });
  });
});

describe('Person.add', () => {
  const p1 = { id: 1, v: 'value' };
  const p2 = { id: 2, v: 'value' };
  let IsolatedPerson;
    
  beforeEach(async () => {
    jest.clearAllMocks();
    await jest.isolateModulesAsync(async () => {
      IsolatedPerson = (await import('./Person.js')).default;
    });
  });

  it('adds person to static list', () => {
    IsolatedPerson.add(p1);

    expect(IsolatedPerson.all['1']).toEqual(expect.objectContaining({ ...p1, root: false }));
  });

  it('removes person from static list', () => {
    IsolatedPerson.add(p1);

    IsolatedPerson.remove(1);

    expect(IsolatedPerson.all['1']).not.toBeDefined();
  });

  it('does nothing when property is not defined', () => {
    expect(() => IsolatedPerson.remove(2)).not.toThrow();
  });

  describe('Person.find', () => {
    it('returns null when id not found', () => {
      const p = IsolatedPerson.find(p1.id);

      expect(p).toBe(null);
    });

    it('returns instance when id is found', () => {
      IsolatedPerson.add(p1);

      const p = IsolatedPerson.find(p1.id);
  
      expect(p).toBeInstanceOf(IsolatedPerson);
      expect(p.id).toBe(p1.id);
    });
  });

  describe('Person.filter', () => {
    it('returns empty array when nothing found', () => {
      const ps = IsolatedPerson.filter((p) => true);

      expect(ps).toHaveLength(0);
    });

    it('returns array with all instances', () => {
      IsolatedPerson.add(p1);
      IsolatedPerson.add(p2);

      const ps = IsolatedPerson.filter((p) => true);
  
      expect(ps).toHaveLength(2);
      expect(ps).toEqual(expect.arrayContaining([expect.any(IsolatedPerson), expect.any(IsolatedPerson)]));
    });
  });
});

