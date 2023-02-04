import Relation from './Relation.js';

it('creates instance', () => {
  const rl = new Relation({ id: 1 });
  expect(rl).toBeInstanceOf(Relation);
});    

it('throws error if no id is provided', () => {
  expect(() => {
    new Relation();
  }).toThrow();
});

it('equals returns true for same Relation', () => {
  const rl = new Relation({ id: 1 });
    expect(rl.equals(rl)).toEqual(true);
});

it('if id is provided its used', () => {
  const rl = new Relation({ id: 1 });
    expect(rl.id).toEqual(1);
});

const properties = [
  {
    key: 'start',
    default: null,
    config: '01.01.1901',
  },
  {
    key: 'end',
    default: null,
    config: '01.01.1901',
  },
  {
    key: 'type',
    config: 'partership',
    default: null,
  },
];

const lists = [
  {
    key: 'members',
    add: 'addMember',
    remove: 'removeMember',
    has: 'hasMembers',
    next: 'nextMember',
    prev: 'prevMember',
  },
  {
    key: 'children',
    add: 'addChild',
    remove: 'removeChild',
    has: 'hasChildren',
    next: 'nextChild',
    prev: 'prevChild',
  },
];

describe.each(lists)('for list property $key', (lp) => {
  it('is defined', () => {
    const rl = new Relation({ id: 1 });
    expect(rl[lp.key]).toEqual(expect.any(Array));
  });

  it('is setup with configured items', () => {
    const rl = new Relation({ id: 1, [lp.key]: [2] });
    expect(rl[lp.key]).toEqual([2]);
  });

  it('adds an item', () => {
    const rl = new Relation({ id: 1 });
    const newId = 2;
    rl[lp.add](newId);
    expect(rl[lp.key]).toHaveLength(1);
    expect(rl[lp.key][0]).toEqual(newId);
  });

  it('removes an item', () => {
    const newId = 2;
    const rl = new Relation({ id: 1, [lp.key]: [newId] });
    rl[lp.remove](newId);
    expect(rl[lp.key]).toHaveLength(0);
  });

  it('items can not be changed from outside', () => {
    const newId = 2;
    const rl = new Relation({ id: 1, [lp.key]: [newId] });
    rl[lp.key].pop();

    expect(rl[lp.key]).toHaveLength(1);
  });

  it('items are unique', () => {
    const rl = new Relation({ id: 1 });
    const newId = 2;
    rl[lp.add](newId);
    rl[lp.add](newId);
    expect(rl[lp.key]).toHaveLength(1);
  });

  it('check for items returns false if empty', () => {
    const rl = new Relation({ id: 1 });
    expect(rl[lp.has]()).toEqual(false);
  });

  it('check for items returns true if items', () => {
    const rl = new Relation({ id: 1 });
    const newId = 2;
    rl[lp.add](newId);
    expect(rl[lp.has]()).toEqual(true);
  });

  describe(`${lp.next}`, () => {
    const items = [10, 4];
    const unkownId = 11;

    it('returns null for no items', () => {
      const rl = new Relation({ id: 1 });
      const nId = rl[lp.next]();
      expect(nId).toBe(null);
    });
  
    it('returns first item for no id given', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const nId = rl[lp.next]();
      expect(nId).toBe(items[0]);
    });
  
    it('returns null if item is not found', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const nId = rl[lp.next](unkownId);
      expect(nId).toBe(null);
    });
  
    it('returns next item if id is found', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const nId = rl[lp.next](items[0]);
      expect(nId).toBe(items[1]);
    });
  
    it('returns null if id is last item', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const lastId = items[items.length - 1];
      const nId = rl[lp.next](lastId);
      expect(nId).toBe(null);
    });
  });

  describe(`${lp.prev}`, () => {
    const items = [10, 4];
    const unkownId = 11;

    it('returns null for no items', () => {
      const rl = new Relation({ id: 1 });
      const pId = rl[lp.prev]();
      expect(pId).toBe(null);
    });
  
    it('returns last item for no id given', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const pId = rl[lp.prev]();
      expect(pId).toBe(items[items.length - 1]);
    });
  
    it('returns null if item is not found', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const pId = rl[lp.prev](unkownId);
      expect(pId).toBe(null);
    });
  
    it('returns prev item if id is found', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const pId = rl[lp.prev](items[1]);
      expect(pId).toBe(items[0]);
    });
  
    it('returns null if id is first item', () => {
      const rl = new Relation({ id: 1, [lp.key]:items });
      const firstId = items[0];
      const pId = rl[lp.prev](firstId);
      expect(pId).toBe(null);
    });
  });
});

describe.each(properties)('for property $key', (prop) => {
  it('has a default', () => {
    const rl = new Relation({ id: 1 });
    expect(rl[prop.key]).toBe(prop.default);
  });

  it('has a setter', () => {
    const rl = new Relation({ id: 1 });
    rl[prop.key] = prop.config;
    expect(rl[prop.key]).toBe(prop.config);
  });
});

it('serialize returns serialiable relation data', () => {
  const rl = new Relation({ id: 1 });
  const data = rl.serialize();

  expect(data).toEqual(expect.objectContaining({
    id: 1,
    type: null,
    start: null,
    end: null,
    children: expect.any(Array),
    members: expect.any(Array),
  }));
});