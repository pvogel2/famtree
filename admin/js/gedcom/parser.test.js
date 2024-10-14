import GedcomParser from './parser';
import { RAW } from './data';

describe('The Gedcom Parser', () => {
  function filterTag(node, tag) {
    return node?.children.filter((c) =>c.tag === tag);
  };

  it('is defined', () => {
    expect(GedcomParser).toBeDefined();
  });

  it('is initialized correctly', () => {
    expect(() => {process.nextTick
      new GedcomParser();
    }).not.toThrow();
  });

  describe('parse',() => {
    it('throws error on invalid source', () => {
      const gp = new GedcomParser();

      expect(gp.parse).toThrow();
    });

    it('returns a head object', () => {
      const gp = new GedcomParser();
      const json = gp.parse(RAW);

      const head = filterTag(json, 'HEAD')[0];
      const gedc = filterTag(head, 'GEDC')[0];

      expect(head).toBeDefined();
      expect(gedc).toBeDefined();
    });

    it('returns a trlr object', () => {
      const gp = new GedcomParser();
      const json = gp.parse(RAW);

      const trlr = filterTag(json, 'TRLR')[0];

      expect(trlr).toBeDefined();
    });

    it('for header found returns reuqired fields', () => {
      const gp = new GedcomParser();
      const json = gp.parse(RAW);
      const head = filterTag(json, 'HEAD')[0];
      const gedc = filterTag(head, 'GEDC')[0];
      const form = filterTag(gedc, 'FORM')[0];
      
      expect(form).toEqual(expect.objectContaining({ value: 'LINEAGE-LINKED' }));
    });

    describe('returns individuals', () => {
      it('array object', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);

        const indis = filterTag(json, 'INDI');
        expect(indis).toBeDefined();
        expect(indis).toHaveLength(3);
      });
  
      /* it('individual contains name and surname', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        const indiv = json.individuals[0];
  
        expect(indiv).toEqual(expect.objectContaining({ id: expect.any(String), name: 'Robert Eugene /Williams/', surn: 'Williams' }));
      });

      it('individual contains birthday', () => {
        const gp = new GedcomParser();
        const json = gp.parse(RAW);
  
        const indiv = json.individuals[0];
  
        expect(indiv).toEqual(expect.objectContaining({ id: expect.any(String), birth: expect.anything() }));
      });*/
    });

    /*describe('returns relations', () => {
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
    });*/
  });
});
