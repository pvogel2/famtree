import GedcomParser from './index';

// https://gedcom.io/specifications/ged551.pdf
const RAW = `0 HEAD
1 GEDC
2 VERS 5.5.5
2 FORM LINEAGE-LINKED
3 VERS 5.5.5
1 CHAR UTF-8
1 SOUR GS
2 NAME GEDCOM Specification
2 VERS 5.5.5
2 CORP gedcom.org
3 ADDR
4 CITY LEIDEN
3 WWW www.gedcom.org
1 DATE 2 Oct 2019
2 TIME 0:00:00
1 FILE 555Sample.ged
1 LANG English
1 SUBM @U1@
0 @U1@ SUBM
1 NAME Reldon Poulson
1 ADDR
2 ADR1 1900 43rd Street West
2 CITY Billings
2 STAE Montana
2 POST 68051
2 CTRY United States of America
1 PHON +1 (406) 555-1232
0 @I1@ INDI
1 NAME Robert Eugene /Williams/
2 SURN Williams
2 GIVN Robert Eugene
1 SEX M
1 BIRT
2 DATE 2 Oct 1822
2 PLAC Weston, Madison, Connecticut, United States of America
2 SOUR @S1@
3 PAGE Sec. 2, p. 45
1 DEAT
2 DATE 14 Apr 1905
2 PLAC Stamford, Fairfield, Connecticut, United States of America
1 BURI
2 PLAC Spring Hill Cemetery, Stamford, Fairfield, Connecticut, United States of America
1 FAMS @F1@
1 FAMS @F2@
1 RESI
2 DATE from 1900 to 1905
0 @I2@ INDI
1 NAME Mary Ann /Wilson/
2 SURN Wilson
2 GIVN Mary Ann
1 SEX F
1 BIRT
2 DATE BEF 1828
2 PLAC Connecticut, United States of America
1 FAMS @F1@
0 @I3@ INDI
1 NAME Joe /Williams/
2 SURN Williams
2 GIVN Joe
1 SEX M
1 BIRT
2 DATE 11 Jun 1861
2 PLAC Idaho Falls, Bonneville, Idaho, United States of America
1 FAMC @F1@
1 FAMC @F2@
2 PEDI adopted
1 ADOP
2 DATE 16 Mar 1864
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
1 MARR
2 DATE Dec 1859
2 PLAC Rapid City, Pennington, South Dakota, United States of America
0 @F2@ FAM
1 HUSB @I1@
1 CHIL @I3@
0 @S1@ SOUR
1 DATA
2 EVEN BIRT, DEAT, MARR
3 DATE FROM Jan 1820 TO DEC 1825
3 PLAC Madison, Connecticut, United States of America
2 AGNC Madison County Court
1 TITL Madison County Birth, Death, and Marriage Records
1 ABBR Madison BMD Records
1 REPO @R1@
2 CALN 13B-1234.01
0 @R1@ REPO
1 NAME Family History Library
1 ADDR
2 ADR1 35 N West Temple Street
2 CITY Salt Lake City
2 STAE Utah
2 POST 84150
2 CTRY United States of America
0 TRLR`;

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
      const gp = new GedcomParser(RAW);
      const json = gp.parse();

      expect(json.head).toBeDefined();
      expect(json.head.gedc).toEqual(expect.objectContaining({ version: '5.5.5' }));
    });

    it('returns an individuals array object', () => {
      const gp = new GedcomParser(RAW);
      const json = gp.parse();

      expect(json.individuals).toBeDefined();
      expect(json.individuals).toHaveLength(3);
    });

    it('individual contain fields', () => {
      const gp = new GedcomParser(RAW);
      const json = gp.parse();

      const indiv = json.individuals[0];
// console.log(indiv);
      expect(indiv).toEqual(expect.objectContaining({ name: 'Robert Eugene /Williams/', surn: 'Williams' }));
    });
  });
});
