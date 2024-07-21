import GedcomParser from './parser';
import { RAW } from './data';

describe('The Gedcom Parser', () => {
  it('is defined', () => {
    expect(GedcomParser).toBeDefined();
  });

  it('is initialized correctly', () => {
    expect(() => {process.nextTick
      new GedcomParser();
    }).not.toThrow();
  });

  describe('parse',() => {
    it('returns a json object', () => {
      const gp = new GedcomParser();
      const json = gp.parse();

      expect(json).toBeDefined();
    });

    it('returns a head object', () => {
      const gp = new GedcomParser();
      const json = gp.parse(RAW);

      expect(json.head).toBeDefined();
      expect(json.head.gedc).toEqual(expect.objectContaining({ version: '5.5.5' }));
    });

    describe('returns individuals', () => {
      it('array object', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        expect(json.individuals).toBeDefined();
        expect(json.individuals).toHaveLength(3);
      });
  
      it('individual contain fields', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        const indiv = json.individuals[0];
  
        expect(indiv).toEqual(expect.objectContaining({ name: 'Robert Eugene /Williams/', surn: 'Williams' }));
      });
    });

    describe('returns relations', () => {
      it('array object', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        expect(json.relations).toBeDefined();
        expect(json.relations).toHaveLength(2);
      });
  
      it('relations contain fields', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        const rln = json.relations[0];
  
        expect(rln).toEqual(expect.objectContaining({ wife: expect.any(String), husb: expect.any(String), chil: expect.any(String) }));
      });
    });
  });
});
