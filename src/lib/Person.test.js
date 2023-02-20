import Person from './Person.js';

const properties = [
  {
    key: 'name',
    default: 'firstName lastName',
    config: { firstName: 'Peter', lastName: 'Vogel' },
    expect: 'Peter Vogel',
    setter: false,
  },
  {
    key: 'firstName',
    default: 'firstName',
    config: { firstName: 'Peter', },
    expect: 'Peter',
    setter: true,
  },
  {
    key: 'surNames',
    default: '',
    config: { surNames: 'Peter Parker', },
    expect: 'Peter Parker',
    setter: true,
  },
  {
    key: 'lastName',
    default: 'lastName',
    config: { lastName: 'Vogel', },
    expect: 'Vogel',
    setter: true,
  },
  {
    key: 'birthName',
    default: '',
    config: { birthName: 'Hain', },
    expect: 'Hain',
    setter: true,
  },
  {
    key: 'birthday',
    default: null,
    config: { birthday: '1972-03-29' },
    expect: '70675200000',
    setter: true,
  },
  {
    key: 'deathday',
    default: null,
    config: { deathday: '2200-01-01' },
    expect: '7258118400000',
    setter: true,
  },
];

const lists = [
  {
    key: 'relations',
    add: 'addRelation',
    remove: 'removeRelation',
    has: 'hasRelations'
  },
];

it('creates instance', () => {
  const node = new Person({ id: 'p1' });
  expect(node).toBeInstanceOf(Person);
});

it('throws error if no id is provided', () => {
  expect(() => {
    new Person();
  }).toThrow();
});

it('equals returns true for same Person', () => {
  const node = new Person({ id: 'p1' });
    expect(node.equals(node)).toEqual(true);
});

it('if id is provided its used', () => {
  const node = new Person({ id: 'p1' });
    expect(node.id).toEqual('p1');
});

describe.each(lists)('for list property $key', (lp) => {
  it('is defined', () => {
    const node = new Person({ id: 'p1' });
    expect(node[lp.key]).toEqual(expect.any(Array));
  });

  it('is setup with configured items', () => {
    const node = new Person({ id: 'p1', [lp.key]: ['p2'] });
    expect(node[lp.key]).toEqual(['p2']);
  });

  it('adds an item', () => {
    const node = new Person({ id: 'p1' });
    const newId = 'p2';
    node[lp.add](newId);
    expect(node[lp.key]).toHaveLength(1);
    expect(node[lp.key][0]).toEqual(newId);
  });

  it('removes an item', () => {
    const newId = 'p2';
    const node = new Person({ id: 'p1', [lp.key]: [newId] });
    node[lp.remove](newId);
    expect(node[lp.key]).toHaveLength(0);
  });

  it('items can not be changed from outside', () => {
    const newId = 'p2';
    const node = new Person({ id: 'p1', [lp.key]: [newId] });
    node[lp.key].pop();

    expect(node[lp.key]).toHaveLength(1);
  });

  it('items are unique', () => {
    const node = new Person({ id: 'p1' });
    const newId = 'p2';
    node[lp.add](newId);
    node[lp.add](newId);
    expect(node[lp.key]).toHaveLength(1);
  });

  it('check for items returns false if empty', () => {
    const node = new Person({ id: 'p1' });
    expect(node[lp.has]()).toEqual(false);
  });

  it('check for items returns true if items', () => {
    const node = new Person({ id: 'p1' });
    const newId = 'p2';
    node[lp.add](newId);
    expect(node[lp.has]()).toEqual(true);
  });
});

describe.each(properties)('for property $key', (prop) => {
  it('defines name property', () => {
    const node = new Person({ ...prop.config, id: 'p1' });

    expect(node[prop.key]).toEqual(prop.expect);
  });

  it('defines defaults', () => {
    expect((new Person({ id: 'p1' }))[prop.key]).toEqual(prop.default);
  });
});

describe.each(properties.filter(p => p.setter))('for property $key', (prop) => {
  it('has a setter', () => {
    const p = new Person({ id: 'p1' });
    p[prop.key] = prop.config[prop.key];
    expect(p[prop.key]).toEqual(prop.config[prop.key]);
  });
});

it('serialize returns serialiable person data', () => {
  const person = new Person({ id: 'p1' });
  const data = person.serialize();
  expect(data).toEqual(expect.objectContaining({
    id: 'p1',
    firstName: expect.any(String),
    lastName: expect.any(String),
    birthday: null,
    deathday: null,
    relations: expect.any(Array),
  }));
});

describe('hasDetails', () => {
  it.each([
    { key: 'birthday', value: 1 },
    { key: 'deathday', value: 2 },
  ])('returns true for property $key', ({ key, value }) => {
    const node = new Person({ [key]: value, id: 'p1' });

    expect(node.hasDetails()).toBe(true);
  });

  it('returns false for no detail found', () => {
    const node = new Person({ id: 'p1' });

    expect(node.hasDetails()).toBe(false);
  });
});
