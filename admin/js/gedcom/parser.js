export const TAGS = {
  HEAD: 'head',//
  INDI: 'indi',//
  FAM: 'fam',//
  GEDC: 'gedc',//
  VERS: 'version',//
  NAME: 'name',//
  GIVN: 'givn',
  SURN: 'surn',//
  HUSB: 'husb',//
  WIFE: 'wife',//
  CHIL: 'chil',//
  BIRT: 'birth',
  DEAD: 'death',
  DATE: 'date',
  FORM: 'form',//
  TRLR: 'trlr',//
};

const re = new RegExp(/^(?<level>^\d+)\s((?<id>\@[a-zA-Z0-9]+\@)\s)?(?<tag>[a-zA-Z]+)(\s(?<value>.*))?/);

// https://gedcom.io/specifications/ged551.pdf
// https://www.familysearch.org/en/wiki/GEDCOM

export default class GedcomParser {
  parse(raw = '') {
    const result = {
      individuals: [],
      relations: [],
      current: {},
      tags: raw.split(/[\r\n]+/),
    };

    do {
      if (this.parseLine(result)) {
        if (this[result.current.tag]) {
          this[result.current.tag](result);
        }
      }
    } while (result.tags.length > 0);
  
    return result;
  }

  parseLine(result) {
    const line = result.tags.shift();
    const match = line.match(re);

    if (match) {
      result.current.tag = TAGS[match.groups.tag] || null;
      result.current.level = Number(match.groups.level);
      result.current.id = match.groups.id || null;
      result.current.value = match.groups.value || null;
    }
    return !!match;
  }

  /**
   * @param {*} r 
   * required for LINEAGE-LINKED
   * requires SOUR, DEST, SUBM, GEDC, CHAR
   */
  head(r) { // required
    if (r.current.level === 0) {
      r.head = {};
    }
    r.current.target = r.head;
  }

  trlr(r) { // required
    if (r.current.level === 0) {
      r.trlr = {};
    }
    r.current.target = r.head;
  }

  indi(r) {
    const indi = { id: r.current.id };
    if (r.current.level === 0) {
      r.individuals.push(indi);
    }
    r.current.target = indi;
  }

  /**
   * @param {*} r
   * requires VERS, FORM
   */
  gedc(r) {
    const target = {};
    r.current.target[TAGS.GEDC] = target;
    r.current.target = target;
  }

  version(r) {
    this.addValue(r.current, TAGS.VERS);
  }

  name(r) {
    this.addValue(r.current, TAGS.NAME);
  }

  surn(r) {
    this.addValue(r.current, TAGS.SURN);
  }

  fam(r) {
    const fam = { id: r.current.id };
    if (r.current.level === 0) {
      r.relations.push(fam);
    }
    r.current.target = fam;
  }

  wife(r) {
    this.addValue(r.current, TAGS.WIFE);
  }

  husb(r) {
    this.addValue(r.current, TAGS.HUSB);
  }

  chil(r) {
    this.addValue(r.current, TAGS.CHIL);
  }

  /**
   * @param {*} r
   * requires value 'LINEAGE-LINKED'
   */
  form(r) {
    this.addValue(r.current, TAGS.FORM);
  }
  addValue(c, tg) {
    c.target[tg] = c.value;
  }
}
