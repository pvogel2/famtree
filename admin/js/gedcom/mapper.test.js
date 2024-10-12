import GedcomParser from './parser';
import GedcomMapper from './mapper';
import { RAW } from './data';

describe('The Gedcom Mapper', () => {
  it('is defined', () => {
    expect(GedcomMapper).toBeDefined();
  });

  it('is initialized correctly', () => {
    expect(() => {process.nextTick
      new GedcomMapper();
    }).not.toThrow();
  });

  it('maps head correctly', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);
    const mpr = new GedcomMapper(json);
    const r = mpr.getResult();
  
    expect(r.head).toEqual(expect.objectContaining({
      gedc: {
        version: '5.5.5',
        format: 'LINEAGE-LINKED',
      },
    }));
  });

  describe('maps individuals correctly', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);
    const mpr = new GedcomMapper(json);
    const r = mpr.getResult();
  
    it('and gets all items', () => {
      expect(r.individuals).toHaveLength(3);
    });

    it('with id and name parts', () => {
      const item = r.individuals[0];

      expect(item).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: 'Robert Eugene /Williams/',
        surn: 'Williams',
      }));
    });

    it('with birthday', () => {
      const item = r.individuals[0];

      expect(item).toEqual(expect.objectContaining({
        birthday: '2 Oct 1822',
      }));
    });

    it('with deathday', () => {
      const item = r.individuals[0];

      expect(item).toEqual(expect.objectContaining({
        deathday: '14 Apr 1905',
      }));
    });
  });

  describe('maps relations correctly', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);
    const mpr = new GedcomMapper(json);
    const r = mpr.getResult();

    it('and gets all items', () => {
      expect(r.relations).toHaveLength(2);
    });

    it('with members and children', () => {
      const item = r.relations[0];

      expect(item).toEqual(expect.objectContaining({
        id: expect.any(String),
        husb: expect.any(String),
        wife: expect.any(String),
        children: expect.arrayContaining([expect.any(String)]),
      }));
    });
  });

  describe('calling persons', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);

    it('returns an array of persons', () => {
      const mpr = new GedcomMapper(json);
      const ps = mpr.getPersons();

      expect(ps).toHaveLength(3);
    });

    it('persons to have new ids', () => {
      const mpr = new GedcomMapper(json);
      const ps = mpr.getPersons();
  
      expect(ps).toEqual(expect.arrayContaining([
        expect.objectContaining({id: -1}),
        expect.objectContaining({id: -2}),
        expect.objectContaining({id: -3}),
      ]));
    });

    it('set idMap correctly', () => {
      const mpr = new GedcomMapper(json);
  
      expect(mpr.idMap).toEqual(expect.objectContaining({'@I1@': -1, '@I2@': -2, '@I3@': -3}));
    });
  });

  describe('calling relations', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);

    it('returns an array of relations', () => {
      const mpr = new GedcomMapper(json);

      const rs = mpr.getRelations();

      expect(rs).toHaveLength(2);
    });
  });
});
