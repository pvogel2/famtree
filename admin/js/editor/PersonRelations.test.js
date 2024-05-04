import PersonRelations from "./PersonRelations";
import Relation from "../Relation";


describe('The PersonRelations', () => {
  const person = {name: 'person', id: 1, firstName: 'First', lastName: 'Last', deathday: '2023-11-02', birthday: '2023-11-01' };
  const partner1 = { name: 'partner1', id: 2, firstName: 'PartnerFirst1', lastName: 'PartnerLast1' };
  const partner2 = { name: 'partner2', id: 3, firstName: 'PartnerFirst2', lastName: 'PartnerLast2' };

  const relations = [
    {
      id: 1,
      start: null,
      end: null,
      children: [],
      members: [person.id, partner1.id],
    },
    {
      id: 2,
      start: null,
      end: null,
      children: [],
      members: [person.id, partner2.id],
    },
  ];

  it('is defined', () => {
    expect(PersonRelations).toBeDefined();
  });

  it('is initialized correctly', () => {
    expect(() => {process.nextTick
      new PersonRelations();
    }).not.toThrow();
  });

  describe('calling getFirst', () => {
    it('return null for empty relations', () => {
      const rs = new PersonRelations();

      expect(rs.getFirst()).toBe(null);
    });

    it('returns first relation if set', () => {
      const rs = new PersonRelations();
      const partnerId = relations[0].members[1];
      const relationId = relations[0].id;
      rs.set(relations);

      const r1 = rs.getFirst();

      expect(r1).toBeInstanceOf(Relation);
      expect(r1.id).toBe(relationId);
      expect(r1.hasMember(partnerId)).toBe(true);
    });
  });

  describe('calling setDeleted', () => {
    it('does nothing if not found', () => {
      const rs = new PersonRelations();

      expect(() => rs.setDeleted(3)).not.toThrow();
    });

    it.each([relations[0].id, `${relations[0].id}`])('set deleted for relation using id %o', (id) => {
      const rs = new PersonRelations();
      rs.set(relations);

      rs.setDeleted(id);
      const r1 = rs.getFirst();

      expect(r1.deleted).toBe(true);
    });
  });

  describe('calling add', () => {
    it('adds relation', () => {
      const rs = new PersonRelations();

      const result = rs.add(relations[0]);

      expect(result).toEqual(true);
      expect(rs.getFirst().id).toEqual(1);
    });

    it('add relation twice does not work', () => {
      const rs = new PersonRelations();

      rs.add(relations[0]);
      const result = rs.add(relations[0]);

      expect(result).toEqual(false);
    });
  });

  describe('calling addChild', () => {
    const childId = 10;

    it('does nothing if not found', () => {
      const rs = new PersonRelations();

      expect(() => rs.addChild(3, childId)).not.toThrow();
    });

    it.each([relations[0].id, `${relations[0].id}`])('addChild for relation using id %o', (id) => {
      const rs = new PersonRelations();
      rs.set(relations);

      rs.addChild(id, childId);
      const r1 = rs.getFirst();

      expect(r1.children.includes(childId)).toBe(true);
    });
  });

  describe('calling removeChild', () => {
    const childId = 10;
    const otherRelations = [{ ...relations[0]}];
    otherRelations[0].children = [childId];

    it('does nothing if not found', () => {
      const rs = new PersonRelations();

      expect(() => rs.removeChild(3, childId)).not.toThrow();
    });

    it.each([otherRelations[0].id, `${otherRelations[0].id}`])('addChild for relation using id %o', (id) => {
      const rs = new PersonRelations();
      rs.set(otherRelations);

      rs.removeChild(id, childId);
      const r1 = rs.getFirst();

      expect(r1.children.includes(childId)).toBe(false);
    });
  });

  describe('calling getMembers', () => {
    it('returns empty array for no relations', () => {
      const rs = new PersonRelations();

      const result = rs.getMembers();
      expect(result).toHaveLength(0);
    });

    it('returns array of tuples for relations', () => {
      const rs = new PersonRelations();
      rs.set(relations);

      const result = rs.getMembers(person.id);
      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining(
          [expect.objectContaining({ rId: expect.anything(), mId: expect.anything()})]
        )
      );
    });
  });

  describe('calling sanitize', () => {
    const otherRelations = [{ ...relations[0]}, { ...relations[1]}];
    otherRelations[0].deleted = true;

    it('does nothing for no relations', () => {
      const rs = new PersonRelations();

      expect(() => rs.sanitize()).not.toThrow();
    });

    it('removes deleted relations', () => {
      const rs = new PersonRelations();
      rs.set(otherRelations);

      rs.sanitize();

      expect(rs.getFirst().id).toEqual(2);
    });

    it('sets modified to false', () => {
      const rs = new PersonRelations();
      const rl = { ...otherRelations[1], modified: true };
      rs.set([rl]);

      rs.sanitize();

      expect(rs.getFirst().modified).toEqual(false);
    });
  });

  describe('calling hasRelation', () => {
    const unknownRId = 100;
    it('returns false for no relations', () => {
      const rs = new PersonRelations();

      expect(rs.hasRelation(partner2.id)).toEqual(false);
    });

    it('returns false if person not found', () => {
      const rs = new PersonRelations();
      rs.set(relations);

      expect(rs.hasRelation(unknownRId)).toEqual(false);
    });

    it('returns true if person is found', () => {
      const rs = new PersonRelations();
      rs.set(relations);

      expect(rs.hasRelation(partner2.id)).toEqual(true);
    });
  });
});
