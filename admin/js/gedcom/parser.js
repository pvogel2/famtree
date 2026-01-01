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
      const match = line.trim().match(re);

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
        parents[node.level - 1].children.push(node);
      } else {
        tree.children.push(node);
      }
    } while (tokens.length > 0);

    return tree;
  }
}
