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

  describe('calling persons', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);

    it('returns an array of persons', () => {
      const mpr = new GedcomMapper(json);
      const ps = mpr.persons();

      expect(ps).toHaveLength(3);
    });

    it('persons to have new ids', () => {
      const mpr = new GedcomMapper(json);
      const ps = mpr.persons();
  
      expect(ps).toEqual(expect.arrayContaining([
        expect.objectContaining({id: -1}),
        expect.objectContaining({id: -2}),
        expect.objectContaining({id: -3}),
      ]));
    });

    it('set idMap correctly', () => {
      const mpr = new GedcomMapper(json);
      mpr.persons();
  
      expect(mpr.idMap).toEqual(expect.objectContaining({'@I1@': -1, '@I2@': -2, '@I3@': -3}));
    });
  });

  describe('calling relations', () => {
    const gp = new GedcomParser();
    const json = gp.parse(RAW);

    it('returns an array of relations', () => {
      const mpr = new GedcomMapper(json);
      mpr.persons();

      const rs = mpr.relations();

      expect(rs).toHaveLength(2);
    });
  });
});
