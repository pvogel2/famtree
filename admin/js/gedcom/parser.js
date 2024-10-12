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
    const ts = this.tokenize(raw);
    const tree = this.tree(ts);
    return tree;
  }

  tokenize(input) {
    const tokens = [];

    input.split(/[\r\n]+/).forEach((line) => {
      const match = line.match(re);
      if (match) {
        tokens.push({
          tag: match.groups.tag,
          level: Number(match.groups.level),
          id: match.groups.id || null,
          value: match.groups.value || null,
          children: [],
        });
      }
    });

    return tokens;
  }

  tree(tokens) {
    if (!tokens.length || tokens[0].level !== 0) {
      throw new Error('invalid source');
    }

    const tree = {
      children: [],
      level: -1,
    };
    const parents = [];
    do {
      const node = tokens.shift();
      parents[node.level] = node;
      if (node.level > 0) {
        // node.parent = parents[node.level - 1];
        // node.parent.children.push(node);
        parents[node.level - 1].children.push(node);
      } else {
        // node.parent = null;
        tree.children.push(node);
      }
    } while (tokens.length > 0);

    // console.log(tree);
    return tree;
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

  birth(r) {
    // console.log(r.current.tag, r.current.value, r.current.level, r.current.target);
  }

  date(r) {
    console.log(r.current.tag, r.current.value, r.current.level, r.current.target);
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
